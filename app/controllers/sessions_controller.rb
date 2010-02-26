class SessionsController < ApplicationController
  def new
    oauth_instance.consumer_key = AppConfig[:twitter][:consumer_key]
    oauth_instance.consumer_secret = AppConfig[:twitter][:consumer_secret]
    redirect_to oauth_login_path
  end

  def oauth_complete
    Twitter.auth = {
      :type => :oauth,
      :consumer_key => AppConfig[:twitter][:consumer_key],
      :consumer_secret => AppConfig[:twitter][:consumer_secret],
      :token => get_access_token.token,
      :token_secret => get_access_token.secret
    }
    session[:user] = Twitter.account.verify_credentials?
    redirect_to root_path
  end

  def destroy
    session.clear
    redirect_to root_path
  end
end
