// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults
jQuery(function ($) {

  $(function() {

    $('#status_status').keyup(function() {

      var $this = $(this);

      function buildDoingText() {

        var match, in_reply_to_status_id, in_reply_to;

        in_reply_to_status_id = $('#status_in_reply_to_status_id').val();
        if (in_reply_to_status_id) {

          in_reply_to = $('#status_' + in_reply_to_status_id).attr('data-user');
          match = $this.val().match(new RegExp('(^| )@' + in_reply_to + '(?= |$)'));

          if (match) {
            return 'Reply to ' + in_reply_to + "'s tweet(" + in_reply_to_status_id + '):';
          }
        }

        match = $this.val().match(/^\s*@(\w+)(?= |$)/);
        if (match) {
          return 'Reply to ' + match[1] + ':';
        }

        match = $this.val().match(/RT @\w+\b.+/);
        if (match) {
          return 'Retweet with comment:';
        }

        match = $this.val().match(/(^| )@(\w+)(?= |$)/g);
        if (match) {
          match = $.map(match, function(name) {
            return $.trim(name);
          });
          return 'Metioning ' + match.join(' ') + ':';
        }

        return "What's happening?";
      }

      $('label.doing').text(buildDoingText());
    });


    $('.reply > a').click(function() {

      var $tweet = $(this).parents('.status');

      $('#status_in_reply_to_status_id').val($tweet.attr('data-id'));
      $('#status_status').val('@' + $tweet.attr('data-user') + ' ')
        .focus()
        .keyup()
        [0].setSelectionRange(256, 256);

      return false;
    });


    $('.retweet-with-comment > a').click(function() {

      var $tweet = $(this).parents('.status');
      var content = $tweet.find('.content').text();

      $('#status_in_reply_to_status_id').val('');
      $('#status_status')
        .val('RT @' + $tweet.attr('data-user') + ': ' + content)
        .focus()
        .keyup()
        [0].setSelectionRange(0, 0);

      return false;
    });
  });

});
