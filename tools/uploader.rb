#! /usr/bin/ruby

require "fastly"
require "yaml"

# Constants
CREDS_FILE = ENV['HOME'] + "/.fastly/api-creds.yaml"

creds = YAML.load(File.read(CREDS_FILE))

f = Fastly.new(api_key: creds[:token])

puts f.authed?
puts f.current_user
puts f.current_customer

#s = f.search_services(name: 'json-generate')
#puts s