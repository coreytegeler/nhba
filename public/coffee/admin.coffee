$ ->
	$body = $('body')
	$main = $('main')

	initAdmin = () ->
		getData()
		$body.on 'click',  'form .add', openQuicky
		$body.on 'click',  'form .images .edit', openQuicky
		$body.on 'click',  '.quicky .close', closeQuicky
		$body.on 'submit', '.quicky form', quickySave
		$body.on 'click',  'a.delete', deleteObject
		$('.select .display').click openSelect
		$('.select .options input').change updateSelectValue
		$('.updateTemplate input').change updateTemplate

		editor = new MediumEditor('textarea', {
			buttons: ['italic', 'underline'],
			placeholder: false,
			autoLink: true,
			imageDragging: false,
			disableDoubleReturn: false,
			paste: {
				cleanPastedHTML: true,
				cleanAttrs: ['style']
			}
		})
		$(editor.elements).each () ->
			$(this).addClass('editable')


	getData = () ->
		if($('form .images').length)
			$('form .images .image').each (i, imageWrap) ->
				if($(imageWrap).is('.sample'))
					addQuicky('image')	
				else
					id = $(imageWrap).attr('data-id')
					if(id)
						addQuicky('image', id)

		$('form .populate').each (i, container) ->
			modelType = $(container).data('model')
			containerType = $(container).data('type')
			addQuicky(modelType)
			$.ajax
				url: '/api/?type='+modelType+'&format=json',
				error:  (jqXHR, status, error) ->
					console.log jqXHR, status, error
					return
				success: (objects, status, jqXHR) ->
					if(!objects)
						return
					switch containerType
						when 'checkboxes'
							$(objects).each (i, object) ->
								addCheckbox(container, object)
					$(container).addClass('loaded')
					return
			return
		return

	addCheckbox = (container, object, checked) ->
		$clone = $(container).find('.sample').clone().removeClass('sample')
		$label = $clone.find('label')
		$input = $clone.find('input')
		if !object
			return
		valueObject = {name: object.name, slug: object.slug, id: object._id}
		if(object.color)
			valueObject['color'] = object.color
		value = JSON.stringify(valueObject)
		$input.attr('value', value).attr('id', object.slug+'Checkbox')
		$label.text(object.name).attr('for', object.slug+'Checkbox')
		model = $(container).data('model')
		if !checked
			checked = $(container).data('checked')
		if checked
			if $.isArray(checked)
				for checkedValue in checked
					if valueObject.id == checkedValue.id
						$input.attr('checked', true)
			if valueObject.id == checked.id
				$input.attr('checked', true)
		$clone
			.attr('data-slug', object.slug)
			.appendTo(container)
		return

	openSelect = (event) ->
		$select = $(event.target).parents('.select')
		datetype = $select.attr('data-datetype')
		$options = $select.find('.options')
		$select.siblings('.select').find('.options').removeClass('open')
		$options.toggleClass('open')
		return

	updateSelectValue = (event) ->
		option = event.target 
		value = option.value
		$select = $(option).parents('.select')
		$options = $select.find('.options')
		$display = $select.find('.display')
		$display.html(value)
		$options.removeClass('open')
		return

	addQuicky = (type, id) ->
		url = '/admin/'+type+'/quicky/'
		if(id)
			url += id
		$.ajax
			url: url
			error: (jqXHR, status, error) ->
				console.log jqXHR, status, error
				return
			success: (html, status, jqXHR) ->
				if(!html)
					return
				return $('.quickies').append(html)
		return

	openQuicky = () ->
		$button = $(this)
		id = $button.data('id')
		type = $button.data('model')
		$module = $button.parents('.module')
		if(!id)
			$quicky = $('.quicky.create[data-model="'+type+'"]')
		else
			$quicky = $('.quicky.edit[data-id="'+id+'"]')
		$quicky.addClass('open')
		$main.addClass('noscroll')
		return

	closeQuicky = () ->
		$quicky = $(this).parents('.quicky')
		$quicky.removeClass('open')
		$main.removeClass('noscroll')
		return

	quickySave = (event) ->
		event.stopPropagation()
		event.preventDefault()
		$form = $(this)
		$quicky = $form.parents('.quicky')
		id = $quicky.data('id')
		type = $quicky.data('model')
		data = new FormData()
		if(type == 'image' && !id.length)
			image = $form.find('input:file')[0].files[0]
			caption = $form.find('input.caption').val()
			data.append('image', image, image.name)
			data.append('caption', caption)
			contentType = false
			processData = false
		else
	  	data = $form.serializeArray()
	  	contentType = 'application/x-www-form-urlencoded; charset=UTF-8'
	  	processData = true

		postUrl = $form.attr('action')
		if(!data)
			return
		$.ajax
			type: 'POST',
			data: data,
			url: postUrl,
			processData: processData,
			contentType: contentType,
			error: (jqXHR, status, error) ->
				console.log(jqXHR, status, error)
				alert('Error, check browser console logs')
			success: (object, status, jqXHR) ->
				type = $quicky.data('model')
				checkboxes = $('.checkboxes.'+type)
				$quicky.removeClass('open')
				$main.removeClass('noscroll')
				if(checkboxes.length)
					addCheckbox(checkboxes, object, object._id)
				else if(type == 'image')
					addImage(object)
		return

	addImage = (object) ->
		$imagesWrapper = $('.images')
		$imagesInput = $imagesWrapper.find('input:text')
		imageObject = {
			id: object._id,
			path: object.path,
			caption: object.caption
		}

		if($imagesInput.val())
			imagesInputVal = JSON.parse($imagesInput.val())
		else
			imagesInputVal = []

		updating = false
		if(imagesInputVal.length)
			for i, thisObject of imagesInputVal
				if(thisObject.id == imageObject.id)
					imagesInputVal[i] = imageObject
					updating = true
			if(!updating)
				imagesInputVal.push(imageObject)
		else
			imagesInputVal = [imageObject]
		$imagesInput.val(JSON.stringify(imagesInputVal))

		if(!$imagesWrapper.find('.image[data-id="'+object._id+'"]').length)
			$clone = $imagesWrapper.find('.sample').clone()
			$cloneImg = $clone.find('img')
			$cloneCaption = $clone.find('.caption')
			$clone.removeClass('sample')

			$clone.attr('data-id', imageObject._id)
			$cloneImg.attr('src', imageObject.path)
			$cloneCaption.text(imageObject.caption)
			$imagesWrapper.append($clone)

	updateTemplate = (event) ->
		$input = $(event.target)
		value = $input.val()
		$('[data-template]').removeClass('show')
		$('[data-template="'+value+'"]').addClass('show')

	deleteObject = (event) ->
		if(!confirm('Are you sure you want to delete this?'))
			return event.preventDefault();
		$quicky = $(this).parents('.quicky')
		if($quicky.length) # if is image
			id = $quicky.attr('data-id')
			$input = $('.images input:text[name="images"]')
			inputVal = JSON.parse($input.val())
			inputVal = inputVal.filter (image) ->
		    return image.id != id
			inputVal = JSON.stringify(inputVal)
			$input.val(inputVal)
			$('.image[data-id="'+id+'"]').remove()
			$quicky.remove()
			$main.removeClass('noscroll')
			return event.preventDefault()

	initAdmin()




