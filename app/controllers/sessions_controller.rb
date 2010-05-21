class SessionsController < ApplicationController
  def new
    oauth_instance.consumer_key = AppConfig[:twitter][:consumer_key]
    oauth_instance.consumer_secret = AppConfig[:twitter][:consumer_secret]
  end

  def create
    if get_access_token
      Twitter.auth = {
        :type => :oauth,
        :consumer_key => AppConfig[:twitter][:consumer_key],
        :consumer_secret => AppConfig[:twitter][:consumer_secret],
        :token => get_access_token.token,
        :token_secret => get_access_token.secret
      }
    else
      Twitter.auth = {
        :type => :basic,
        :username => params[:session][:username],
        :password => params[:session][:password]
      }
    end

    session[:user] = Twitter.account.verify_credentials?
    session[:user].delete 'status'
    session[:auth] = Twitter.auth
    redirect_back_or_default root_path

  rescue Grackle::TwitterError => error
    flash[:error] = JSON.parse(error.response_body)['error']
    redirect_to new_session_path
  end

  def destroy
    session.clear
    redirect_to root_path
  end
end
