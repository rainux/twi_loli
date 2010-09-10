(function($, window, undefined) {

  var DateHelper = {

    time_ago_in_words_with_parsing: function(from_time, include_seconds) {

      var date = new Date;
      date.setTime(Date.parse(from_time));
      return this.time_ago_in_words(date, include_seconds);
    },

    time_ago_in_words: function(from_time, include_seconds) {

      return this.distance_of_time_in_words(from_time, new Date, include_seconds);
    },

    distance_of_time_in_words: function(from_time, to_time, include_seconds) {

      var distance_in_seconds = (to_time - from_time) / 1000;
      var distance_in_minutes = Math.round(distance_in_seconds / 60);

      if (distance_in_minutes < 2) {
        if (include_seconds) {
          if (distance_in_seconds < 5) { return 'less than 5 seconds ago'; }
          if (distance_in_seconds < 10) { return 'less than 10 seconds ago'; }
          if (distance_in_seconds < 20) { return 'less than 20 seconds ago'; }
          if (distance_in_seconds < 40) { return 'half a minute ago'; }
          if (distance_in_seconds < 60) { return 'less than a minute ago'; }
          return '1 minute ago';
        } else {
          if (distance_in_minutes == 0) {
            return 'less than a minute ago';
          } else {
            return '1 minute ago';
          }
        }
      }

      if (distance_in_minutes < 45) { return distance_in_minutes + ' minutes ago'; }
      if (distance_in_minutes < 90) { return 'about 1 hour ago'; }
      if (distance_in_minutes < 1440) { return 'about ' + Math.round(distance_in_minutes / 60) + ' hours ago'; }
      if (distance_in_minutes < 2530) { return '1 day ago'; }
      if (distance_in_minutes < 43200) { return Math.round(distance_in_minutes / 1440) + ' days ago'; }
      if (distance_in_minutes < 86400) { return 'about 1 month ago'; }
      if (distance_in_minutes < 525600) { return 'about ' + Math.round(distance_in_minutes / 43200) + ' months ago'; }
      if (distance_in_minutes < 1051200) { return 'about 1 year ago'; }

      return 'about ' + Math.round(distance_in_minutes / 525600) + ' years ago';
    }
  };

  var TwiLoli = {

    _refreshingTimeline: false,
    _loadingMoreTimeline: false,
    _statusBoxAutoKeyupIntervalId: null,
    _refreshTimelineIntervalId: null,
    _updateRelativeTimeIntervalId: null,

    _init: function() {

      this.$statusBox = $('#status_status');
      this.$statusSubmit = $('#status_submit');
      this.$notifyBar = $('#new_statuses_notification');
      this.$statusesUpdate = $('#statuses_update');
      this.$timeline = $('#timeline');
      this.$more = $('#pagination .more');
      this.$window = $(window);
      this.$document = $(window.document);

      return this;
    },

    _statusBoxAutoKeyupOn: function() {

      this._statusBoxAutoKeyupIntervalId = setInterval($.proxy(function() {

        this.$statusBox.keyup();
      }, this), 100);
    },

    _statusBoxAutoKeyupOff: function() {

      clearInterval(this._statusBoxAutoKeyupIntervalId);
    },

    _buildDoingText: function() {

      var match, inReplyToStatusId, inReplyTo;

      inReplyToStatusId = $('#status_in_reply_to_status_id').val();
      if (inReplyToStatusId) {

        inReplyTo = $('#status_' + inReplyToStatusId).attr('data-user');
        match = this.$statusBox.val().match(
          new RegExp('(^| )@' + inReplyTo + '(?= |$)')
        );

        if (match) {
          return 'Reply to ' + inReplyTo +
            "'s tweet(" + inReplyToStatusId + '):';
        }
      }

      match = this.$statusBox.val().match(/^\s*@(\w+)(?= |$)/);
      if (match) {
        return 'Reply to ' + match[1] + ':';
      }

      match = this.$statusBox.val().match(/RT @\w+\b.+/);
      if (match) {
        return 'Retweet with comment:';
      }

      match = this.$statusBox.val().match(/(^| )@(\w+)(?= |$)/g);
      if (match) {
        match = $.map(match, function(name) {
          return $.trim(name);
        });
        return 'Metioning ' + match.join(' ') + ':';
      }

      return "What's happening?";
    },

    _updateStatusBoxHint: function() {

      var count, color;

      count = 140 - this.$statusBox.val().length;

      if (count >= 20) {
        color = 'rgb(204, 204, 204)';
      } else if (count >= 10) {
        color = 'rgb(92, 0, 2)';
      } else {
        color = 'rgb(212, 13, 18)';
      }

      $('#status-field-char-counter').text(count).css('color', color);
      $('label.doing').text(this._buildDoingText());
    },

    _statusSubmitted: function(data, textStatus) {

      if (data.error) {

        $('#message .error')
          .text(data.error)
          .fadeIn('slow')
          .delay(5000)
          .fadeOut('slow');
      } else {

        this._prependNewTweets.apply(this, arguments);
        this.$statusBox.val('').keyup();
      }
    },

    _submitStatus: function() {

      var $form = $('#status_update_box form');

      $.post(
        $form.attr('action'),
        $form.serialize(),
        $.proxy(this, '_statusSubmitted')
      );

      return false;
    },

    _showNewStatuses: function(event) {

      var $buffered = this.$timeline.find('> li.status.buffered:not(.newly_created)');

      if ($buffered.length) {

        this.$timeline
          .find('> li.status.newly_created')
          .remove();
      }

      $buffered = this.$timeline
        .find('> li.status.buffered')
        .removeClass('buffered');

      var height = _.reduce($buffered, 0, function(memo, li) {
        return memo + $(li).outerHeight();
      });

      window.scrollBy(0, height);

      this.$notifyBar.attr('data-count', 0);
      $(event.currentTarget)
        .text('0 new tweet.')
        .hide();

      return false;
    },

    _reply: function(event) {

      if (this.$statusBox.length) {

        var $tweet = $(event.currentTarget).parents('.status:first');

        $('#status_update_box').removeClass('hide');
        $('#status_in_reply_to_status_id').val($tweet.attr('data-id'));

        var status;
        if (event.ctrlKey) {
          status = '@' + $tweet.attr('data-user') + ' '
        } else {
          status = '@' + $tweet.attr('data-user') + ' ' + this.$statusBox.val();
        }

        this.$statusBox.val(status)
          .focus()
          .keyup()[0]
          .setSelectionRange(256, 256);

        return false;
      }
    },

    _replyAll: function(event) {

      if (this.$statusBox.length) {

        var $tweet = $(event.currentTarget).parents('.status:first');
        var mentionedUsers = $tweet.attr('data-mentioned-users').split(' ');

        mentionedUsers.unshift($tweet.attr('data-user'));
        mentionedUsers = $.map(mentionedUsers, function(user) {
          return '@' + user;
        });

        $('#status_update_box').removeClass('hide');

        $('#status_in_reply_to_status_id').val($tweet.attr('data-id'));

        var status;
        if (event.ctrlKey) {
          status = mentionedUsers.join(' ') + ' ';
        } else {
          status = mentionedUsers.join(' ') + ' ' + this.$statusBox.val();
        }

        this.$statusBox.val(status)
          .focus()
          .keyup()[0]
          .setSelectionRange(256, 256);

        return false;
      }
    },

    _retweetWithComment: function(event) {

      if (this.$statusBox.length) {

        var $tweet = $(event.currentTarget).parents('.status:first');
        var $content = $tweet.find('.content:first').clone();

        $content.find('a[data-truncated=true]').each(function(i, link) {

          var $link = $(link);
          $link.text($link.attr('href'));
        });

        $('#status_update_box').removeClass('hide');
        $('#status_in_reply_to_status_id').val('');
        this.$statusBox
          .val('RT @' + $tweet.attr('data-user') + ': ' + $content.text())
          .focus()
          .keyup()[0]
          .setSelectionRange(0, 0);

        return false;
      }
    },

    _retweet: function(event) {

      var $retweetLink = $(event.currentTarget);
      var tweetId = $retweetLink.parents('.status:first').attr('data-id');

      $.ajax({
        type: 'PUT',
        url: $retweetLink.attr('data-url'),
        data: {}, // Google Chrome will post an 'undefined' without this
        dataType: 'json',
        success: $.proxy(function(data, textStatus) {

          if (_(data).chain().keys().include('error').value()) {

            $('#message .error')
              .text('Error retweet this tweet, maybe you already retweeted it?')
              .fadeIn('slow')
              .delay(5000)
              .fadeOut('slow');
          } else {

            var $retweet = $(data.html);
            $('#status_' + tweetId).replaceWith($retweet);
            $('#' + $retweet.attr('id')).removeClass('buffered');
          }
        }, this)
      });

      return false;
    },

    _flashExistingInReplyTo: function($container, $inReplyToLink, isFull) {

      var inReplyToStatusId = $inReplyToLink.attr('data-in-reply-to-status-id');

      var $inReplyToTweet = $inReplyToLink
        .parents('.status:last')
        .find('#status_' + inReplyToStatusId);

      if ($inReplyToTweet.length) {

        $inReplyToTweet.fadeTo('normal', 0.1, function() {
          $(this).fadeTo('normal', 1);
        });

        this._loadNextInReplyTo($container, $inReplyToLink, $inReplyToTweet, isFull);

        return true;
      }
    },

    _loadInReplyToFromTimeline: function($container, $inReplyToLink, isFull) {

      var inReplyToStatusId = $inReplyToLink.attr('data-in-reply-to-status-id');

      var $inReplyToTweet = $('#status_' + inReplyToStatusId + ':first');

      if ($inReplyToTweet.length) {

        $inReplyToTweet = $inReplyToTweet.clone();
        $inReplyToTweet.find('.conversations').remove();

        $container.find('.conversations').append($inReplyToTweet);

        this._loadNextInReplyTo($container, $inReplyToLink, $inReplyToTweet, isFull);

        return true;
      }
    },

    _loadNextInReplyTo: function($container, $inReplyToLink, $inReplyToTweet, isFull) {

      if (isFull) {
        $inReplyToLink = $inReplyToTweet.find('.in-reply-to:first');
        if ($inReplyToLink.length) {
          this._loadInReplyTo($container, $inReplyToLink, true);
        }
      }
    },

    _loadInReplyTo: function($container, $inReplyToLink, isFull) {

      if (this._flashExistingInReplyTo( $container, $inReplyToLink, isFull)) { return; }

      if (this._loadInReplyToFromTimeline( $container, $inReplyToLink, isFull)) { return; }

      $.ajax({
        type: 'GET',
        url: $inReplyToLink.attr('href'),
        data: {}, // Google Chrome will post an 'undefined' without this
        dataType: 'json',
        success: $.proxy(function(data, textStatus) {

          if (data.error) {

            $('#message .error')
              .text(data.error)
              .fadeIn('slow')
              .delay(5000)
              .fadeOut('slow');
          } else {

            var $tweet = $(data.html).removeClass('buffered');
            $container.find('.conversations').append($tweet);

            this._loadNextInReplyTo($container, $inReplyToLink, $tweet, isFull);
          }
        }, this)
      });
    },

    _loadConversation: function(event) {

      var $inReplyToLink = $(event.currentTarget);
      var $container = $inReplyToLink.parents('.status:last');
      var $conversations = $container.find('.conversations');
      var isRootNode = $inReplyToLink.parents('.status').length == 1;
      var isFull = event.ctrlKey;

      if (isRootNode) {
        $conversations.toggle();
      }

      if (!$conversations.length) {
        $container.append(
          $('<ol />').attr('class', 'conversations')
        );
      }

      this._loadInReplyTo($container, $inReplyToLink, isFull);

      return false;
    },

    _prependNewTweets: function(data, textStatus) {

      if (data && data.count) {

        if (data.max_id) {
          this.$timeline.attr('data-max-id', data.max_id);
        }
        this.$timeline.prepend(data.html);

        var totalCount = parseInt(this.$notifyBar.attr('data-count'), 10) +
          data.count;

        this.$notifyBar.attr('data-count', totalCount);
        this.$statusesUpdate
          .text(totalCount + ' new tweets.')
          .show();
      }

      this._refreshingTimeline = false;
    },

    _refreshTimeline: function() {

      if (this._refreshingTimeline) { return; }

      this._refreshingTimeline = true;

      $.ajax({
        type: 'GET',
        data: {since_id: this.$timeline.attr('data-max-id')},
        dataType: 'json',
        success: $.proxy(this, '_prependNewTweets')
      });
    },

    _appendNewTweets: function(data, textStatus) {

      if (data && data.count) {

        if (data.min_id) {
          this.$timeline.attr('data-min-id', data.min_id);
        }
        this.$timeline.append(data.html);
      }

      this.$more.find('.spinner').hide();
      this.$more.find('.load-more').show();

      this._loadingMoreTimeline = false;
    },

    _loadMoreTimeline: function() {

      if (this._loadingMoreTimeline) { return; }

      this._loadingMoreTimeline = true;

      this.$more.find('.load-more').hide();
      this.$more.find('.spinner').show();

      $.ajax({
        type: 'GET',
        data: {max_id: this.$timeline.attr('data-min-id'), page: 1},
        dataType: 'json',
        success: $.proxy(this, '_appendNewTweets')
      });

      return false;
    },

    _autoLoadMoreTimeline: function() {

      var remainingSpace = this.$document.height() -
        (this.$window.scrollTop() + this.$window.height());

      if (remainingSpace < 500) {
        this._loadMoreTimeline();
      }
    },

    _updateRelativeTime: function() {

      $('[data-time]').each(function(i, element) {

        var $element = $(element);
        var time = parseInt($element.attr('data-time'), 10) * 1000;

        $element.text(DateHelper.time_ago_in_words(time, true));
      });
    },

    bindEventHandlers: function() {

      this.$statusBox
        .focus($.proxy(this, '_statusBoxAutoKeyupOn'))
        .blur($.proxy(this, '_statusBoxAutoKeyupOff'))
        .keyup($.proxy(this, '_updateStatusBoxHint'));

      this.$statusSubmit.click($.proxy(this, '_submitStatus'));
      this.$statusesUpdate.click($.proxy(this, '_showNewStatuses'));

      this.$timeline
        .delegate('a.reply', 'click', $.proxy(this, '_reply'))
        .delegate('a.reply-all', 'click',
          $.proxy(this, '_replyAll')
        )
        .delegate('a.retweet-with-comment', 'click',
          $.proxy(this, '_retweetWithComment')
        )
        .delegate('a.retweet', 'click', $.proxy(this, '_retweet'))
        .delegate('a.in-reply-to', 'click', $.proxy(this, '_loadConversation'));

      this.$more.find('.load-more').click($.proxy(this, '_loadMoreTimeline'));

      this.$window.scroll($.proxy(this, '_autoLoadMoreTimeline'));
    },

    run: function() {

      this._init();
      this.bindEventHandlers();

      if (location.search.toLowerCase().indexOf('page') < 0 ) {
        this._refreshTimelineIntervalId = setInterval(
          $.proxy(this, '_refreshTimeline'), 2000 * 60
        );
      }

      this._updateRelativeTimeIntervalId = setInterval(
        $.proxy(this, '_updateRelativeTime'), 1000 * 10
      );

      return this;
    },

    shutdown: function() {

      clearInterval(this._refreshTimelineIntervalId);
      clearInterval(this._updateRelativeTimeIntervalId);

      return this;
    }
  };


  $(function() {

    TwiLoli.run();

    $(window).unload(function() {

      TwiLoli.shutdown();
    });
  });

})(jQuery, window);
