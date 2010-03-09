module TwiLoli
  class Logger
    def initialize(app)
      @app = app
      @logger = ActiveSupport::BufferedLogger.new(Rails.root.join('log', 'twi_loli.log'))
    end

    def call(env)
      if env['HTTP_X_REQUESTED_WITH'] != 'XMLHttpRequest'
        session = env['rack.session']
        if session && session[:auth] && session[:user]
          @logger.info "#{Time.now} #{session[:auth][:type]} #{session[:user].screen_name} #{env['REQUEST_URI']}"
        end
      end
      @app.call(env)
    end
  end
end
