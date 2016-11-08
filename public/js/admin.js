// Generated by CoffeeScript 1.10.0
(function() {
  $(function() {
    var $body, $main, addCheckbox, addImage, addQuicky, closeQuicky, deleteObject, getData, initAdmin, openQuicky, quickySave;
    $body = $('body');
    $main = $('main');
    initAdmin = function() {
      var $sortable, sortable;
      getData();
      $body.on('click', 'form .add', openQuicky);
      $body.on('click', 'form .images .edit', openQuicky);
      $body.on('click', '.quicky .close', closeQuicky);
      $body.on('submit', '.quicky form', quickySave);
      $body.on('click', 'a.delete', deleteObject);
      $body.on('click', '.button.clear', function() {
        $('.images input:text').val('[]');
        return $('.images .image:not(.empty)').remove();
      });
      $sortable = $('.sortable');
      sortable = $('.sortable ul').sortable({
        update: function(e, elem) {
          var $sortableInput, imagesData, newOrder, newOrderClone, newOrderJson;
          newOrder = [];
          $sortableInput = $sortable.find('input');
          $(this).find('li').each(function() {
            var id;
            id = $(this).data('id');
            return newOrder.push(id);
          });
          if ($sortable.is('.images')) {
            imagesData = JSON.parse($sortableInput.val());
            newOrderClone = newOrder;
            $(imagesData).each(function() {
              var index;
              index = newOrder.indexOf(this.id);
              return newOrder[index] = this;
            });
          }
          newOrderJson = JSON.stringify(newOrder);
          return $sortable.find('input').val(newOrderJson);
        }
      });
      sortable.disableSelection();
      return $('textarea').each(function() {
        var editor;
        editor = new MediumEditor(this, {
          buttons: ['italic', 'underline', 'anchor', 'superscript'],
          placeholder: false,
          imageDragging: false,
          targetBlank: true,
          paste: {
            forcePlainText: true,
            cleanPastedHTML: true,
            cleanReplacements: [],
            cleanAttrs: ['class', 'style', 'dir'],
            cleanTags: ['meta'],
            unwrapTags: ['span', 'div', 'h1', 'h2', 'h3', 'h4', 'label']
          }
        });
        return $(editor.elements).each(function() {
          return $(this).addClass('editable');
        });
      });
    };
    getData = function() {
      if (($('form .images').length)) {
        $('form .images .image').each(function(i, imageWrap) {
          var id;
          if ($(imageWrap).is('.sample')) {
            return addQuicky('image');
          } else {
            id = $(imageWrap).attr('data-id');
            if (id) {
              return addQuicky('image', id);
            }
          }
        });
      }
      $('form .populate').each(function(i, container) {
        var containerType, label, modelType;
        modelType = $(container).data('model');
        containerType = $(container).data('type');
        label = $(container).prev('label').text();
        addQuicky(modelType, null, label);
        if (modelType === 'historicUse') {
          modelType = 'use';
        }
        $.ajax({
          url: '/api/?type=' + modelType + '&format=json',
          error: function(jqXHR, status, error) {
            console.log(jqXHR, status, error);
          },
          success: function(objects, status, jqXHR) {
            if (!objects) {
              return;
            }
            switch (containerType) {
              case 'checkboxes':
                $(objects).each(function(i, object) {
                  var checked;
                  checked = $(container).data('checked');
                  return addCheckbox(container, object, checked);
                });
            }
            $(container).addClass('loaded');
          }
        });
      });
    };
    addCheckbox = function(container, object, checked) {
      var $clone, $input, $label, checkedValue, j, len, model, value, valueObject;
      $clone = $(container).find('.empty').clone().removeClass('empty');
      $clone.find('input').attr('checked', false);
      $label = $clone.find('label');
      $input = $clone.find('input');
      if (!object) {
        return;
      }
      valueObject = {
        name: object.name,
        slug: object.slug,
        id: object._id
      };
      if (object.color) {
        valueObject['color'] = object.color;
      }
      if (object.buildings) {
        valueObject['buildings'] = object.buildings;
      }
      value = JSON.stringify(valueObject);
      model = $(container).data('model');
      $input.attr('value', value).attr('id', model + '-' + object.slug);
      $label.text(object.name).attr('for', model + '-' + object.slug);
      if (checked) {
        if ($.isArray(checked)) {
          for (j = 0, len = checked.length; j < len; j++) {
            checkedValue = checked[j];
            if (valueObject.id === JSON.parse(checkedValue).id) {
              $input.attr('checked', true);
            }
          }
        } else if (valueObject.id === checked || valueObject.id === checked.id) {
          $input.attr('checked', true);
        }
      }
      $clone.attr('data-slug', object.slug).prependTo(container);
      $(container).addClass('loaded');
    };
    addQuicky = function(type, id, label) {
      var url;
      if (($('.quicky[data-id="' + id + '"]').length)) {
        return;
      }
      url = '/admin/' + type + '/quicky/';
      if (id) {
        url += id;
      }
      $.ajax({
        url: url,
        error: function(jqXHR, status, error) {
          console.log(jqXHR, status, error);
        },
        success: function(html, status, jqXHR) {
          if (!html) {
            return;
          }
          return $('.quickies').append(html);
        }
      });
    };
    openQuicky = function() {
      var $button, $quicky, id, type;
      $button = $(this);
      id = $button.data('id');
      type = $button.data('model');
      if (!id) {
        $quicky = $('.quicky.create[data-model="' + type + '"]');
      } else {
        $quicky = $('.quicky.edit[data-id="' + id + '"]');
      }
      $quicky.addClass('open');
      $quicky.find('input[name="name"]').focus();
    };
    closeQuicky = function(quicky) {
      var $quicky;
      if (quicky.length) {
        $quicky = $(quicky);
      } else {
        $quicky = $(this).parents('.quicky');
      }
      if (!$quicky.is('[data-model="image"]')) {
        $quicky.find('input:not([type="submit"])').each(function(i, input) {
          return $(input).val('');
        });
      }
      $quicky.removeClass('open');
      $quicky.removeClass('saving');
    };
    quickySave = function(event) {
      var $form, $quicky, caption, contentType, data, id, image, postUrl, processData, type;
      event.stopPropagation();
      event.preventDefault();
      $form = $(this);
      $quicky = $form.parents('.quicky');
      id = $quicky.data('id');
      type = $quicky.data('model');
      data = new FormData();
      if (type === 'image' && !id.length) {
        image = $form.find('input:file')[0].files[0];
        caption = $form.find('input.caption').val();
        data.append('image', image, image.name);
        data.append('caption', caption);
        contentType = false;
        processData = false;
      } else {
        data = $form.serializeArray();
        contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
        processData = true;
      }
      postUrl = $form.attr('action');
      if (!data) {
        return;
      }
      $quicky.addClass('saving');
      $.ajax({
        type: 'POST',
        data: data,
        url: postUrl,
        processData: processData,
        contentType: contentType,
        error: function(jqXHR, status, error) {
          console.log(postUrl, jqXHR, status, error);
          return alert('Error, check browser console logs');
        },
        success: function(object, status, jqXHR) {
          var checkboxes;
          type = $quicky.data('model');
          checkboxes = $('.checkboxes.' + type);
          if (checkboxes.length) {
            addCheckbox(checkboxes, object, object._id);
          } else if (type === 'image') {
            addImage(object);
          }
          $quicky.removeClass('saving');
          return closeQuicky($quicky);
        }
      });
    };
    addImage = function(object) {
      var $clone, $imagesInput, $imagesWrapper, i, imageObject, imagesInputVal, newImg, thisObject, updating;
      $imagesWrapper = $('.images');
      $imagesInput = $imagesWrapper.find('input:text');
      addQuicky('image', object._id, '');
      imageObject = {
        id: object._id,
        original: object.original,
        medium: object.medium,
        small: object.small,
        caption: object.caption
      };
      if ($imagesInput.val()) {
        imagesInputVal = JSON.parse($imagesInput.val());
      } else {
        imagesInputVal = [];
      }
      updating = false;
      if (imagesInputVal.length) {
        for (i in imagesInputVal) {
          thisObject = imagesInputVal[i];
          if (thisObject.id === imageObject.id) {
            imagesInputVal[i] = imageObject;
            updating = true;
          }
        }
        if (!updating) {
          imagesInputVal.push(imageObject);
        }
      } else {
        imagesInputVal = [imageObject];
      }
      $imagesInput.val(JSON.stringify(imagesInputVal));
      if (!$imagesWrapper.find('.image[data-id="' + object._id + '"]').length) {
        $clone = $imagesWrapper.find('.sample').clone();
        $clone.removeClass('sample');
        $clone.attr('data-id', imageObject.id);
        newImg = new Image();
        newImg.onload = function() {
          $clone.find('img').remove();
          $clone.append(this);
          $clone.find('.caption').text(imageObject.caption);
          return $imagesWrapper.find('.ui-sortable').append($clone);
        };
        return newImg.src = imageObject.original;
      }
    };
    deleteObject = function(event) {
      var $input, $quicky, id, inputVal;
      if (!confirm('Are you sure you want to delete this?')) {
        return event.preventDefault();
      }
      $quicky = $(this).parents('.quicky');
      if ($quicky.length) {
        id = $quicky.attr('data-id');
        $input = $('.images input:text[name="images"]');
        inputVal = JSON.parse($input.val());
        inputVal = inputVal.filter(function(image) {
          return image.id !== id;
        });
        inputVal = JSON.stringify(inputVal);
        $input.val(inputVal);
        $('.image[data-id="' + id + '"]').remove();
        $quicky.remove();
        $main.removeClass('noscroll');
        return event.preventDefault();
      }
    };
    return initAdmin();
  });

}).call(this);
