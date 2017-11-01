#! /usr/bin/ruby

require 'fastly'
require 'yaml'
require 'getoptlong'
require 'pry'
require 'syslog/logger'

# Constants definitions

# Default location for the credentials yaml
# ewww globals
$creds_file = ENV['HOME'] + '/.fastly/api-creds.yaml'
$debug = false

# Argument values
OPTS = GetoptLong.new(
  ['--environment', '-e', GetoptLong::REQUIRED_ARGUMENT],
  ['--help', '-h', GetoptLong::NO_ARGUMENT],
  ['--creds-file', '-c', GetoptLong::OPTIONAL_ARGUMENT],
  ['--debug', '-d', GetoptLong::NO_ARGUMENT]
  )

TYPES = {'js': "text/javascript", 'html': 'text/html', 'css': 'text/css'}

# Defaults
file_path = File.dirname(__FILE__) + '/../src/'
fastly_env = :test
spew = Syslog::Logger.new 'json-deploy'

# Reads the credentials
def read_creds(creds_file=$creds_file)
  creds_handle = File.open(creds_file, 'r')
  YAML.safe_load(creds_handle.read, [String, Symbol], [])
rescue Exception => e
  puts 'failed to read creds: ' + e.message
ensure
  creds_handle.close
end

# Prints out a help message.
def show_help
  message = 'Usage: uploader.rb [-h --help] '
  message << '[-e --environment live|stage] '
  message << '[-c --creds-file file] '
  message << '[-d --debug] '
  message << 'path-to-upload-files'
  puts message
  exit
end

# Runs over command arguments and sets values from them.
def process_arguments
  OPTS.each do |arg, value|
    case arg
    when '--help'
      show_help
    when '--environment'
      fastly_env = value != 'live' ? :test : :live
    when '--creds-file'
      #binding.pry
      $creds_file = value
    when '--debug'
      $debug = true
    end
  end
end

#
# Main Code starts here
#

# error out if the command was bad
if ARGV.empty?
  puts 'Not enough Arguments'
  show_help
end

# grab the src path from the command
files_path = ARGV.pop if ARGV.length > 1

# read arguments and fetch data
process_arguments

# set up the auth credentials
creds = read_creds($creds_file)

# create a Fastly to make calls
client = Fastly.new(api_key: creds[fastly_env][:token])

spew.info 'Fastly client created and auth ' + (client.authed? ? 'succeeded' : 'failed') if $debug

# get the service and clone the latest version
s = client.get_service(creds[fastly_env][:service_id])
v = s.versions.last.clone

# stash current dir and change to source one
old_dir = Dir.getwd
Dir.chdir(files_path)

# Loop over files and directories
Dir.glob('*').each do |f|
  # for each file
  spew.info('File: ' + f)
  # see if the condition and response exist
  new_name = f.gsub(/\//, '_')
  create_new = true
  begin
    # If either of these causes an exception assume they don't exist
    client.get_condition(service_id=s.id, version=v.number, name=new_name)
  rescue Fastly::Error => e
    args = {
      service_id:s.id,
      version:v.number,
      name:new_name,
      type:'request',
      statement: 'req.url == "/' + f + '"'
    }
    client.create_condition(args)
    spew.info('Created condition: ' + new_name)  
  end
  begin
    client.get_response_object(service_id=s.id, version=v.number, name=new_name)
    # update the content
    resp.content = File.read(f)
    # upload to API
    client.update_response_object(resp)

    spew.info('Updated file ' + f)
  rescue Fastly::Error => e
    # compose the response data
    args = {
      service_id:s.id,
      version:v.number,
      name:new_name,
      request_condition:new_name,
      content_type:(TYPES[File.extname(f)]),
      content:File.read(f),
      status:200,
      response:'OK'
    }
    # create the response
    client.create_response_object(args)
    spew.info('Created file: ' + new_name + ' from ' + f)
  end
end

# go back to the previous directory
Dir.chdir(old_dir)

# activate the service
v.activate!

spew.info('Activated version ' + v.number.to_s + ' in ' + (fastly_env == :live ? 'live' : 'test') + '. https://manage.fastly.com/configure/services/' + s.id + '/versions/' + v.number.to_s)