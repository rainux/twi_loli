(function($) {

  $.fn.draggable = function(options) {

    options = options || {};

    var move = $.proxy(function(event) {
      if (this.find(options.except)[0] != event.target && this.data('mouseMove')) {
        var changeX = event.pageX - this.data('mouseX');
        var changeY = event.pageY - this.data('mouseY');

        var newX = parseInt(this.css('left')) + changeX;
        var newY = parseInt(this.css('top')) + changeY;

        this.css('left', newX);
        this.css('top', newY);

        this.data('mouseX', event.pageX);
        this.data('mouseY', event.pageY);
      }
    }, this);

    this.mousedown($.proxy(function(event) {
      if (this.find(options.except)[0] != event.target) {
        this.data('mouseMove', true);
        this.data('mouseX', event.pageX);
        this.data('mouseY', event.pageY);
      }
    }, this));

    this.mouseup($.proxy(function() {
      if (this.find(options.except)[0] != event.target) {
        this.data('mouseMove', false);
      }
    }, this));

    this.mouseout(move);
    this.mousemove(move);

    return this;
  };

})(jQuery);
