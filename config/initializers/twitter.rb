Grackle::Client::TWITTER_API_HOSTS[:rest] = AppConfig[:twitter][:api]

Twitter = Grackle::Client.new(
  :headers => AppConfig[:twitter][:headers],
  :auth => {
    :type => :basic,
    :username => AppConfig[:twitter][:username],
    :password => AppConfig[:twitter][:password]
  }
)
