class StatusesController < ApplicationController
  before_filter :require_user, :except => [:public_timeline, :user_timeline]
  respond_to :html, :json, :xml

  def public_timeline
    @statuses = Twitter.statuses.public_timeline? :page => params[:page]

    respond_with(@statuses)
  end

  def home_timeline
    @statuses = Twitter.statuses.home_timeline? :page => params[:page]

    respond_with(@statuses)
  end

  def user_timeline
    @body_id = 'profile'

    @user = Twitter.users.show? :screen_name => params[:user_id]
    @statuses = Twitter.statuses.user_timeline? :screen_name => params[:user_id], :page => params[:page]
  rescue Grackle::TwitterError => error
    @statuses = []

  ensure
    respond_with(@statuses)
  end

  def mentions
    @statuses = Twitter.statuses.mentions? :page => params[:page]

    respond_with(@statuses)
  end

  def retweeted_to_me
    @statuses = Twitter.statuses.retweeted_to_me? :page => params[:page]

    respond_with(@statuses)
  end

  def retweeted_by_me
    @statuses = Twitter.statuses.retweeted_by_me? :page => params[:page]

    respond_with(@statuses)
  end

  def retweets_of_me
    @statuses = Twitter.statuses.retweets_of_me? :page => params[:page]

    respond_with(@statuses)
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
    Twitter.statuses.update! params[:status].merge(:source => 'TwiLoli')

  rescue Grackle::TwitterError => error
    flash[:error] = JSON.parse(error.response_body)['error']

  ensure
    redirect_to :back
  end

  def show
    @status = Twitter.statuses.show? :id => params[:id]

    respond_with(@status)
  end
end
