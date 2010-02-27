class StatusesController < ApplicationController
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
    @statuses = Twitter.statuses.user_timeline? :screen_name => params[:user_id], :page => params[:page]

    respond_with(@statuses)
  end

  def mentions
    @statuses = Twitter.statuses.mentions? :page => params[:page]

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
    redirect_to root_path
  end

  def show
    @status = Twitter.statuses.show? :id => params[:id]

    respond_with(@status)
  end
end
