class ApplicationController < ActionController::Base
  include Rack::OAuth::Methods

  helper_method :current_user, :logged_in?
  protect_from_forgery
  before_filter :set_twitter_auth
  before_filter :set_page_vars

  private
  def current_user
    session[:user]
  end

  def logged_in?
    !!(current_user && session[:auth])
  end

  def set_twitter_auth
    if logged_in?
      Twitter.auth = session[:auth]
      Time.zone = session[:user].time_zone
    end
  end

  def set_page_vars
    params[:page] = 1 unless params[:page]
    @newer_page = params[:page].to_i - 1
    @older_page = params[:page].to_i + 1
  end
end
