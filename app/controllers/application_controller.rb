class ApplicationController < ActionController::Base
  include Rack::OAuth::Methods

  helper_method :current_user, :logged_in?, :oauth_login_path
  protect_from_forgery
  before_filter :set_twitter_auth
  before_filter :set_page_vars
  before_filter :get_api_rate_limit_status

  private
  def current_user
    session[:user]
  end

  def logged_in?
    !!(current_user && session[:auth])
  end

  def require_user
    unless current_user
      store_location
      flash[:notice] = 'You must sign in to access this page'
      redirect_to signin_path
      return false
    end
  end

  def store_location
    session[:return_to] = request.request_uri
  end

  def redirect_back_or_default(default)
    redirect_to(session[:return_to] || default)
    session[:return_to] = nil
  end

  def set_twitter_auth
    if logged_in?
      Twitter.auth = session[:auth]
      Time.zone = session[:user].time_zone
    else
      Twitter.auth = {}
    end
  end

  def set_page_vars
    params[:page] = 1 unless params[:page]
    @newer_page = params[:page].to_i - 1
    @older_page = params[:page].to_i + 1
  end

  def get_api_rate_limit_status
    @api_rate_limit_status = Twitter.account.rate_limit_status? if logged_in?
  end

  def prepare_options
    @options = {
      :page => params[:page]
    }
    if params[:since_id]
      @options[:since_id] = params[:since_id]
      @options[:count] = 200
    end
    if params[:max_id]
      @options[:max_id] = params[:max_id]
    end
  end

  def respond_timeline(statuses, newly_created = false)
    if request.xhr?
      html = render_to_string :partial => 'status.html.haml', :collection => statuses,
        :locals => {:newly_created => newly_created}
      data = {
        :html => html,
        :count => statuses.size
      }
      unless newly_created
        data[:max_id] = statuses.empty? ? params[:since_id] : statuses.first.id
      end

      render :json => data
    else
      respond_with(statuses)
    end
  end
end
