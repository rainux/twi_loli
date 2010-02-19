class UsersController < ApplicationController
  def show
    render :text => params.inspect
  end
end
