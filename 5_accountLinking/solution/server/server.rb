require 'rubygems'
require 'bundler/setup'
require 'oauth'
require 'sinatra'
require 'twitter'
require 'rack/ssl-enforcer'
require 'dotenv'
Dotenv.load
CALLBACK_URL    = ENV['CALLBACK_URL']
set :session_secret, ENV['SESSION_SECRET']
set :show_exceptions, true
enable :sessions

use Rack::SslEnforcer
use Rack::Session::Cookie, key: '_rack_session',
                           path: '/',
                           expire_after: 2_592_000, # In seconds
                           secret: settings.session_secret

get '/oauth/request_token' do
  session[:consumer_key]         = consumer_key
  session[:consumer_secret]      = consumer_secret
  request_token = consumer.get_request_token oauth_callback: CALLBACK_URL
  session[:request_token]        = request_token.token
  session[:request_token_secret] = request_token.secret
  session[:state]                = params[:state]
  session[:client_id]            = params[:client_id]
  session[:vendor_id]            = vendor_id
  puts request_token
  redirect request_token.authorize_url
end

get '/oauth/callback' do
  request_token = OAuth::RequestToken.new consumer,
                                          session[:request_token],
                                          session[:request_token_secret]
  access_token = access_token(request_token)
  puts access_token.inspect
  url = redirect_url(access_token)
  puts url
  redirect url
end

get '/app' do
  File.read(File.join('public', 'app.html'))
end
get '/policy' do
  File.read(File.join('public', 'privacy-policy.html'))
end

private

def consumer
  @consumer ||= OAuth::Consumer.new consumer_key,
                                    consumer_secret,
                                    site: 'https://api.twitter.com'
end

def vendor_id
  params[:vendor_id] || ENV['VENDOR_ID']
end


def consumer_key
  params[:consumer_key] || ENV['CONSUMER_KEY']
end

def consumer_secret
  params[:consumer_secret] || ENV['CONSUMER_SECRET']
end

def access_token(request_token)
  @access_token ||= request_token.get_access_token oauth_verifier: params[:oauth_verifier]
end

def redirect_url(access_token)
  'https://pitangui.amazon.com/spa/skill/account-linking-status.html?' \
  "vendorId=#{session[:vendor_id]}" \
  "#access_token=#{access_token.token},#{access_token.secret}" \
  "&state=#{session[:state]}" \
  "&client_id=#{session[:client_id]}" \
  '&response_type=Bearer'
end
