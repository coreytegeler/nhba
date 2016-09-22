$ ->
	$body = $('body')
	$main = $('main')
	$side = $('aside')

	init = () ->
		resize()
		$(window).resize resize
		$body.on 'click', 'aside li .title', openNestedNav
		$body.on 'click', 'aside .tab', switchSection
		
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
		$childList = $parentList.find('ul.'+slug)
		$title.toggleClass('toggled')
		$childList.toggleClass('open')

	switchSection = (event) ->
		$tab = $(this)
		sectionId = $tab.attr('data-section')
		if(sectionId)
			$section = $side.find('section#'+sectionId)
			$side.find('section.show').removeClass('show')
			$side.find('.tab.selected').removeClass('selected')
			$tab.addClass('selected')
			if($section.length)
				$('.building.selected').removeClass('selected')
				$section.addClass('show')
				event.preventDefault()
			else
				return

	init()
