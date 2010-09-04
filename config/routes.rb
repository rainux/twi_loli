TwiLoli::Application.routes.draw do
  resources :statuses do
    collection do
      get   :public_timeline
      get   :home_timeline
      get   :user_timeline
      get   :mentions
      get   :retweeted_to_me
      get   :retweeted_by_me
      get   :retweets_of_me
      get   :friends
      get   :followers
    end
    member do
      put   :retweet
    end
  end

  resources :users do
    resources :lists do
      member do
        get   :statuses
      end
    end
  end

  resource :search
  resource :session

  root :to                    => 'statuses#home_timeline'
  match '/mentions'           => 'statuses#mentions',         :as => 'mentions'
  match '/retweets_by_others' => 'statuses#retweeted_to_me',  :as => 'retweets_by_others'
  match '/retweets'           => 'statuses#retweeted_by_me',  :as => 'retweets'
  match '/retweets_of_mine'   => 'statuses#retweets_of_me',   :as => 'retweets_of_mine'
  match '/following'          => 'statuses#friends',          :as => 'following'
  match '/followers'          => 'statuses#followers',        :as => 'followers'
  match '/signin'             => 'sessions#new',              :as => 'signin'
  match '/signout'            => 'sessions#destroy',          :as => 'signout'
  match '/oauth_login'        => 'sessions#oauth_login'
  match '/oauth_complete'     => 'sessions#oauth_complete'
  match ':user_id/following'  => 'statuses#friends',          :as => 'user_following'
  match ':user_id/followers'  => 'statuses#followers',        :as => 'user_followers'
  match ':user_id'            => 'statuses#user_timeline',    :as => 'user'
  match ':user_id/:id'        => 'lists#statuses',            :as => 'user_list'

  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get :short
  #       post :toggle
  #     end
  #
  #     collection do
  #       get :sold
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get :recent, :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => "welcome#index"

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id(.:format)))'
end
