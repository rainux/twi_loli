module ApplicationHelper
  include Twitter::Autolink
  include Twitter::Extractor

  def pagination(options)
    render :partial => 'shared/pagination', :locals => options
  end

  def format_tweet(tweet)
    tweet = tweet.gsub(/(\r\n?|\n)/, '<br />')
    tweet = auto_link(
      tweet,
      :username_url_base => root_path,
      :list_url_base => root_path,
      :hashtag_url_base => URI.encode('http://search.twitter.com/search?q=#'),
      :target => '_blank'
    )
  end

  def bigger_image_url(image_url)
    image_url.gsub(/_normal(\.\w{2,4})$/, '_bigger\1')
  end

  def twitter_url(path)
    path = path[1..-1] if path[0..0] == '/'
    "https://twitter.com/#{path}"
  end

  def profile_user
    return @profile_user if @profile_user
    @profile_user = @user ? @user.dup : (current_user ? current_user.dup : nil)
    fix_colors(@profile_user) if @profile_user
    @profile_user
  end

  def profile_background(profile_user)
    result = []
    result << "##{profile_user.profile_background_color}"
    if profile_user.profile_background_image_url['/profile_background_images/']
      result << "url('#{profile_user.profile_background_image_url}') fixed"
      result << (profile_user.profile_background_tile ? 'repeat' : 'no-repeat')
    end
    result.join(' ')
  end

  private
  def fix_colors(profile_user)
    unless profile_user.profile_text_color.blank?
      profile_user.profile_text_color = "##{profile_user.profile_text_color}"
    end
    unless profile_user.profile_sidebar_fill_color.blank?
      profile_user.profile_sidebar_fill_color = "##{profile_user.profile_sidebar_fill_color}"
    end
    unless profile_user.profile_link_color.blank?
      profile_user.profile_link_color = "##{profile_user.profile_link_color}"
    end
    unless profile_user.profile_sidebar_border_color.blank?
      profile_user.profile_sidebar_border_color = "##{profile_user.profile_sidebar_border_color}"
    end
  end
end
