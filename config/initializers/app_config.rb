AppConfig = {
  :twitter => {
    :api => 'api.twitter.com/v1'
  }
}

config_file = Rails.root.join('config', 'config.yml')

if File.exists?(config_file)
  AppConfig.merge!(YAML.load_file(config_file))
end
