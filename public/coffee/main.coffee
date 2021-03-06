$ ->
	$body = $('body')
	$main = $('main')
	$side = $('aside')

	init = () ->
		resize()
		$(window).resize resize
		$body.on 'click touch', 'aside li .title', openNestedNav
		$body.on 'click touch', 'aside .tab', switchSection
		
	resize = () -> 
		$window = $(window)
		windowWidth = $window.innerWidth()
		sideWidth = $side.innerWidth()

		# if(!$body.is('.full'))
		# 	mainWidth = windowWidth - sideWidth
		# 	$main.css({
		# 		marginLeft: sideWidth+'px',
		# 		width: mainWidth+'px'
		# 	})

	openNestedNav = (event) ->
		$title = $(this)
		slug = $title.attr('data-slug')
		$parentList = $title.parent()
		$childList = $parentList.find('ul[data-slug="'+slug+'"]')
		$title.toggleClass('toggled')
		$childList.toggleClass('open')

	baseUrl = () ->
		window.history.pushState('', document.title, window.location.origin)

	switchSection = (event) ->
		$tab = $(this)
		sectionId = $tab.attr('data-section')
		if(sectionId)
			$section = $side.find('section#'+sectionId)
			$side.find('section.show').scrollTop(0)
			$side.find('section.show').removeClass('show')
			$side.find('.tab.selected').removeClass('selected')
			$tab.addClass('selected')
			if($section.length)
				$('.building.selected').removeClass('selected')
				$section.addClass('show')
				event.preventDefault()
				# if(!$body.is('.admin'))
					# baseUrl()
			else
				return

	init()
