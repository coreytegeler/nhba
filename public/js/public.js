// Generated by CoffeeScript 1.10.0
(function() {
  window.initPublic = function() {
    var $body, $buildingTiles, $buildings, $filterSect, $glossarySect, $grid, $gridWrap, $infoSect, $main, $searchSect, $side, $singleSect, buildingMapSetup, centerGrid, clearFilter, clickBuilding, clickFilter, clickMarker, clickToggle, clickTour, closeSide, filter, filterIsOn, filterQuery, filterUrl, getContent, getParam, getParams, hoverBuilding, infoMapSetup, makeDraggable, nextSlide, openSide, paginate, popState, resizeGrid, selectBuilding, setUp, setUpSlider, tourMapSetup, unhoverBuilding, updateSingleSect, urlQuery;
    $body = $('body');
    $main = $('main');
    $side = $('aside');
    $gridWrap = $('.gridWrap');
    $grid = $('.grid');
    $buildingTiles = $grid.find('.building');
    $buildings = $('.building');
    $infoSect = $('section#info');
    $filterSect = $('section#filter');
    $glossarySect = $('section#glossary');
    $searchSect = $('section#search');
    $singleSect = $('section#single');
    filterQuery = {};
    urlQuery = {};
    filterIsOn = false;
    setUp = function() {
      var id;
      $body.on('mouseenter', '.building a', hoverBuilding);
      $body.on('mouseleave', '.building a', unhoverBuilding);
      $body.on('click', '.building a', clickBuilding);
      $body.on('click', '.group.tour a.tour', clickTour);
      $body.on('click', 'a.filter', clickFilter);
      $body.on('click', '#filter .clear', clearFilter);
      $body.on('click', '.button.open', openSide);
      $body.on('click', '.close.tab', closeSide);
      $body.on('click', '.slide', nextSlide);
      $body.on('click', '.toggler', clickToggle);
      $body.on('click', '.header .arrow', paginate);
      $(window).on('popstate', popState);
      $(window).resize(function() {
        resizeGrid();
        return setUpSlider();
      });
      makeDraggable();
      resizeGrid();
      centerGrid();
      setUpSlider();
      getParams();
      filter();
      infoMapSetup();
      $buildingTiles.imagesLoaded().progress(function(instance, image) {
        var orientation, status;
        if (image.isLoaded) {
          if (image.img.naturalWidth >= image.img.naturalHeight) {
            orientation = 'landscape';
          } else {
            orientation = 'portait';
          }
          status = 'loaded';
          return $(image.img).parents('.building').addClass(status).addClass(orientation);
        } else {
          status = 'broken';
          return $(image.img).parents('.building').addClass(status);
        }
      });
      if (loadedSlug && loadedType) {
        if (loadedType === 'building') {
          return selectBuilding('slug', loadedSlug);
        } else if (loadedType === 'tour') {
          id = $('#filter .tour a[data-slug="' + loadedSlug + '"]').data('id');
          getContent(id, loadedType, 'html');
          return filter();
        }
      } else if (filterIsOn) {
        return $filterSect.addClass('show');
      } else {
        return $infoSect.addClass('show');
      }
    };
    makeDraggable = function() {
      var grid;
      return grid = Draggable.create($grid, {
        type: 'x,y',
        edgeResistance: 0.95,
        throwProps: true,
        bounds: $gridWrap
      });
    };
    hoverBuilding = function(event) {
      var $building, parent, self, slug;
      self = event.target;
      parent = $(self).parents('.building')[0];
      slug = parent.dataset.slug;
      $building = $('.building[data-slug="' + slug + '"]');
      return $building.addClass('hover');
    };
    unhoverBuilding = function(event) {
      var $building, parent, self, slug;
      self = event.target;
      parent = $(self).parents('.building')[0];
      slug = parent.dataset.slug;
      $building = $('.building[data-slug="' + slug + '"]');
      return $building.removeClass('hover');
    };
    clickBuilding = function(event) {
      var building, id, self, url;
      event.preventDefault();
      self = this;
      if ($grid.is('.dragging')) {
        return;
      }
      building = $(self).parents('.building')[0];
      if ($(building).is('.selected') && !$body.is('.full')) {
        return;
      }
      id = building.dataset.id;
      url = self.href;
      return selectBuilding('id', id, url);
    };
    selectBuilding = function(attr, val, url) {
      var $building, id;
      $building = $('.building[data-' + attr + '=' + val + ']');
      if (!$building) {
        return;
      }
      id = $building.attr('data-id');
      $('.building.selected').removeClass('selected');
      $building.addClass('selected');
      $singleSect.addClass('loading');
      getContent(id, 'building', 'html');
      if (url) {
        window.history.pushState('', document.title, url);
      }
      return openSide();
    };
    clickTour = function(event) {
      var id, tour, url;
      event.preventDefault();
      tour = this;
      id = tour.dataset.id;
      url = tour.href;
      return getContent(id, 'tour', 'html');
    };
    clickFilter = function() {
      var $li, id, key, ref, ref1, slug, type, url, value;
      event.preventDefault();
      id = this.dataset.id;
      type = this.dataset.type;
      slug = this.dataset.slug;
      url = this.href;
      $li = $(this).parent();
      $('#filter .clear').addClass('show');
      if ($(this).is('.selected')) {
        $(this).removeClass('selected');
        ref = urlQuery[type];
        for (key in ref) {
          value = ref[key];
          if (slug === value) {
            urlQuery[type].splice(key, 1);
          }
        }
        ref1 = filterQuery[type];
        for (key in ref1) {
          value = ref1[key];
          if (id === value) {
            filterQuery[type].splice(key, 1);
          }
        }
      } else {
        $(this).addClass('selected');
        filterQuery[type].push(id);
        urlQuery[type].push(slug);
      }
      filterUrl();
      return filter();
    };
    filter = function() {
      var hiddenBuildings;
      $buildings = $('.grid.buildings .building');
      hiddenBuildings = 0;
      $('.grid.buildings .building').each(function(i, building) {
        var arr, buildingValue, emptyParams, index, jndex, key, show, value, walue;
        show = true;
        emptyParams = 0;
        for (key in filterQuery) {
          arr = filterQuery[key];
          if (arr.length) {
            $('#filter .clear').addClass('show');
            buildingValue = building.dataset[key];
            if (buildingValue) {
              try {
                buildingValue = JSON.parse(buildingValue).id;
              } catch (undefined) {}
              for (index in arr) {
                value = arr[index];
                if (arr.length === 1) {
                  if (value !== buildingValue) {
                    show = false;
                  }
                } else {
                  show = false;
                  for (jndex in arr) {
                    walue = arr[jndex];
                    if (walue === buildingValue) {
                      show = true;
                    }
                  }
                }
              }
            } else {
              show = false;
            }
          } else {
            emptyParams++;
          }
        }
        if (show === true) {
          $(building).removeClass('hidden');
        } else {
          hiddenBuildings++;
          $(building).addClass('hidden');
        }
        if (emptyParams === Object.keys(filterQuery).length) {
          $('#filter .clear').removeClass('show');
        } else {
          filterIsOn = true;
        }
        if (hiddenBuildings === $buildings.length) {
          $body.removeClass('full');
          return $body.addClass('empty');
        } else {
          return $body.removeClass('empty');
        }
      });
      return resizeGrid();
    };
    filterUrl = function() {
      var newUrl, newUrlQuery, params;
      params = $.extend(true, {}, urlQuery);
      $.each(params, function(i, param) {
        if (param.length > 1) {
          return params[i] = param.join('.');
        } else if (param.length) {
          return params[i] = param[0];
        } else {
          return delete params[i];
        }
      });
      newUrlQuery = $.param(params);
      if (newUrlQuery.length) {
        if (window.location.href.split('?') > 1) {
          newUrlQuery = '&' + newUrlQuery;
        } else {
          newUrlQuery = '?' + newUrlQuery;
        }
        newUrl = window.location.origin + newUrlQuery;
      } else {
        newUrl = window.location.origin + window.location.pathname;
      }
      window.history.pushState('', document.title, newUrl);
    };
    clearFilter = function() {
      var arr, key;
      for (key in filterQuery) {
        arr = filterQuery[key];
        filterQuery[key] = [];
      }
      for (key in urlQuery) {
        arr = urlQuery[key];
        urlQuery[key] = [];
      }
      $('.filter.selected').removeClass('selected');
      filter();
      return filterUrl();
    };
    getParams = function() {
      urlQuery = {
        'tour': getParam('tour', false),
        'neighborhood': getParam('neighborhood', false),
        'era': getParam('era', false),
        'style': getParam('style', false),
        'use': getParam('use', false),
        'material': getParam('material', false)
      };
      filterQuery = {
        'tour': [],
        'neighborhood': [],
        'era': [],
        'style': [],
        'use': [],
        'material': []
      };
      return $.each(urlQuery, function(key, param) {
        var $filter, $filterList, $filterTitle, i, j, len, results, value;
        results = [];
        for (i = j = 0, len = param.length; j < len; i = ++j) {
          value = param[i];
          $filter = $('.' + key + ' .filter[data-slug="' + value + '"]');
          $filterList = $('.filters ul.' + key);
          value = $filter.data('id');
          $filterTitle = $('.filters .title[data-slug="' + key + '"]');
          $filter.addClass('selected');
          if ($filter.is('.subfilter')) {
            $filter.parents('.sub').addClass('open');
            $filter.parents('.sub').prev().addClass('toggled');
          }
          $filterList.addClass('open');
          $filterTitle.addClass('toggled');
          results.push(filterQuery[key].push(value));
        }
        return results;
      });
    };
    getParam = function(type) {
      var j, len, pair, query, response, string, strings;
      query = window.location.search.substring(1);
      strings = query.split('&');
      for (j = 0, len = strings.length; j < len; j++) {
        string = strings[j];
        pair = string.split('=');
        if (pair[0] === type) {
          if (pair[1]) {
            response = pair[1].split('.');
          }
        }
      }
      if (response) {
        return response;
      } else {
        return [];
      }
    };
    getContent = function(id, type, format, filter) {
      var url;
      url = '/api/?type=' + type;
      if (id) {
        url += '&id=' + id;
      }
      if (format) {
        url += '&format=' + format;
      }
      $.ajax({
        url: url,
        error: function(jqXHR, status, error) {
          console.error(jqXHR, status, error);
        },
        success: function(response, status, jqXHR) {
          $('.tab.selected').removeClass('selected');
          if (type === 'building' && format === 'html' && filter === 'tour') {
            $singleSect.find('.group.tour').html(response);
            return tourMapSetup();
          } else if (type === 'building' && format === 'html') {
            return updateSingleSect(response, id, 'building');
          } else if (type === 'tour' && format === 'html') {
            return updateSingleSect(response, id, 'tour');
          }
        }
      });
    };
    updateSingleSect = function(content, id, type) {
      $('section.show').removeClass('show');
      $singleSect.scrollTop(0);
      $singleSect.addClass('show').html(content).attr('data-id', id);
      if (type === 'building') {
        buildingMapSetup($singleSect);
        setUpSlider();
      } else if (type === 'tour') {
        tourMapSetup($singleSect);
      }
      $singleSect.removeClass('loading');
      return openSide();
    };
    buildingMapSetup = function(container) {
      var $buildingWrap, $map, $mapWrap, color, coords, mapObj, marker, tour;
      $buildingWrap = $(container).find('.buildingWrap');
      tour = $buildingWrap.data('tour');
      if (tour) {
        color = tour.color;
      }
      if (!color) {
        color = '#C0C0AD';
      }
      coords = $buildingWrap.data('coords');
      $(container).find('show').removeClass('show');
      $mapWrap = $(container).find('.mapWrap');
      $map = $mapWrap.find('.map');
      mapObj = new google.maps.Map($map[0], {
        scrollwheel: false,
        center: coords,
        zoom: 16
      });
      marker = new google.maps.Marker({
        map: mapObj,
        position: coords,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 1,
          strokeWeight: 0,
          scale: 5
        }
      });
      $mapWrap.addClass('loaded');
    };
    infoMapSetup = function() {
      var $info, $map, $mapWrap, bounds, mapObj;
      $info = $('section#info');
      $mapWrap = $info.find('.mapWrap');
      $map = $mapWrap.find('.map');
      mapObj = new google.maps.Map($map[0], {
        scrollwheel: false
      });
      bounds = new google.maps.LatLngBounds();
      $(allBuildings).each(function(i, building) {
        var color, coords, marker;
        coords = building.coords;
        if (building.tour && building.tour.color) {
          color = building.tour.color;
        } else {
          color = '#C0C0AD';
        }
        if (typeof coords === 'object') {
          marker = new google.maps.Marker({
            map: mapObj,
            position: coords,
            id: building._id,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: color,
              fillOpacity: 1,
              strokeWeight: 0,
              scale: 5
            }
          });
          bounds.extend(marker.getPosition());
          return marker.addListener('click', clickMarker);
        }
      });
      return google.maps.event.addListenerOnce(mapObj, 'idle', function() {
        mapObj.fitBounds(bounds);
        mapObj.setCenter(bounds.getCenter());
        return $mapWrap.addClass('loaded');
      });
    };
    tourMapSetup = function() {
      var $map, $mapWrap, $section, color, mapObj;
      $section = $('section#single');
      $mapWrap = $section.find('.mapWrap');
      $map = $mapWrap.find('.map');
      color = $mapWrap.data('color');
      if ($map.length) {
        mapObj = new google.maps.Map($map[0], {
          scrollwheel: false,
          zoom: 12
        });
        return google.maps.event.addListenerOnce(mapObj, 'idle', function() {
          var bounds;
          bounds = new google.maps.LatLngBounds();
          $(buildingsInTour).each(function(i, building) {
            var coords, marker;
            coords = building.coords;
            marker = new google.maps.Marker({
              map: mapObj,
              position: coords,
              id: building._id,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: tourColor,
                fillOpacity: 1,
                strokeWeight: 0,
                scale: 5
              }
            });
            bounds.extend(coords);
            return marker.addListener('click', clickMarker);
          });
          mapObj.fitBounds(bounds);
          mapObj.setCenter(bounds.getCenter());
          return $mapWrap.addClass('loaded');
        });
      }
    };
    clickMarker = function() {
      var id, marker;
      marker = this;
      id = marker.id;
      return selectBuilding('id', id);
    };
    setUpSlider = function() {
      var $slideWrap, $slider, $slides, $slidesWrap, sliderHeight, sliderWidth;
      $slider = $('.slider');
      $slidesWrap = $('.sliderWrap');
      $slideWrap = $('.slideWrap');
      $slides = $('.slide');
      sliderWidth = $slider.innerWidth();
      sliderHeight = $slider.innerHeight();
      $slideWrap.imagesLoaded().progress(function(instance, image) {
        var status;
        if (image.isLoaded) {
          status = 'loaded';
        } else {
          status = 'broken';
        }
        if (image) {
          $(image.img).parents('.slide').addClass(status);
        }
        if ($slides.length > 1) {
          return $slider.addClass('slippery');
        }
      });
      return $slides.each(function(i, slide) {
        var $caption, $image, $imageWrap, captionHeight, imageHeight, imageWidth, orientation, ratio;
        $image = $(slide).find('img');
        $imageWrap = $(slide).find('.imageWrap');
        imageWidth = $image[0].naturalWidth || $image[0].width;
        imageHeight = $image[0].naturalHeight || $image[0].height;
        ratio = imageWidth / imageHeight;
        orientation = ratio > 1 ? 'landscape' : 'portait';
        $caption = $(slide).find('.caption');
        captionHeight = $caption.innerHeight();
        $imageWrap.css({
          height: sliderHeight - captionHeight
        });
        $(slide).css({
          width: sliderWidth,
          height: sliderHeight
        });
        if (orientation === 'landscape') {
          return $image.css({
            maxWidth: sliderWidth - captionHeight,
            maxHeight: sliderHeight
          });
        } else if (orientation === 'portait') {
          return $image.css({
            maxHeight: sliderHeight - captionHeight,
            maxWidth: sliderWidth
          });
        }
      });
    };
    nextSlide = function() {
      var $next, $slide;
      $slide = $(this);
      $next = $slide.next('.slide');
      if (!$next.length) {
        $next = $slide.siblings('.slide').eq(0);
      }
      if ($next.length) {
        $slide.removeClass('show');
        $next.addClass('show');
      }
      return setUpSlider();
    };
    clickToggle = function() {
      var $group, group;
      group = this.dataset.group;
      $group = $('.togglable[data-group="' + group + '"]');
      if (!$group.hasClass('show')) {
        $('.togglable.show').removeClass('show');
        $group.addClass('show');
        $('.toggler.selected').removeClass('selected');
        return $(this).addClass('selected');
      }
    };
    openSide = function() {
      return $body.removeClass('full');
    };
    closeSide = function() {
      return $body.addClass('full');
    };
    resizeGrid = function() {
      var $visibleTiles, $window, edge, gridHeight, gridWidth, larger, length, sideWidth, smaller;
      $window = $(window);
      $visibleTiles = $buildingTiles.filter(':not(.hidden)');
      length = $visibleTiles.length;
      smaller = Math.floor(Math.sqrt(length));
      larger = Math.ceil(Math.sqrt(length));
      edge = $visibleTiles.eq(0).innerWidth();
      gridWidth = larger * edge;
      gridHeight = smaller * edge;
      if (gridWidth < $window.innerWidth()) {
        sideWidth = $side.innerWidth();
        gridWidth = $window.innerWidth() - sideWidth;
      }
      if (gridHeight < $window.innerHeight()) {
        gridHeight = $window.innerHeight();
      }
      if (Math.floor(gridWidth / edge) % 2 === 0) {
        $grid.addClass('even');
      } else {
        $grid.addClass('odd');
      }
      return $grid.css({
        minWidth: gridWidth + 'px',
        mineight: gridHeight + 'px'
      });
    };
    centerGrid = function() {
      var centerMatrix, centerX, centerY, gridHeight, gridWidth, matrix, wrapHeight, wrapWidth;
      return;
      wrapWidth = $gridWrap.innerWidth();
      wrapHeight = $gridWrap.innerHeight();
      gridWidth = $grid.innerWidth();
      gridHeight = $grid.innerHeight();
      matrix = $grid.css('transform');
      centerX = wrapWidth / 2 - gridWidth / 2;
      centerY = wrapHeight / 2 - gridHeight / 2;
      if (!isNaN(centerX) || !isNaN(centerY)) {
        centerMatrix = [1, 0, 0, 1, centerX, centerY].join(',');
        return $grid.css({
          transform: 'matrix(' + centerMatrix + ')'
        }).addClass('show');
      }
    };
    paginate = function() {
      var $building, $nextBuilding, direction, id;
      id = $(this).parents('section')[0].dataset.id;
      direction = $(this).data('direction');
      $building = $('.grid .building[data-id="' + id + '"]');
      if (direction === 'left') {
        $nextBuilding = $building.prev('.building');
        if (!$nextBuilding.length) {
          $nextBuilding = $('.grid .building').last();
        }
      } else if (direction === 'right') {
        $nextBuilding = $building.next('.building');
        if (!$nextBuilding.length) {
          $nextBuilding = $('.grid .building').first();
        }
      }
      id = $nextBuilding[0].dataset.id;
      return selectBuilding('id', id, '');
    };
    popState = function(e) {
      var location, params, path, slug, state, type, url;
      e.preventDefault();
      state = e.originalEvent.state;
      location = e.originalEvent.currentTarget.location;
      path = location.pathname;
      params = path.split('/');
      type = params[1];
      slug = params[2];
      url = location.href;
      if (!slug) {
        return;
      }
      if (type === 'building') {
        return selectBuilding('slug', slug);
      }
    };
    return setUp();
  };

}).call(this);
