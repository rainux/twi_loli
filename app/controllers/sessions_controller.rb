class SessionsController < ApplicationController
  before_filter :create_oauth_client, :only => [:oauth_login, :oauth_complete]

  def new
  end

  def create
    Twitter.auth = {
      :type => :basic,
      :username => params[:session][:username],
      :password => params[:session][:password]
    }
    store_credentials
  end

  def oauth_login
    request_token = @oauth_client.request_token(
      :oauth_callback => oauth_complete_url
    )
    session[:request_token] = request_token.token
    session[:request_token_secret] = request_token.secret
    redirect_to request_token.authorize_url

  rescue OAuth::Error => error
    flash[:error] = extract_error_message(error)
    logger.info error.backtrace.join("\n")
    redirect_to new_session_path
  end

  def oauth_complete
    access_token = @oauth_client.authorize(
      session[:request_token],
      session[:request_token_secret],
      :oauth_verifier => params[:oauth_verifier]
    )
    Twitter.auth = {
      :type => :oauth,
      :consumer_key => AppConfig.twitter.consumer_key,
      :consumer_secret => AppConfig.twitter.consumer_secret,
      :token => access_token.token,
      :token_secret => access_token.secret
    }
    store_credentials

  rescue OAuth::Unauthorized => error
    flash[:error] = extract_error_message(error)
    logger.info error.backtrace.join("\n")
    redirect_to new_session_path

  ensure
    session[:request_token] = nil
    session[:request_token_secret] = nil
  end

  def destroy
    session.clear
    redirect_to root_path
  end

  private
  def store_credentials
    Twitter.api = Grackle::Client::TWITTER_API_HOSTS_MAPPING[Twitter.auth[:type]]
    session[:user] = Twitter.account.verify_credentials?
    session[:user].delete 'status'
    session[:auth] = Twitter.auth
    redirect_back_or_default root_path

  rescue Grackle::TwitterError => error
    flash[:error] = extract_error_message(error)
    logger.info error.backtrace.join("\n")
    redirect_to new_session_path
  end

  def create_oauth_client
    @oauth_client = TwitterOAuth::Client.new(
      :ssl => true,
      :consumer_key => AppConfig.twitter.consumer_key,
      :consumer_secret => AppConfig.twitter.consumer_secret
    )
  end
end
