class StatusesController < ApplicationController
  respond_to :html, :json, :xml

  def public_timeline
    @statuses = Twitter.statuses.public_timeline?

    respond_with(@statuses)
  end

  def home_timeline
    @statuses = Twitter.statuses.home_timeline?

    respond_with(@statuses)
  end

  def user_timeline
    @statuses = Twitter.statuses.user_timeline?

    respond_with(@statuses)
  end

  def mentions
    @statuses = Twitter.statuses.mentions?

    respond_with(@statuses)
  end

  def friends
    @users = Twitter.statuses.friends?

    respond_with(@users)
  end

  def followers
    @statuses = Twitter.statuses.followers?

    respond_with(@users)
  end

  def create
    Twitter.statuses.update! params[:status].merge(:source => 'TwiLoli')

    redirect_to root_path
  end
end
