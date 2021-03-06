// Generated by CoffeeScript 1.10.0
(function() {
  $(function() {
    var $body, $main, $side, baseUrl, init, openNestedNav, resize, switchSection;
    $body = $('body');
    $main = $('main');
    $side = $('aside');
    init = function() {
      resize();
      $(window).resize(resize);
      $body.on('click touch', 'aside li .title', openNestedNav);
      return $body.on('click touch', 'aside .tab', switchSection);
    };
    resize = function() {
      var $window, sideWidth, windowWidth;
      $window = $(window);
      windowWidth = $window.innerWidth();
      return sideWidth = $side.innerWidth();
    };
    openNestedNav = function(event) {
      var $childList, $parentList, $title, slug;
      $title = $(this);
      slug = $title.attr('data-slug');
      $parentList = $title.parent();
      $childList = $parentList.find('ul[data-slug="' + slug + '"]');
      $title.toggleClass('toggled');
      return $childList.toggleClass('open');
    };
    baseUrl = function() {
      return window.history.pushState('', document.title, window.location.origin);
    };
    switchSection = function(event) {
      var $section, $tab, sectionId;
      $tab = $(this);
      sectionId = $tab.attr('data-section');
      if (sectionId) {
        $section = $side.find('section#' + sectionId);
        $side.find('section.show').scrollTop(0);
        $side.find('section.show').removeClass('show');
        $side.find('.tab.selected').removeClass('selected');
        $tab.addClass('selected');
        if ($section.length) {
          $('.building.selected').removeClass('selected');
          $section.addClass('show');
          return event.preventDefault();
        } else {

        }
      }
    };
    return init();
  });

}).call(this);
