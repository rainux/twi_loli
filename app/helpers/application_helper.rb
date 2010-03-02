module ApplicationHelper
  def pagination(options)
    render :partial => 'shared/pagination', :locals => options
  end

  def format_tweet(tweet)
    tweet = tweet.gsub /\s{2,}/, ' '
    tweet = tweet.gsub %r{[0-9A-Za-z]{2,4}://([0-9A-Za-z_-]+\.)+[0-9A-Za-z]*[0-9A-Za-z/+=%&_.~?:\[\]-]*} do |url|
      link_to truncate(url), url, :target => '_blank', :title => url
    end
    tweet = tweet.gsub %r{@[0-9A-Za-z_/]+} do |user|
      user = user[1..-1]
      '@' + link_to(user, user_path(user))
    end
    tweet = tweet.gsub %r{#\w+} do |tag|
      link_to tag, search_path(:q => tag[1..-1])
    end
  end

  def extract_mentioned_users(tweet)
    tweet.scan(%r{@[0-9A-Za-z_]+}).collect do |user|
      user[1..-1]
    end
  end
end
