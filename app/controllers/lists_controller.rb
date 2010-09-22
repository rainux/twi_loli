class ListsController < ApplicationController
  before_filter :prepare_options
  respond_to :html, :json, :xml

  def statuses
    @list = Twitter::Client._(params[:user_id]).lists._(params[:id]).json?
    @statuses = Twitter::Client._(params[:user_id]).lists._(params[:id]).statuses? @options
    @lists = Twitter::Client._(params[:user_id]).lists?

    respond_timeline(@statuses)
  end
end
