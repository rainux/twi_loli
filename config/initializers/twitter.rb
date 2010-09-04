Grackle::Client::TWITTER_API_HOSTS[:rest] = AppConfig.twitter.api

module Grackle
  module Handlers
    class JSON2MashHandler
      def decode_response(res)
        json_result = JSON.parse(res)
        if json_result.respond_to?(:each_pair)
          Hashie::Mash.new(json_result)
        elsif json_result.respond_to?(:collect)
          json_result.collect {|item| Hashie::Mash.new(item) }
        else
          raise "Unexpected Response: #{res}"
        end
      end
    end
  end
end

Twitter = Grackle::Client.new(
  :handlers => {:json => Grackle::Handlers::JSON2MashHandler.new }
)
