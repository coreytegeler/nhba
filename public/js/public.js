// Generated by CoffeeScript 1.10.0
(function() {
  window.initPublic = function() {
    var $body, $buildingTiles, $buildings, $filterSect, $glossarySect, $grid, $gridWrap, $infoSect, $main, $rotate, $searchSect, $side, $singleSect, buildingMapSetup, centerGrid, clearFilter, clearRotate, clickBuilding, clickFilter, clickMarker, clickToggle, clickTour, closeSide, filter, filterIsOn, filterQuery, filterUrl, getBuildingTours, getContent, getParam, getParams, grid, hoverBuilding, infoMapSetup, makeDraggable, mobile, nextSlide, openSide, paginate, popState, resizeGrid, rotate, search, selectBuilding, setUp, setUpSlider, tourMapSetup, unhoverBuilding, updateSingleSect, urlQuery;
    $body = $('body');
    $main = $('main');
    $side = $('aside');
    $gridWrap = $('.gridWrap');
    $grid = $('.grid');
    $rotate = $('.rotate');
    $buildingTiles = $grid.find('.building');
    $buildings = $('.building');
    $infoSect = $('section#info');
    $filterSect = $('section#filter');
    $glossarySect = $('section#glossary');
    $searchSect = $('section#search');
    $singleSect = $('section#single');
    filterQuery = {};
    urlQuery = {};
    mobile = false;
    filterIsOn = false;
    grid = null;
    setUp = function() {
      var id;
      $body.on('mouseenter', '.grid .building a', hoverBuilding);
      $body.on('mouseleave', '.grid .building a', unhoverBuilding);
      $body.on('click touch', '.grid .building a', clickBuilding);
      $body.on('click touch', '.group.tour a.tour', clickTour);
      $body.on('click touch', 'a.filter', clickFilter);
      $body.on('click touch', '#filter .clear', clearFilter);
      $body.on('click touch', '.button.open', openSide);
      $body.on('click touch', '.close.tab', closeSide);
      $body.on('click touch', '.sliderWrap .arrow', nextSlide);
      $body.on('click touch', '.toggler', clickToggle);
      $body.on('click touch', '.header .arrow', paginate);
      $body.on('mousewheel', '.grid', rotate);
      $body.on('click', '.gridWrap', clearRotate);
      $body.on('submit', 'form.search', function(event) {
        return search(this, event);
      });
      $(window).on('popstate', popState);
      $(window).resize(function() {
        resizeGrid();
        return setUpSlider();
      });
      makeDraggable();
      resizeGrid();
      setUpSlider();
      getParams();
      filter();
      centerGrid();
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
      return grid = Draggable.create($grid, {
        type: 'x,y',
        edgeResistance: 0.95,
        throwProps: true,
        bounds: $gridWrap,
        dragClickables: false,
        onPress: function(e) {
          if (mobile) {
            return closeSide();
          }
        }
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
      getBuildingTours($building);
      if (url) {
        window.history.pushState('', document.title, url);
      }
      return openSide();
    };
    getBuildingTours = function(building) {
      var $building, tours;
      $building = $(building);
      tours = $building.attr('data-tour');
      if (tours && tours.length) {
        tours = JSON.parse(tours);
        if ($.isArray(tours)) {
          return $.each(tours, function(i, tour) {
            if (tour && tour.id) {
              return getContent(tour.id, 'buildingTour', 'html');
            }
          });
        } else if (tours) {
          return getContent(tours.id, 'buildingTour', 'html');
        }
      }
    };
    clickTour = function(event) {
      var id, tour, url;
      event.preventDefault();
      tour = this;
      id = tour.dataset.id;
      url = tour.href;
      window.history.pushState('', document.title, url);
      return getContent(id, 'tour', 'html');
    };
    clickFilter = function() {
      var $li, $sub, id, key, ref, ref1, slug, type, url, value;
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
      } else if ($(this).is('.all')) {
        $sub = $(this).parents('.sub');
        $sub.find('a:not(.all)').each(function(i, filter) {
          id = filter.dataset.id;
          slug = filter.dataset.slug;
          $(filter).addClass('selected');
          if (filterQuery[type].indexOf(id) < 0) {
            filterQuery[type].push(id);
          }
          if (urlQuery[type].indexOf(slug) < 0) {
            return urlQuery[type].push(slug);
          }
        });
      } else {
        if (type === 'tour') {
          filterQuery['tour'] = [];
          urlQuery['tour'] = [];
          $('#filter li.tour a.selected').removeClass('selected');
          getContent(id, 'tour', 'html');
        }
        $(this).addClass('selected');
        filterQuery[type].push(id);
        urlQuery[type].push(slug);
      }
      filterUrl();
      return filter();
    };
    filter = function() {
      var arr, hiddenBuildings, noParams, paramsLength, type;
      $buildings = $('.grid.buildings .building');
      hiddenBuildings = 0;
      paramsLength = 0;
      for (type in filterQuery) {
        arr = filterQuery[type];
        if (arr.length) {
          paramsLength++;
        }
      }
      if (paramsLength === 0) {
        noParams = true;
      } else {
        noParams = false;
      }
      $('.grid.buildings .building').each(function(i, building) {
        var buildingSet, buildingValue, buildingValues, ii, iii, resolved, show, showing, value;
        showing = false;
        for (type in filterQuery) {
          arr = filterQuery[type];
          if (arr.length) {
            show = true;
            $('#filter .clear').addClass('show');
            buildingSet = building.dataset[type];
            if (buildingSet) {
              try {
                buildingSet = JSON.parse(buildingSet);
              } catch (undefined) {}
              if (!$.isArray(buildingSet)) {
                buildingSet = [buildingSet];
              }
              buildingValues = [];
              for (i in buildingSet) {
                buildingValue = buildingSet[i];
                if (buildingValue && buildingValue.id) {
                  buildingValues[i] = buildingValue.id;
                }
              }
              for (ii in arr) {
                value = arr[ii];
                resolved = false;
                if (arr.length === 1) {
                  if ($.inArray(value, buildingValues) >= 0) {
                    show = true;
                    resolved = true;
                  } else if (!resolved) {
                    show = false;
                  }
                } else {
                  show = false;
                  for (iii in arr) {
                    value = arr[iii];
                    if ($.inArray(value, buildingValues) >= 0) {
                      show = true;
                      resolved = true;
                    } else if (!resolved) {
                      show = false;
                    }
                  }
                }
              }
            } else {
              show = false;
            }
          }
        }
        if (noParams) {
          $('#filter .clear').removeClass('show');
          show = true;
        } else {
          filterIsOn = true;
        }
        if (show === true) {
          $(building).removeClass('hidden');
        } else {
          hiddenBuildings++;
          $(building).addClass('hidden');
        }
        if (hiddenBuildings === $buildings.length) {
          $body.removeClass('full');
          $body.addClass('empty');
        } else {
          $body.removeClass('empty');
        }
        return TweenLite.set('.grid', {
          x: 0
        });
      });
      makeDraggable();
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
      $('.filters .filter.selected').removeClass('selected');
      filter();
      return filterUrl();
    };
    getParams = function() {
      urlQuery = {
        'tour': getParam('tour', false),
        'neighborhood': getParam('neighborhood', false),
        'era': getParam('era', false),
        'style': getParam('style', false),
        'use': getParam('use', false)
      };
      filterQuery = {
        'tour': [],
        'neighborhood': [],
        'era': [],
        'style': [],
        'use': []
      };
      return $.each(urlQuery, function(key, param) {
        var $filter, $filterList, $filterTitle, i, j, len, results, value;
        results = [];
        for (i = j = 0, len = param.length; j < len; i = ++j) {
          value = param[i];
          $filter = $('.' + key + ' .filter[data-slug="' + value + '"]');
          $filterList = $('.filters ul[data-slug="' + key + '"]');
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
          } else if (type === 'buildingTour' && format === 'html') {
            return $singleSect.find('.buildingWrap').append(response);
          }
        }
      });
    };
    search = function(form, event) {
      var query, url;
      event.preventDefault();
      query = $(form).find('input:text').val();
      url = '/search/' + query;
      $.ajax({
        url: url,
        error: function(jqXHR, status, error) {
          console.error(jqXHR, status, error);
        },
        success: function(response, status, jqXHR) {
          return console.log(response);
        }
      });
    };
    updateSingleSect = function(content, id, type) {
      var $checkHtml;
      $('section.show').removeClass('show');
      $singleSect.scrollTop(0);
      $singleSect.addClass('show').html(content).attr('data-id', id);
      $checkHtml = $singleSect.find('.checkHtml');
      $checkHtml.each(function() {
        if ($(this).find('div.small').text().length <= 0) {
          return $(this).remove();
        }
      });
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
          strokeColor: 'black',
          strokeWeight: .25,
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
        var color, coords, marker, tours;
        coords = building.coords;
        tours = building.tour;
        color = '#C0C0AD';
        if (tours) {
          if (!$.isArray(tours)) {
            tours = [tours];
          }
          if (tours.length && tours[0]) {
            color = tours[0].color;
          }
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
              strokeColor: 'black',
              strokeWeight: .25,
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
                strokeColor: 'black',
                strokeWeight: .25,
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
            maxWidth: sliderWidth,
            maxHeight: sliderHeight - captionHeight
          });
        } else if (orientation === 'portait') {
          return $image.css({
            maxWidth: sliderWidth,
            maxHeight: sliderHeight - captionHeight
          });
        }
      });
    };
    nextSlide = function() {
      var $arrow, $current, $next, $siblings;
      $arrow = $(this);
      $current = $arrow.parents('.sliderWrap').find('.slide.show');
      $siblings = $current.siblings('.slide');
      if ($arrow.is('.left')) {
        $next = $current.prev('.slide');
        if (!$next.length) {
          $next = $siblings.last();
        }
      } else {
        $next = $current.next('.slide');
        if (!$next.length) {
          $next = $siblings.first();
        }
      }
      if ($next.length) {
        $current.removeClass('show');
        $next.addClass('show');
        return setUpSlider();
      }
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
      var gridWidth, right, transform, windowWidth, x;
      $body.addClass('full');
      windowWidth = $(window).innerWidth();
      gridWidth = $grid.innerWidth();
      right = windowWidth - (gridWidth + $grid.offset().left);
      if (right > 0) {
        transform = $grid.css('transform');
        x = windowWidth - gridWidth;
        return TweenLite.set('.grid', {
          x: x
        });
      }
    };
    resizeGrid = function() {
      var $visibleTiles, $window, content, edge, gridHeight, gridWidth, larger, length, sideWidth, smaller;
      $window = $(window);
      sideWidth = $side.innerWidth();
      $visibleTiles = $buildingTiles.filter(':not(.hidden)');
      length = $visibleTiles.length;
      smaller = Math.floor(Math.sqrt(length));
      larger = Math.ceil(Math.sqrt(length));
      edge = $visibleTiles.eq(0).innerWidth();
      gridWidth = larger * edge + sideWidth;
      gridHeight = smaller * edge;
      if (gridWidth < $window.innerWidth()) {
        gridWidth = $window.innerWidth() - sideWidth;
      }
      if (Math.floor(gridWidth / edge) % 2 === 0) {
        $grid.addClass('even');
      } else {
        $grid.addClass('odd');
      }
      $grid.css({
        minWidth: gridWidth + 'px',
        minHeight: $window.innerHeight()
      });
      if (grid) {
        content = $body.css('content');
        if (content && content.replace(/['"]+/g, '') === 'mobile') {
          return mobile = true;
        } else {
          return mobile = false;
        }
      }
    };
    centerGrid = function() {
      var centerMatrix, centerX, centerY, gridHeight, gridWidth, matrix, wrapHeight, wrapWidth;
      wrapWidth = $gridWrap.innerWidth();
      wrapHeight = $gridWrap.innerHeight();
      gridWidth = $grid.innerWidth();
      gridHeight = $grid.innerHeight();
      matrix = $grid.css('transform');
      centerX = wrapWidth / 2 - gridWidth / 2;
      centerY = wrapHeight / 2 - gridHeight / 2;
      if (!isNaN(centerX) || !isNaN(centerY)) {
        centerMatrix = [1, 0, 0, 1, centerX, centerY].join(',');
        console.log('center matrix: ' + centerMatrix);
        return $grid.css({
          transform: 'matrix(' + centerMatrix + ')'
        }).addClass('show');
      }
    };
    paginate = function() {
      var $building, $nextBuilding, $visibleBuildings, direction, id, index, lastIndex, thisIndex;
      id = $(this).parents('section')[0].dataset.id;
      direction = $(this).data('direction');
      $building = $('.grid .building[data-id="' + id + '"]');
      $visibleBuildings = $('.grid .building:not(.hidden)');
      thisIndex = $.inArray($building[0], $visibleBuildings);
      lastIndex = $visibleBuildings.length - 1;
      if (direction === 'left') {
        if (thisIndex === 0) {
          index = lastIndex;
        } else {
          index = thisIndex - 1;
        }
      } else if (direction === 'right') {
        if (thisIndex === lastIndex) {
          index = 0;
        } else {
          index = thisIndex + 1;
        }
      }
      $nextBuilding = $visibleBuildings.eq(index);
      id = $nextBuilding.attr('data-id');
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
    rotate = function(e) {
      var max, x;
      x = parseInt($rotate.css('rotateX')) - e.deltaY / 20;
      max = 30;
      if (x > max) {
        x = max;
      } else if (x < -max) {
        x = -max;
      }
      return $rotate.css({
        rotateX: x
      });
    };
    clearRotate = function() {
      return $rotate.transition({
        rotateY: 0,
        rotateX: 0
      });
    };
    return setUp();
  };

}).call(this);
