(function($, window, undefined) {

  var TwiLoli = {

    _refreshingTimeline: false,
    _loadingMoreTimeline: false,
    _hasTopBuffered: false,
    _hasBottomBuffered: false,
    _tweetBoxAutoKeyupIntervalId: null,
    _refreshTimelineIntervalId: null,
    _updateRelativeTimeIntervalId: null,

    _init: function() {

      this.$tweetBoxes = $('#tweet-boxes');
      this.$tweetBox = $('.tweet-box');
      this.$timeline = $('#timeline');
      this.$loadMore = $('#pagination .load-more');
      this.$window = $(window);
      this.$document = $(window.document);

      return this;
    },

    _cloneTweetBox: function(event, id) {

      var $tweetBox = $('#tweet-box-' + id);

      if (!$tweetBox.length) {
        $tweetBox = this.$tweetBox
          .clone()
          .draggable({except: '.status_status'})
          .addClass('floating')
          .attr('id', 'tweet-box-' + id);
        this.$tweetBox.after($tweetBox);
      }

      var top = event.pageY - ($tweetBox.outerHeight() / 2);

      var marginTop = this.$window.scrollTop() - top;
      if (marginTop > 0) { top = top + marginTop; }

      var marginBottom = top + $tweetBox.outerHeight() -
        (this.$window.scrollTop() + this.$window.height())
      if (marginBottom > 0) { top = top - marginBottom; }

      $tweetBox.css({
        top: top,
        left: this.$tweetBox.parent().offset().left
      });

      return $tweetBox.fadeIn();
    },

    _closeTweetBox: function(event) {

      var $tweetBox = $(event.currentTarget).parents('.tweet-box');

      $tweetBox.fadeOut('normal', function() {
        $(this).remove();
      });
    },

    _tweetBoxAutoKeyupOn: function(event) {

      this._tweetBoxAutoKeyupIntervalId = setInterval($.proxy(function() {

        $(event.currentTarget).keyup();
      }, this), 100);
    },

    _tweetBoxAutoKeyupOff: function() {

      clearInterval(this._tweetBoxAutoKeyupIntervalId);
    },

    _buildDoingText: function($tweetText) {

      var match, inReplyToStatusId, inReplyTo;

      inReplyToStatusId = $tweetText.parent().find('.status_in_reply_to_status_id').val();
      if (inReplyToStatusId) {

        inReplyTo = $('#status_' + inReplyToStatusId).attr('data-user');
        match = $tweetText.val().match(
          new RegExp('(^| )@' + inReplyTo + '(?= |$)')
        );

        if (match) {
          return 'Reply to ' + inReplyTo +
            "'s tweet(" + inReplyToStatusId + '):';
        }
      }

      match = $tweetText.val().match(/^\s*@(\w+)(?= |$)/);
      if (match) {
        return 'Reply to ' + match[1] + ':';
      }

      match = $tweetText.val().match(/RT @\w+\b.+/);
      if (match) {
        return 'Retweet with comment:';
      }

      match = $tweetText.val().match(/(^| )@(\w+)(?= |$)/g);
      if (match) {
        match = $.map(match, function(name) {
          return $.trim(name);
        });
        return 'Metioning ' + match.join(' ') + ':';
      }

      return "What's happening?";
    },

    _updateTweetTextHint: function(event) {

      var count, color,
        $tweetText = $(event.currentTarget);
      var $tweetBox = $tweetText.parents('.tweet-box');

      count = 140 - $tweetText.val().length;

      if (count >= 20) {
        color = 'rgb(204, 204, 204)';
      } else if (count >= 10) {
        color = 'rgb(92, 0, 2)';
      } else {
        color = 'rgb(212, 13, 18)';
      }

      $tweetBox.find('.status-field-char-counter').text(count).css('color', color);
      $tweetBox.find('label.doing').text(this._buildDoingText($tweetText));
    },

    _trySubmitStatus: function(event) {

      if (event.ctrlKey && event.which == 13) {

        var $tweetBox = $(event.currentTarget).parents('.tweet-box');

        if (!$tweetBox.data('tweeting')) {
          $tweetBox.data('tweeting', true);
          $tweetBox.find('.status_submit').click();
        }
      }
    },

    _submitStatus: function(event) {

      var $tweetSubmit = $(event.currentTarget);
      var $tweetBox = $tweetSubmit.parents('.tweet-box');
      var $tweetText = $tweetBox.find('.status_status');
      $tweetSubmit.css('visibility', 'hidden').parent().addClass('big-spinner');

      if ($tweetBox[0] != this.$tweetBox[0]) {
        $tweetBox.fadeOut();
      }

      var $form = $tweetBox.find('form');

      $.ajax({
        type: 'POST',
        url: $form.attr('action'),
        data: $form.serialize(),
        success: $.proxy(function(data, textStatus) {

          if (data.error) {
            if ($tweetBox[0] == this.$tweetBox[0]) {
              $('#message .error')
                .text(data.error)
                .fadeIn('slow')
                .delay(5000)
                .fadeOut('slow');

            } else {
              $tweetBox.css('top', this.$window.scrollTop()).fadeIn()
                .find('.message').addClass('error').text(data.error);
            }
          } else {

            this._prependNewTweets(data, textStatus);

            if ($tweetBox[0] == this.$tweetBox[0]) {
              $tweetText.val('').keyup();

            } else {
              $('#message .success')
                .text('Successfully tweeted.')
                .fadeIn('slow')
                .delay(5000)
                .fadeOut('slow');

              $tweetBox.remove();
            }
          }
        }, this),

        error: $.proxy(function(XMLHttpRequest, textStatus) {

          if ($tweetBox[0] == this.$tweetBox[0]) {
            $('#message .error')
              .text('Unknown error: ' + textStatus)
              .fadeIn('slow')
              .delay(5000)
              .fadeOut('slow');

          } else {
            $tweetBox.css('top', this.$window.scrollTop()).fadeIn()
              .find('.message').addClass('error').text(data.error);
          }
        }, this),

        complete: $.proxy(function() {

          $tweetSubmit.css('visibility', 'visible').parent().removeClass('big-spinner');
          $tweetBox.data('tweeting', false);
        }, this)
      });

      return false;
    },

    _reply: function(event) {

      var $tweet = $(event.currentTarget).parents('.status:first');

      var $tweetBox = this._cloneTweetBox(event, $tweet.attr('id'));
      var $tweetText = $tweetBox.find('.status_status');

      $tweetBox.find('.status_in_reply_to_status_id').val($tweet.attr('data-id'));

      var status;
      if (event.ctrlKey) {
        status = '@' + $tweet.attr('data-user') + ' '
      } else {
        status = '@' + $tweet.attr('data-user') + ' ' + $tweetText.val();
      }

      $tweetText.val(status)
        .focus()
        .keyup()[0]
        .setSelectionRange(256, 256);

      return false;
    },

    _replyAll: function(event) {

      var $tweet = $(event.currentTarget).parents('.status:first');
      var $tweetBox = this._cloneTweetBox(event, $tweet.attr('id'));
      var $tweetText = $tweetBox.find('.status_status');

      var mentionedUsers = $tweet.attr('data-mentioned-users').split(' ');

      mentionedUsers.unshift($tweet.attr('data-user'));
      mentionedUsers = $.map(mentionedUsers, function(user) {
        return '@' + user;
      });

      $tweetBox.find('.status_in_reply_to_status_id').val($tweet.attr('data-id'));

      var status;
      if (event.ctrlKey) {
        status = mentionedUsers.join(' ') + ' ';
      } else {
        status = mentionedUsers.join(' ') + ' ' + $tweetText.val();
      }

      $tweetText.val(status)
        .focus()
        .keyup()[0]
        .setSelectionRange(256, 256);

      return false;
    },

    _retweetWithComment: function(event) {

      var $tweet = $(event.currentTarget).parents('.status:first');
      var $content = $tweet.find('.content:first').clone();
      var $tweetBox = this._cloneTweetBox(event, $tweet.attr('id'));
      var $tweetText = $tweetBox.find('.status_status');

      $content.find('a[data-truncated=true]').each(function(i, link) {

        var $link = $(link);
        $link.text($link.attr('href'));
      });

      $tweetBox.find('.status_in_reply_to_status_id').val('');
      $tweetText
        .val('RT @' + $tweet.attr('data-user') + ': ' + $content.text())
        .focus()
        .keyup()[0]
        .setSelectionRange(0, 0);

      return false;
    },

    _retweet: function(event) {

      var $retweetLink = $(event.currentTarget);
      var tweetId = $retweetLink.parents('.status:first').attr('data-id');
      $retweetLink.css('visibility', 'hidden').parent().addClass('small-spinner');

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
        }, this),

        complete: $.proxy(function() {
          $retweetLink.css('visibility', 'visible').parent().removeClass('small-spinner');
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

        $inReplyToTweet = $inReplyToTweet.clone()
          .hide().removeClass('buffered top bottom');
        $inReplyToTweet.find('.conversations').remove();

        $container.find('.conversations').append($inReplyToTweet)
          .find('.status:last').fadeIn();

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

      $inReplyToLink.css('visibility', 'hidden').parent().addClass('small-spinner');

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

            var $tweet = $(data.html).hide().removeClass('buffered');
            $container.find('.conversations').append($tweet)
              .find('.status:last').fadeIn();

            this._loadNextInReplyTo($container, $inReplyToLink, $tweet, isFull);
          }
        }, this),

        complete: $.proxy(function() {
          $inReplyToLink.css('visibility', 'visible').parent().removeClass('small-spinner');
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

        var $newlyCreated = this.$timeline.find('> li.status.newly_created');
        var $buffered = this.$timeline
          .find('> li.status.buffered.top:lt(' + data.count + ')');

        if (data.newly_created) {
          window.scrollBy(0, $newlyCreated.first().outerHeight());

        } else {
          var height = _.reduce($buffered, 0, function(memo, li) {
            return memo + $(li).outerHeight();
          });

          var removedHeight = _.reduce($newlyCreated, 0, function(memo, li) {
            return memo + $(li).outerHeight();
          });

          $newlyCreated.remove();
          window.scrollBy(0, height - removedHeight);
        }
        this._hasTopBuffered = true;
      }
    },

    _refreshTimeline: function() {

      if (this._refreshingTimeline) { return; }

      this._refreshingTimeline = true;

      $.ajax({
        type: 'GET',
        data: {since_id: this.$timeline.attr('data-max-id')},
        dataType: 'json',
        success: $.proxy(this, '_prependNewTweets'),
        complete: $.proxy(function() {

          this._refreshingTimeline = false;
        }, this)
      });
    },

    _appendNewTweets: function(data, textStatus) {

      if (data && data.count) {

        if (data.min_id) {
          this.$timeline.attr('data-min-id', data.min_id);
        }
        this.$timeline.append(data.html);
        this._hasBottomBuffered = true;
      }
    },

    _loadMoreTimeline: function() {

      if (this._loadingMoreTimeline) { return; }

      this._loadingMoreTimeline = true;

      this.$loadMore.css('visibility', 'hidden').parent().addClass('big-spinner');

      $.ajax({
        type: 'GET',
        data: {max_id: this.$timeline.attr('data-min-id'), page: 1},
        dataType: 'json',
        success: $.proxy(this, '_appendNewTweets'),
        complete: $.proxy(function() {

          this.$loadMore.css('visibility', 'visible').parent().removeClass('big-spinner');
          this._loadingMoreTimeline = false;
        }, this)
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

    _eraseTopBufferedMark: function() {

      if (!this._hasTopBuffered) { return; }

      var $topBuffered = this.$timeline
        .find('> li.status.buffered.top:not(.animating)');

      if (!$topBuffered.length) { return; }

      if ($topBuffered.last().offset().top - this.$window.scrollTop() > 200) {

        this._hasTopBuffered = false;
        $topBuffered.addClass('animating').animate({
          backgroundColor: '#fff'
        }, 10000, function() {

          $topBuffered
            .removeClass('buffered top animating')
            .removeAttr('style');
        });
      }
    },

    _eraseBottomBufferedMark: function() {

      if (!this._hasBottomBuffered) { return; }

      var $bottomBuffered = this.$timeline
        .find('> li.status.buffered.bottom:not(.animating)');

      if (!$bottomBuffered.length) { return; }

      if (this.$window.scrollTop() + this.$window.height() -
        $bottomBuffered.first().offset().top -
        $bottomBuffered.first().outerHeight() > 200) {

        this._hasBottomBuffered = false;

        $bottomBuffered.addClass('animating').animate({
          backgroundColor: '#fff'
        }, 10000, function() {

          $bottomBuffered
            .removeClass('buffered bottom animating')
            .removeAttr('style');
        });
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

      this.$tweetBoxes
        .delegate(
          '.tweet-box.floating .status-field-char-counter', 'dblclick',
          $.proxy(this, '_closeTweetBox')
        )
        .delegate(
          '.status_status', 'focus',
          $.proxy(this, '_tweetBoxAutoKeyupOn')
        )
        .delegate(
          '.status_status', 'blur',
          $.proxy(this, '_tweetBoxAutoKeyupOff')
        )
        .delegate(
          '.status_status', 'keyup',
          $.proxy(this, '_updateTweetTextHint')
        )
        .delegate(
          '.status_status', 'keyup',
          $.proxy(this, '_trySubmitStatus')
        )
        .delegate(
          '.status_submit', 'click',
          $.proxy(this, '_submitStatus')
        );

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

      this.$loadMore.click($.proxy(this, '_loadMoreTimeline'));

      this.$window.scroll($.proxy(this, '_autoLoadMoreTimeline'));
      this.$window.scroll($.proxy(this, '_eraseTopBufferedMark'));
      this.$window.scroll($.proxy(this, '_eraseBottomBufferedMark'));
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
