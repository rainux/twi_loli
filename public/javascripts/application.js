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
    _statusBoxAutoKeyupIntervalId: null,
    _refreshTimelineIntervalId: null,
    _updateRelativeTimeIntervalId: null,

    _init: function() {

      this.$statusBox = $('#status_status');
      this.$statusSubmit = $('#status_submit');
      this.$notifyBar = $('#new_statuses_notification');
      this.$statusesUpdate = $('#statuses_update');
      this.$timeline = $('#timeline');

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

      var match, in_reply_to_status_id, in_reply_to;

      in_reply_to_status_id = $('#status_in_reply_to_status_id').val();
      if (in_reply_to_status_id) {

        in_reply_to = $('#status_' + in_reply_to_status_id).attr('data-user');
        match = this.$statusBox.val().match(
          new RegExp('(^| )@' + in_reply_to + '(?= |$)')
        );

        if (match) {
          return 'Reply to ' + in_reply_to +
            "'s tweet(" + in_reply_to_status_id + '):';
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

        this._addNewTweets.apply(this, arguments);
        this.$statusBox.val('');
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

        var $tweet = $(event.currentTarget).parents('.status');

        $('#status_update_box').removeClass('hide');
        $('#status_in_reply_to_status_id').val($tweet.attr('data-id'));
        this.$statusBox.val('@' + $tweet.attr('data-user') + ' ')
          .focus()
          .keyup()[0]
          .setSelectionRange(256, 256);

        return false;
      }
    },

    _replyAll: function(event) {

      if (this.$statusBox.length) {

        var $tweet = $(event.currentTarget).parents('.status');
        var mentioned_users = $tweet.attr('data-mentioned-users').split(' ');

        mentioned_users.unshift($tweet.attr('data-user'));
        mentioned_users = $.map(mentioned_users, function(user) {
          return '@' + user;
        });

        $('#status_update_box').removeClass('hide');
        $('#status_in_reply_to_status_id').val($tweet.attr('data-id'));
        this.$statusBox.val(mentioned_users.join(' ') + ' ')
          .focus()
          .keyup()[0]
          .setSelectionRange(256, 256);

        return false;
      }
    },

    _retweetWithComment: function(event) {

      if (this.$statusBox.length) {

        var $tweet = $(event.currentTarget).parents('.status');
        var $content = $tweet.find('.content').clone();

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

    _addNewTweets: function(data, textStatus) {

      if (data && data.count) {

        if (data.max_id) {
          this.$timeline.attr('data-max-id', data.max_id);
        }
        this.$timeline.prepend(data.html);

        var total_count = parseInt(this.$notifyBar.attr('data-count'), 10) +
          data.count;

        this.$notifyBar.attr('data-count', total_count);
        this.$statusesUpdate
          .text(total_count + ' new tweets.')
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
        success: $.proxy(this, '_addNewTweets')
      });
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

      $('.reply > a').live('click', $.proxy(this, '_reply'));
      $('.reply-all > a').live('click', $.proxy(this, '_replyAll'));
      $('.retweet-with-comment > a').live('click',
        $.proxy(this, '_retweetWithComment')
      );
    },

    run: function() {

      this._init();
      this.bindEventHandlers();

      this._refreshTimelineIntervalId = setInterval(
        $.proxy(this, '_refreshTimeline'), 2000 * 60
      );
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
