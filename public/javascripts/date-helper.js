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
