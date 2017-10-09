#! /usr/bin/ruby

require 'fastly'
require 'yaml'
require 'getoptlong'
require 'pry'

# Constants definitions

# Default location for the credentials yaml
CREDS_FILE = ENV['HOME'] + '/.fastly/api-creds.yaml'

# Argument values
OPTS = GetoptLong.new(
  ['--environment', '-e', GetoptLong::REQUIRED_ARGUMENT],
  ['--help', '-h', GetoptLong::NO_ARGUMENT],
  ['--creds-file', '-c', GetoptLong::OPTIONAL_ARGUMENT]
  )

# Defaults
file_path = File.dirname(__FILE__) + '/../src/'
fastly_env = :test

# Reads the credentials
def read_creds(creds_file = CREDS_FILE)
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
      creds = value
    end
  end
end

#
# Main Code starts here
#

if ARGV.empty?
  puts 'Not enough Arguments'
  show_help
end
files_path = ARGV.pop
creds = process_arguments
# binding.pry
client = Fastly.new(api_key: creds[])
