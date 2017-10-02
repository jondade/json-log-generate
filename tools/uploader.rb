#! /usr/bin/ruby

require 'fastly'
require 'yaml'
require 'getoptlong'

# Uploads new configuration and pages to json-generator services
module Uploader
  # Default location for the credentials yaml
  CREDS_FILE = ENV['HOME'] + '/.fastly/api-creds.yaml'

  # Argument values
  OPTS = GetoptLong.new(
    ['--environment', '-e', GetoptLong::REQUIRED_ARGUMENT],
    ['--help', '-h', GetoptLong::NO_ARGUMENT],
    ['--creds-file', '-c', GetoptLong::OPTIONAL_ARGUMENT]
  )

  # Module Variables
  # @!visibility private
  attr_accessor :creds, :fastly_env, :files_path

  # Reads the credentials
  def self.read_creds(creds_file = Uploader::CREDS_FILE)
    creds_handle = File.open(creds_file, 'r')
    self.creds = YAML.safe_load(creds_handle.read, [String], [])
  rescue e
    puts 'failed to read creds: ' + e.message
  ensure
    creds_handle.close
  end

  # Prints out a help message.
  def self.show_help
    message = 'Usage: uploader.rb [-h --help] '
    message << '[-e --environment live|stage] '
    message << '[-c --creds-file file] '
    message << 'path-to-upload-files'
    puts message
    exit
  end

  # Runs over command arguments and sets values from them.
  def self.process_arguments
    Uploader::OPTS.each do |arg, value|
      case arg
      when '--help'
        Uploader.show_help
      when '--environment'
        Uploader.fastly_env = value != 'live' ? :test : :live
      when '--creds-file'
        Uploader.creds = value
      end
    end
  end

  # Runs the upload
  def self.run
    if ARGV.empty?
      puts 'Not enough Arguments'
      show_help
    end
    Uploader.files_path = ARGV.pop
    Uploader.process_arguments
  end
end

Uploader.run if File.basename(__FILE__) == 'uploader.rb'
