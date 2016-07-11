$stdout.sync = true
ENV['RACK_ENV'] = 'production'
require File.expand_path '../server.rb', __FILE__
run Sinatra::Application
