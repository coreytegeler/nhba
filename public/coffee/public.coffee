window.initPublic = ->
	$body = $('body')
	$main = $('main')
	$side = $('aside')
	$gridWrap = $('.gridWrap')
	$grid = $('.grid')
	$rotate = $('.rotate')
	$buildingTiles = $grid.find('.building')
	$buildings = $('.building')
	$infoSect = $('section#info')
	$filterSect = $('section#filter')
	$glossarySect = $('section#glossary')
	$searchSect = $('section#search')
	$singleSect = $('section#single')
	filterQuery = {}
	urlQuery = {}
	mobile = false
	filterIsOn = false
	grid = null
	
	setUp = () ->
		$body.on 'mouseenter', '.grid .building a', hoverBuilding
		$body.on 'mouseleave', '.grid .building a', unhoverBuilding
		$body.on 'click touch', '.grid .building a', clickBuilding
		$body.on 'click touch', '.group.tour a.tour', clickTour
		$body.on 'click touch', 'a.filter', clickFilter
		$body.on 'click touch', '#filter .clear', clearFilter
		$body.on 'click touch', '.button.open', openSide
		$body.on 'click touch', '.close.tab', closeSide
		$body.on 'click touch', '.sliderWrap .arrow', nextSlide
		$body.on 'click touch', '.toggler', clickToggle
		$body.on 'click touch', '.header .arrow', paginate
		$body.on 'mousewheel', '.grid', rotate
		$body.on 'click', '.gridWrap', clearRotate
		$body.on 'submit', 'form.search', (event) ->
			search(this, event)
		$(window).on 'popstate', popState
		$(window).resize () ->
			resizeGrid()
			setUpSlider()		
		makeDraggable()
		resizeGrid()
		setUpSlider()
		getParams()
		filter()
		centerGrid()
		infoMapSetup()

		$buildingTiles.imagesLoaded().progress (instance, image) ->
	  	if(image.isLoaded)
	  		if(image.img.naturalWidth >= image.img.naturalHeight)
	  			orientation = 'landscape'
	  		else
	  			orientation = 'portait'
	  		status = 'loaded'
	  		$(image.img).parents('.building').addClass(status).addClass(orientation)
	  	else
	  		status = 'broken'
	  		$(image.img).parents('.building').addClass(status)
		
		if loadedSlug && loadedType
			if(loadedType == 'building')
				selectBuilding('slug', loadedSlug)
			else if(loadedType == 'tour')
				id = $('#filter .tour a[data-slug="'+loadedSlug+'"]').data('id')
				getContent(id, loadedType, 'html')
				filter()
		else if filterIsOn
			$filterSect.addClass('show')
		else
			$infoSect.addClass('show')

	makeDraggable = () ->
		grid = Draggable.create $grid, {
			type: 'x,y',
			edgeResistance: 0.95,
			throwProps: true,
			bounds: $gridWrap,
			dragClickables: false,
			onPress: (e) ->
				if(mobile)
					closeSide()
		}

	hoverBuilding = (event) -> 
		self = event.target
		parent = $(self).parents('.building')[0]
		slug = parent.dataset.slug
		$building = $('.building[data-slug="'+slug+'"]')
		return $building.addClass('hover');

	unhoverBuilding = (event) -> 
		self = event.target
		parent = $(self).parents('.building')[0]
		slug = parent.dataset.slug
		$building = $('.building[data-slug="'+slug+'"]')
		return $building.removeClass('hover');

	clickBuilding = (event) ->
		event.preventDefault()
		self = this
		if($grid.is('.dragging'))
			return
		building = $(self).parents('.building')[0]
		if($(building).is('.selected') && !$body.is('.full'))
			return
		id = building.dataset.id
		url = self.href
		selectBuilding('id', id, url)

	selectBuilding = (attr, val, url) ->
		$building = $('.building[data-'+attr+'='+val+']')
		if(!$building)
			return
		id = $building.attr('data-id')
		$('.building.selected').removeClass('selected')
		$building.addClass('selected')
		$singleSect.addClass('loading')
		getContent(id, 'building', 'html')
		getBuildingTours($building)
		if(url)
			window.history.pushState('', document.title, url)
		openSide()

	getBuildingTours = (building) ->
		$building = $(building)
		tours = $building.attr('data-tour')
		if(tours && tours.length)
			tours = JSON.parse(tours)
			if $.isArray(tours)
				$.each tours, (i, tour) ->
					if(tour && tour.id)
						getContent(tour.id, 'buildingTour', 'html')
			else if tours
				getContent(tours.id, 'buildingTour', 'html')

	clickTour = (event) ->
		event.preventDefault()
		tour = this
		id = tour.dataset.id
		url = tour.href
		window.history.pushState('', document.title, url)
		getContent(id, 'tour', 'html')

	clickFilter = () ->
		event.preventDefault()
		id = this.dataset.id
		type = this.dataset.type
		slug = this.dataset.slug
		url = this.href
		$li = $(this).parent()
		$('#filter .clear').addClass('show')
		if($(this).is('.selected'))
			$(this).removeClass('selected')
			for key, value of urlQuery[type]
				if(slug == value)
					urlQuery[type].splice(key, 1)
			for key, value of filterQuery[type]
				if(id == value)
					filterQuery[type].splice(key, 1)
		else if($(this).is('.all'))
			$sub = $(this).parents('.sub')
			$sub.find('a:not(.all)').each (i, filter) ->
				id = filter.dataset.id
				slug = filter.dataset.slug
				$(filter).addClass('selected')
				if(filterQuery[type].indexOf(id) < 0)
					filterQuery[type].push(id)
				if(urlQuery[type].indexOf(slug) < 0)
					urlQuery[type].push(slug)
		else
			if(type == 'tour')
				filterQuery['tour'] = []
				urlQuery['tour'] = []
				$('#filter li.tour a.selected').removeClass('selected')
				getContent(id, 'tour', 'html')
			$(this).addClass('selected')
			filterQuery[type].push(id)
			urlQuery[type].push(slug)
		filterUrl()
		filter()

	filter = () ->
		$buildings = $('.grid.buildings .building')
		hiddenBuildings = 0
		paramsLength = 0
		for type, arr of filterQuery
			if arr.length
				paramsLength++
		if(paramsLength == 0)
			noParams = true
		else
			noParams = false

		$('.grid.buildings .building').each (i, building) ->
			showing = false
			for type, arr of filterQuery
				if(arr.length)
					show = true
					$('#filter .clear').addClass('show')
					buildingSet = building.dataset[type]
					if(buildingSet)
						try
							buildingSet = JSON.parse(buildingSet)
						if(!$.isArray(buildingSet))
							buildingSet = [buildingSet]
						buildingValues = []
						for i, buildingValue of buildingSet
							if buildingValue && buildingValue.id
								buildingValues[i] = buildingValue.id
						for ii, value of arr
							resolved = false
							if(arr.length == 1)
								if($.inArray(value, buildingValues) >= 0)
									show = true
									resolved = true
								else if(!resolved)
									show = false
							else
								show  = false
								for iii, value of arr
									if($.inArray(value, buildingValues) >= 0)
										show = true
										resolved = true
									else if(!resolved)
										show = false
					else
						show = false

			if(noParams)
				$('#filter .clear').removeClass('show')
				show = true
			else
				filterIsOn = true

			if(show == true)
				$(building).removeClass('hidden')
			else
				hiddenBuildings++
				$(building).addClass('hidden')

			if(hiddenBuildings == $buildings.length)
				$body.removeClass('full')
				$body.addClass('empty')
			else
				$body.removeClass('empty')
			TweenLite.set '.grid',
				x: 0
		makeDraggable()
		resizeGrid()

	filterUrl = () ->
		params = $.extend(true, {}, urlQuery)
		$.each params, (i, param) -> 
			if param.length > 1
				params[i] = param.join('.')
			else if param.length
				params[i] = param[0]
			else
				delete params[i]
		newUrlQuery = $.param(params)
		if(newUrlQuery.length)
			if(window.location.href.split('?') > 1)
				newUrlQuery = '&' + newUrlQuery
			else
				newUrlQuery = '?' + newUrlQuery
			newUrl = window.location.origin + newUrlQuery
		else
			newUrl = window.location.origin + window.location.pathname
		window.history.pushState('', document.title, newUrl);
		return

	clearFilter = () ->
		for key, arr of filterQuery
			filterQuery[key] = []
		for key, arr of urlQuery
			urlQuery[key] = []
		$('.filters .filter.selected').removeClass('selected')
		filter()
		filterUrl()

	getParams = () ->
		urlQuery = {
			'tour': getParam('tour', false),
			'neighborhood': getParam('neighborhood', false),
			'era': getParam('era', false),
			'style': getParam('style', false),
			'use': getParam('use', false)
		}
		filterQuery = {
			'tour': [],
			'neighborhood': [],
			'era': [],
			'style': [],
			'use': []
		}

		$.each urlQuery, (key, param) -> 
			for value, i in param
				$filter = $('.'+key+' .filter[data-slug="'+value+'"]')
				$filterList = $('.filters ul[data-slug="'+key+'"]')
				value = $filter.data('id')
				$filterTitle = $('.filters .title[data-slug="'+key+'"]')
				$filter.addClass('selected')
				if($filter.is('.subfilter'))
					$filter.parents('.sub').addClass('open')
					$filter.parents('.sub').prev().addClass('toggled')
				$filterList.addClass('open')
				$filterTitle.addClass('toggled')
				filterQuery[key].push(value)


	getParam = (type) ->
		query = window.location.search.substring(1)
		strings = query.split('&')
		for string in strings
			pair = string.split('=')
			if(pair[0] == type)
				if(pair[1])
					response = pair[1].split('.')
		if(response)
			return response
		else
			return []


	getContent = (id, type, format, filter) ->
		url = '/api/?type='+type
		if(id)
			url += '&id='+id
		if(format)
			url += '&format='+format
		$.ajax
			url: url,
			error:  (jqXHR, status, error) ->
				console.error jqXHR, status, error
				return
			success: (response, status, jqXHR) ->
				$('.tab.selected').removeClass('selected')
				if(type=='building' && format=='html' && filter=='tour')
					$singleSect.find('.group.tour').html(response)
					tourMapSetup()
				else if(type=='building' && format=='html')
					updateSingleSect(response, id, 'building')
				else if(type=='tour' && format=='html')
					updateSingleSect(response, id, 'tour')
				else if(type=='buildingTour' && format=='html')
					$singleSect.find('.buildingWrap').append(response)
		return

	search = (form, event) ->
		event.preventDefault()
		query = $(form).find('input:text').val()
		url = '/search/' + query
		$.ajax
			url: url,
			error:  (jqXHR, status, error) ->
				console.error jqXHR, status, error
				return
			success: (response, status, jqXHR) ->
				console.log(response)
		return

	updateSingleSect = (content, id, type) ->
		$('section.show').removeClass('show')
		$singleSect.scrollTop(0)
		$singleSect
			.addClass('show')
			.html(content)
			.attr('data-id', id)
		$checkHtml = $singleSect.find('.checkHtml')
		$checkHtml.each () ->
			if($(this).find('div.inner').text().length <= 0)
				$(this).remove()
		if(type == 'building')
			buildingMapSetup($singleSect)
			setUpSlider()
		else if(type == 'tour')
			tourMapSetup($singleSect)
		$singleSect.removeClass('loading')
		openSide()

	buildingMapSetup = (container) ->
		$buildingWrap = $(container).find('.buildingWrap')
		tour = $buildingWrap.data('tour')
		if(tour)
			color = tour.color
		if(!color)
			color = '#C0C0AD'
		coords = $buildingWrap.data('coords')
		$(container).find('show').removeClass('show')
		$mapWrap = $(container).find('.mapWrap')
		$map = $mapWrap.find('.map')
		mapObj = new google.maps.Map $map[0], {
			scrollwheel: false,
			center: coords,
			zoom: 16
		}
		marker = new google.maps.Marker
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
		$mapWrap.addClass('loaded')
		return

	infoMapSetup = () ->
		$info = $('section#info');
		$mapWrap = $info.find('.mapWrap')
		$map = $mapWrap.find('.map')
		mapObj = new google.maps.Map $map[0], {
			scrollwheel: false
		}
		bounds = new google.maps.LatLngBounds()
		
		# DONT DO IT THIS WAY, LOAD DATA DYNAMICALLY
		$(allBuildings).each (i, building) ->
			coords = building.coords
			tours = building.tour
			color = '#C0C0AD'
			if(tours)
				if(!$.isArray(tours))
					tours = [tours]
				if tours.length && tours[0]
					color = tours[0].color
			if(typeof coords == 'object')
				marker = new google.maps.Marker
					map: mapObj,
					position: coords,
					id: building._id,
					icon: {
	          path: google.maps.SymbolPath.CIRCLE,
	          fillColor: color,
	          fillOpacity: 1,
	          # strokeColor: '#fff',
	          strokeColor: 'black',
	          strokeWeight: .25,
	          scale: 5
	        }
				bounds.extend(marker.getPosition())
				marker.addListener 'click', clickMarker
		google.maps.event.addListenerOnce mapObj, 'idle', () ->
			mapObj.fitBounds(bounds)
			mapObj.setCenter(bounds.getCenter())
			$mapWrap.addClass('loaded')

	tourMapSetup = () ->
		$section = $('section#single');
		$mapWrap = $section.find('.mapWrap')
		$map = $mapWrap.find('.map')
		color = $mapWrap.data('color')
		if($map.length)
			mapObj = new google.maps.Map $map[0], {
				scrollwheel: false,
				zoom: 12
			}
			google.maps.event.addListenerOnce mapObj, 'idle', () ->
				bounds = new google.maps.LatLngBounds()
				$(buildingsInTour).each (i, building) ->
					coords = building.coords
					marker = new google.maps.Marker
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
					bounds.extend(coords)
					marker.addListener 'click', clickMarker
				mapObj.fitBounds(bounds)
				mapObj.setCenter(bounds.getCenter())
				$mapWrap.addClass('loaded')

	clickMarker = () ->
		marker = this
		id = marker.id
		selectBuilding('id', id)

	setUpSlider = () ->
		$slider = $('.slider')
		$slidesWrap = $('.sliderWrap')
		$slideWrap = $('.slideWrap')
		$slides = $('.slide')
		sliderWidth = $slider.innerWidth()
		sliderHeight = $slider.innerHeight()

		$slideWrap.imagesLoaded().progress (instance, image) ->
			if(image.isLoaded) 
				status = 'loaded'
			else
				status =  'broken'
			if(image)
				$(image.img).parents('.slide').addClass(status)

	  if($slides.length > 1)
	  	$slider.addClass('slippery')

		$slides.each (i, slide) ->
			$image = $(slide).find('img')
			$imageWrap = $(slide).find('.imageWrap')
			imageWidth = $image[0].naturalWidth || $image[0].width
			imageHeight = $image[0].naturalHeight || $image[0].height
			ratio = imageWidth/imageHeight
			orientation = if ratio > 1 then 'landscape' else 'portait'
			$caption = $(slide).find('.caption')
			captionHeight = $caption.innerHeight()
			
			$imageWrap.css({
				height: sliderHeight - captionHeight
			})

			$(slide).css({
				width: sliderWidth
				height:	sliderHeight
			})

			if(orientation == 'landscape')
				$image.css({
					maxWidth: sliderWidth,
					maxHeight: sliderHeight - captionHeight
				})
			else if (orientation == 'portait')
				$image.css({
					maxWidth: sliderWidth,
					maxHeight: sliderHeight - captionHeight
				})

	nextSlide = () ->
		$arrow = $(this)
		$current = $arrow.parents('.sliderWrap').find('.slide.show')
		$siblings = $current.siblings('.slide')
		if($arrow.is('.left'))
			$next = $current.prev('.slide')
			if(!$next.length)
				$next = $siblings.last()
		else
			$next = $current.next('.slide')		
			if(!$next.length)
				$next = $siblings.first()
		if($next.length)
			$current.removeClass('show')
			$next.addClass('show')
			setUpSlider()

	clickToggle = () ->
		group = this.dataset.group
		$group = $('.togglable[data-group="'+group+'"]')
		if(!$group.hasClass('show'))
			$('.togglable.show').removeClass('show')
			$group.addClass('show')
			$('.toggler.selected').removeClass('selected')
			$(this).addClass('selected')

	openSide = () ->
		$body.removeClass('full')

	closeSide = () ->
		$body.addClass('full')
		windowWidth = $(window).innerWidth()
		gridWidth = $grid.innerWidth()
		right = windowWidth - (gridWidth + $grid.offset().left)
		if right > 0
			transform = $grid.css('transform')
			x = windowWidth - gridWidth
			TweenLite.set '.grid',
				x: x


	resizeGrid = () -> 
		$window = $(window)
		sideWidth = $side.innerWidth()
		$visibleTiles = $buildingTiles.filter(':not(.hidden)')
		length = $visibleTiles.length
		smaller = Math.floor(Math.sqrt(length))
		larger = Math.ceil(Math.sqrt(length))
		edge = $visibleTiles.eq(0).innerWidth()
		gridWidth = larger * edge + sideWidth
		gridHeight = smaller * edge
		# paddingLeft = sideWidth
		# console.log(larger, edge)
		# console.log(gridWidth)
		if(gridWidth < $window.innerWidth())
			gridWidth = $window.innerWidth() - sideWidth

		if(Math.floor((gridWidth/edge))%2 == 0)
			$grid.addClass('even')
		else
			$grid.addClass('odd')

		$grid.css({
			minWidth: gridWidth+'px',
			minHeight: $window.innerHeight()
		})

		if(grid)
			content = $body.css('content')
			if(content && content.replace(/['"]+/g, '') == 'mobile')
				mobile = true
			else
				mobile = false

	centerGrid = () ->
		# return
		wrapWidth = $gridWrap.innerWidth()
		wrapHeight = $gridWrap.innerHeight()
		gridWidth = $grid.innerWidth()
		gridHeight = $grid.innerHeight()
		matrix = $grid.css('transform')	
		centerX = wrapWidth/2 - gridWidth/2
		centerY = wrapHeight/2 - gridHeight/2
		if(!isNaN(centerX) || !isNaN(centerY))
			centerMatrix = [1,0,0,1,centerX,centerY].join(',')
			console.log('center matrix: ' + centerMatrix)
			$grid.css({transform: 'matrix('+centerMatrix+')'}).addClass('show')

	paginate = () ->
		id = $(this).parents('section')[0].dataset.id
		direction = $(this).data('direction')
		$building = $('.grid .building[data-id="'+id+'"]')
		$visibleBuildings = $('.grid .building:not(.hidden)')
		thisIndex = $.inArray($building[0], $visibleBuildings)
		lastIndex = $visibleBuildings.length - 1
		if(direction == 'left')
			if(thisIndex == 0)
				index = lastIndex
			else
				index = thisIndex - 1
		else if(direction == 'right')
			if(thisIndex == lastIndex)
				index = 0
			else
				index = thisIndex + 1
		$nextBuilding = $visibleBuildings.eq(index)
		id = $nextBuilding.attr('data-id')
		selectBuilding('id', id, '')


	popState = (e) ->
		e.preventDefault()
		state = e.originalEvent.state
		location = e.originalEvent.currentTarget.location
		path = location.pathname
		params = path.split('/')
		type = params[1]
		slug = params[2]
		url = location.href
		if(!slug)
			return
		if (type == 'building')
			selectBuilding('slug', slug)

	rotate = (e) ->
		x = parseInt($rotate.css('rotateX')) - e.deltaY/20
		y = parseInt($rotate.css('rotateY')) - e.deltaX/20
		max = 30
		if(x > max)
			x = max
		else if(x < -max)
			x = -max
		if(y > max)
			y = max
		else if(y < -max)
			y = -max
		# rotate3d = x+','+y+',0,1deg'
		$rotate.css
		  rotateX: x

	clearRotate = () ->
		$rotate.transition
		  rotateY: 0
		  rotateX: 0

	setUp()
