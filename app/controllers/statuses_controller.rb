class StatusesController < ApplicationController
  before_filter :require_user, :except => [:public_timeline, :user_timeline, :show]
  before_filter :prepare_options, :except => [:following, :followers, :create, :show]
  respond_to :html, :json, :xml

  def public_timeline
    @statuses = Twitter::Client.statuses.public_timeline? @options

    respond_timeline @statuses
  end

  def home_timeline
    @statuses = Twitter::Client.statuses.home_timeline? @options
    @lists = Twitter::Client._(current_user.screen_name).lists?

    respond_timeline(@statuses)
  end

  def user_timeline
    @body_id = 'profile'
    @user = Twitter::Client.users.show? :screen_name => params[:user_id]

    @options[:screen_name] = params[:user_id]
    @statuses = Twitter::Client.statuses.user_timeline? @options

  rescue Grackle::TwitterError => error
    flash.now[:error] = extract_error_message(error)
    @statuses = []

  ensure
    respond_timeline @statuses
  end

  def mentions
    @statuses = Twitter::Client.statuses.mentions? @options

    respond_timeline @statuses
  end

  def retweeted_to_me
    @statuses = Twitter::Client.statuses.retweeted_to_me? @options

    respond_timeline @statuses
  end

  def retweeted_by_me
    @statuses = Twitter::Client.statuses.retweeted_by_me? @options

    respond_timeline @statuses
  end

  def retweets_of_me
    @statuses = Twitter::Client.statuses.retweets_of_me? @options

    respond_timeline @statuses
  end

  def friends
    @users = Twitter::Client.statuses.friends? :page => params[:page]

    respond_with(@users)
  end

  def followers
    @statuses = Twitter::Client.statuses.followers? :page => params[:page]

    respond_with(@users)
  end

  def create
    params[:status][:status].strip!
    raise "Can't update with blank status." if params[:status][:status].blank?

    @status = Twitter::Client.statuses.update! params[:status].merge(:source => 'TwiLoli')

  rescue => error
    error_message = extract_error_message(error)

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
    @single_status = Twitter::Client.statuses.show? :id => params[:id]

    respond_timeline([@single_status])
  end

  def retweet
    @status = Twitter::Client.statuses.retweet! :id => params[:id]

  rescue Grackle::TwitterError => error
    error_message = extract_error_message(error)

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
end
