(function($) {

  $.fn.draggable = function() {

    var move = $.proxy(function(event) {
      if (this.data('mouseMove')) {
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
      this.data('mouseMove', true);
      this.data('mouseX', event.pageX);
      this.data('mouseY', event.pageY);
    }, this));

    this.mouseup($.proxy(function() {
      this.data('mouseMove', false);
    }, this));

    this.mouseout(move);
    this.mousemove(move);

    return this;
  };

})(jQuery);
