module ApplicationHelper
  def pagination(options)
    render :partial => 'shared/pagination', :locals => options
  end

  def format_tweet(tweet)
    tweet = tweet.gsub /\s+/, ' '
    tweet = auto_link_usernames(tweet)
    tweet = auto_link_tags(tweet)
    tweet = auto_link_urls(tweet)
  end

  def extract_mentioned_users(tweet)
    tweet.scan(%r{@[0-9A-Za-z_]+}).collect do |user|
      user[1..-1]
    end
  end

  def bigger_image_url(image_url)
    image_url.gsub(/_normal(\.\w{2,4})$/, '_bigger\1')
  end

  def twitter_url(path)
    path = path[1..-1] if path[0..0] == '/'
    "https://twitter.com/#{path}"
  end

  def profile_user
    @user ? @user : (current_user ? current_user : nil)
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
  def auto_link_urls(tweet)
    tweet.gsub %r{[0-9A-Za-z]{2,5}://([0-9A-Za-z_-]+\.)+[0-9A-Za-z]*[0-9A-Za-z/+=%&_.~?:\[\]-]*} do |url|
      short_url = truncate(url)
      link_to short_url, url, :target => '_blank', :title => url, 'data-truncated' => (url != short_url)
    end
  end

  def auto_link_usernames(tweet)
    tweet.gsub %r{@[0-9A-Za-z_/]+} do |user|
      user = user[1..-1]
      '@' + link_to(user, "/#{user}")
    end
  end

  def auto_link_tags(tweet)
    tweet.gsub %r{#\w+} do |tag|
      link_to tag, search_path(:q => tag[1..-1])
    end
  end
end
