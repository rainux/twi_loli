# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key    => '_twi_loli_session',
  :secret => '6f3aaae87b5a4f584009bea7b1376004a553601a97d46420e932291943482a9c8c50351233315e182c1187d8f10ad275c7737f5d13813d85737ee95625b4fdff'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
