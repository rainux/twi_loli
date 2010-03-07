class ListsController < ApplicationController
  before_filter :prepare_options
  respond_to :html, :json, :xml

  def statuses
    @list = Twitter._(params[:user_id]).lists._(params[:id]).json?
    @statuses = Twitter._(params[:user_id]).lists._(params[:id]).statuses? @options
    @lists = Twitter._(params[:user_id]).lists?

    respond_timeline(@statuses)
  end
end
