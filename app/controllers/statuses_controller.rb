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
end
