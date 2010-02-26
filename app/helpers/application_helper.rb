module ApplicationHelper
  def pagination(options)
    render :partial => 'shared/pagination', :locals => options
  end
end
