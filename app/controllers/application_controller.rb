class ApplicationController < ActionController::Base
  include Rack::OAuth::Methods

  helper_method :current_user, :logged_in?
  protect_from_forgery

  private
  def current_user
    session[:user]
  end

  def logged_in?
    get_access_token.present?
  end
end
