class StatusesController < ApplicationController
  before_filter :require_user, :except => [:public_timeline, :user_timeline]
  before_filter :prepare_options, :except => [:following, :followers, :create, :show]
  respond_to :html, :json, :xml

  def public_timeline
    @statuses = Twitter.statuses.public_timeline? @options

    respond_timeline @statuses
  end

  def home_timeline
    @statuses = Twitter.statuses.home_timeline? @options

    respond_timeline(@statuses)
  end

  def user_timeline
    @body_id = 'profile'
    @user = Twitter.users.show? :screen_name => params[:user_id]

    @options[:screen_name] = params[:user_id]
    @statuses = Twitter.statuses.user_timeline? @options

  rescue Grackle::TwitterError => error
    @statuses = []

  ensure
    respond_timeline @statuses
  end

  def mentions
    @statuses = Twitter.statuses.mentions? @options

    respond_timeline @statuses
  end

  def retweeted_to_me
    @statuses = Twitter.statuses.retweeted_to_me? @options

    respond_timeline @statuses
  end

  def retweeted_by_me
    @statuses = Twitter.statuses.retweeted_by_me? @options

    respond_timeline @statuses
  end

  def retweets_of_me
    @statuses = Twitter.statuses.retweets_of_me? @options

    respond_timeline @statuses
  end

  def friends
    @users = Twitter.statuses.friends? :page => params[:page]

    respond_with(@users)
  end

  def followers
    @statuses = Twitter.statuses.followers? :page => params[:page]

    respond_with(@users)
  end

  def create
    params[:status][:status].strip!
    raise "Can't update with blank status." if params[:status][:status].blank?

    @status = Twitter.statuses.update! params[:status].merge(:source => 'TwiLoli')

  rescue Grackle::TwitterError => error
    error_message = JSON.parse(error.response_body)['error']

  rescue => error
    error_message = error.message

  ensure
    if request.xhr?
      if @status
        respond_timeline([@status], true)
      else
        render :json => {:error => error_message}
      end
    else
      flash[:error] = error_message
      redirect_to :back
    end
  end

  def show
    @status = Twitter.statuses.show? :id => params[:id]

    respond_with(@status)
  end

  private
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
