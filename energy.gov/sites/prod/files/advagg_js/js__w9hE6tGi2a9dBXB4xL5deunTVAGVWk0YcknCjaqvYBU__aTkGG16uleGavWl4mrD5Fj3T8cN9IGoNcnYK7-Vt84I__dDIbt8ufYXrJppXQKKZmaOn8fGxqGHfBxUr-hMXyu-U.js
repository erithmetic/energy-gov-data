/* JavaScript for ext_link_page */

(function ($) {

function extLinkPageModal(url) {
  var title, message, modal, timeoutId;

  // Generate message for external link modal window
  title = Drupal.settings.ext_link_page.messageTitle ? String(Drupal.settings.ext_link_page.messageTitle) : '';
  message = Drupal.settings.ext_link_page.messageBody ? String(Drupal.settings.ext_link_page.messageBody) : '';
  message = message.replace(/\[url\]/gi, url)
    .replace(/\[link\]/gi, '<a href="' + url + '">' + url + '</a>')
    .replace(/\[delay\]/gi, Drupal.settings.ext_link_page.delay)
    .replace(/\[site_name\]/gi, Drupal.settings.ext_link_page.siteName);

  // If directDisable is enabled, then do not automatically redirect.
  directDisable = Drupal.settings.ext_link_page.directDisable ? parseInt(Drupal.settings.ext_link_page.directDisable, 10) : 0;

  // If delay is 0, then redirect immediately (unless directDisable is set).
  delay = Drupal.settings.ext_link_page.delay ? parseInt(Drupal.settings.ext_link_page.delay, 10) : 0;
  if (!directDisable && !delay) {
    window.location.href = url;
    return;
  }

  // Display the message as a jQuery UI modal window
  timeoutId = false;
  modal = $('<div id="extLinkPageModal-content">' + message + '</div>');
  modal.dialog({
    buttons: [
      {
        text: Drupal.t('Cancel'),
        click: function () { $(this).dialog('close'); }
      },
      {
        text: Drupal.t('Continue to this site'),
        click: function () { window.location.href = url; }
      }
    ],
    open: function () {
      if (!directDisable) {
        timeoutId = setTimeout(function () { window.location.href = url; }, delay * 1000);
      }
      $('.ui-widget-overlay').addClass('extLinkPage');
    },
    close: function () {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      $('.ui-widget-overlay').removeClass('extLinkPage');
    },
    dialogClass: 'extLinkPage',
    draggable: false,
    modal: true,
    resizable: false,
    title: title,
    width: 400
  });
}

function extLinkPageAttach(context) {
  // Find all links that are directed to the external link page.
  $('a[href^="' + Drupal.settings.ext_link_page.pathLinkPage + '"]', context).each(function () {
    var url = false, urlsource, pos1, pos2;
    try {
      urlsource = this.href;
      pos1 = urlsource.indexOf('?url=');
      if (pos1 > 0) {
        pos2 = urlsource.indexOf('&', pos1 + 1);
        url = decodeURIComponent(urlsource.substring(pos1 + 5, (pos2 == -1) ? urlsource.length : pos2));
      }
    }
    // IE7 throws errors often when dealing with irregular links, such as:
    // <a href="node/10"></a> Empty tags.
    // <a href="http://user:pass@example.com">example</a> User:pass syntax.
    catch (error) {
      return;
    }

    if (Drupal.settings.ext_link_page.extLinkClass && !$(this).find('img').length) {
      // Apply the "ext" class to all links not containing images.
      $(this).addClass(Drupal.settings.ext_link_page.extLinkClass);
      if ($(this).css('display') == 'inline') {
        $(this).after('<span class=' + Drupal.settings.ext_link_page.extLinkClass + '></span>');
      }
    }

    // Attach handler for clicks
    if (url) {
      $(this).click(function (e) {
        extLinkPageModal(url);
        e.preventDefault();
      });
    }
  });

  // Work around for Internet Explorer box model problems.
  if (($.support && $.support.boxModel !== undefined && !$.support.boxModel) || ($.browser.msie && parseInt($.browser.version, 10) <= 7)) {
    $('span.ext, span.mailto').css('display', 'inline-block');
  }
}

Drupal.behaviors.ext_link_page = {attach: extLinkPageAttach};

})(jQuery);
;/**/
!function(t){Drupal.behaviors.image_caption={attach:function(i,s){t("img.caption:not(.caption-processed)").each(function(i){var s=t(this).width()?t(this).width():!1,a=t(this).height()?t(this).height():!1,h=t(this).attr("title");if(t(this).attr("align")){var e=t(this).attr("align");t(this).css({"float":e}),t(this).removeAttr("align")}else if(t(this).css("float"))var e=t(this).css("float");else var e="normal";var n=t(this).attr("style")?t(this).attr("style"):"";t(this).removeAttr("width"),t(this).removeAttr("height"),t(this).css("width",""),t(this).css("height",""),t(this).removeAttr("align"),t(this).removeAttr("style"),t(this).wrap('<span class="image-caption-container" style="display:inline-block;'+n+'"></span>'),t(this).parent().addClass("image-caption-container-"+e),s&&(t(this).width(s),t(this).parent().width(s)),a&&t(this).height(a),h&&(t(this).parent().append('<span style="display:block;" class="image-caption">'+h+"</span>"),t(this).addClass("caption-processed"))})}}}(jQuery);;/**/
(function ($) {
  $(document).ready(function() {
    // New social media header widget.
    $('div#energy-social-widget a.energy-social-link').click(function() {
      mediaId = $(this).attr('id').substring(14);
      _gaq.push(['_trackEvent', 'SocialBanner', mediaId]);
    });
    $('div#energy-social-widget input.energy-social-link').click(function() {
      _gaq.push(['_trackEvent', 'SocialBanner', 'Email']);
    });

  });
}(jQuery));
;/**/
(function ($) {

/**
 * Retrieves the summary for the first element.
 */
$.fn.drupalGetSummary = function () {
  var callback = this.data('summaryCallback');
  return (this[0] && callback) ? $.trim(callback(this[0])) : '';
};

/**
 * Sets the summary for all matched elements.
 *
 * @param callback
 *   Either a function that will be called each time the summary is
 *   retrieved or a string (which is returned each time).
 */
$.fn.drupalSetSummary = function (callback) {
  var self = this;

  // To facilitate things, the callback should always be a function. If it's
  // not, we wrap it into an anonymous function which just returns the value.
  if (typeof callback != 'function') {
    var val = callback;
    callback = function () { return val; };
  }

  return this
    .data('summaryCallback', callback)
    // To prevent duplicate events, the handlers are first removed and then
    // (re-)added.
    .unbind('formUpdated.summary')
    .bind('formUpdated.summary', function () {
      self.trigger('summaryUpdated');
    })
    // The actual summaryUpdated handler doesn't fire when the callback is
    // changed, so we have to do this manually.
    .trigger('summaryUpdated');
};

/**
 * Sends a 'formUpdated' event each time a form element is modified.
 */
Drupal.behaviors.formUpdated = {
  attach: function (context) {
    // These events are namespaced so that we can remove them later.
    var events = 'change.formUpdated click.formUpdated blur.formUpdated keyup.formUpdated';
    $(context)
      // Since context could be an input element itself, it's added back to
      // the jQuery object and filtered again.
      .find(':input').andSelf().filter(':input')
      // To prevent duplicate events, the handlers are first removed and then
      // (re-)added.
      .unbind(events).bind(events, function () {
        $(this).trigger('formUpdated');
      });
  }
};

/**
 * Prepopulate form fields with information from the visitor cookie.
 */
Drupal.behaviors.fillUserInfoFromCookie = {
  attach: function (context, settings) {
    $('form.user-info-from-cookie').once('user-info-from-cookie', function () {
      var formContext = this;
      $.each(['name', 'mail', 'homepage'], function () {
        var $element = $('[name=' + this + ']', formContext);
        var cookie = $.cookie('Drupal.visitor.' + this);
        if ($element.length && cookie) {
          $element.val(cookie);
        }
      });
    });
  }
};

})(jQuery);
;/**/
(function ($) {

/**
 * Toggle the visibility of a fieldset using smooth animations.
 */
Drupal.toggleFieldset = function (fieldset) {
  var $fieldset = $(fieldset);
  if ($fieldset.is('.collapsed')) {
    var $content = $('> .fieldset-wrapper', fieldset).hide();
    $fieldset
      .removeClass('collapsed')
      .trigger({ type: 'collapsed', value: false })
      .find('> legend span.fieldset-legend-prefix').html(Drupal.t('Hide'));
    $content.slideDown({
      duration: 'fast',
      easing: 'linear',
      complete: function () {
        Drupal.collapseScrollIntoView(fieldset);
        fieldset.animating = false;
      },
      step: function () {
        // Scroll the fieldset into view.
        Drupal.collapseScrollIntoView(fieldset);
      }
    });
  }
  else {
    $fieldset.trigger({ type: 'collapsed', value: true });
    $('> .fieldset-wrapper', fieldset).slideUp('fast', function () {
      $fieldset
        .addClass('collapsed')
        .find('> legend span.fieldset-legend-prefix').html(Drupal.t('Show'));
      fieldset.animating = false;
    });
  }
};

/**
 * Scroll a given fieldset into view as much as possible.
 */
Drupal.collapseScrollIntoView = function (node) {
  var h = document.documentElement.clientHeight || document.body.clientHeight || 0;
  var offset = document.documentElement.scrollTop || document.body.scrollTop || 0;
  var posY = $(node).offset().top;
  var fudge = 55;
  if (posY + node.offsetHeight + fudge > h + offset) {
    if (node.offsetHeight > h) {
      window.scrollTo(0, posY);
    }
    else {
      window.scrollTo(0, posY + node.offsetHeight - h + fudge);
    }
  }
};

Drupal.behaviors.collapse = {
  attach: function (context, settings) {
    $('fieldset.collapsible', context).once('collapse', function () {
      var $fieldset = $(this);
      // Expand fieldset if there are errors inside, or if it contains an
      // element that is targeted by the URI fragment identifier.
      var anchor = location.hash && location.hash != '#' ? ', ' + location.hash : '';
      if ($fieldset.find('.error' + anchor).length) {
        $fieldset.removeClass('collapsed');
      }

      var summary = $('<span class="summary"></span>');
      $fieldset.
        bind('summaryUpdated', function () {
          var text = $.trim($fieldset.drupalGetSummary());
          summary.html(text ? ' (' + text + ')' : '');
        })
        .trigger('summaryUpdated');

      // Turn the legend into a clickable link, but retain span.fieldset-legend
      // for CSS positioning.
      var $legend = $('> legend .fieldset-legend', this);

      $('<span class="fieldset-legend-prefix element-invisible"></span>')
        .append($fieldset.hasClass('collapsed') ? Drupal.t('Show') : Drupal.t('Hide'))
        .prependTo($legend)
        .after(' ');

      // .wrapInner() does not retain bound events.
      var $link = $('<a class="fieldset-title" href="#"></a>')
        .prepend($legend.contents())
        .appendTo($legend)
        .click(function () {
          var fieldset = $fieldset.get(0);
          // Don't animate multiple times.
          if (!fieldset.animating) {
            fieldset.animating = true;
            Drupal.toggleFieldset(fieldset);
          }
          return false;
        });

      $legend.append(summary);
    });
  }
};

})(jQuery);
;/**/

(function($) {

/**
 * Drupal FieldGroup object.
 */
Drupal.FieldGroup = Drupal.FieldGroup || {};
Drupal.FieldGroup.Effects = Drupal.FieldGroup.Effects || {};
Drupal.FieldGroup.groupWithfocus = null;

Drupal.FieldGroup.setGroupWithfocus = function(element) {
  element.css({display: 'block'});
  Drupal.FieldGroup.groupWithfocus = element;
}

/**
 * Implements Drupal.FieldGroup.processHook().
 */
Drupal.FieldGroup.Effects.processFieldset = {
  execute: function (context, settings, type) {
    if (type == 'form') {
      // Add required fields mark to any fieldsets containing required fields
      $('fieldset.fieldset', context).once('fieldgroup-effects', function(i) {
        if ($(this).is('.required-fields') && $(this).find('.form-required').length > 0) {
          $('legend span.fieldset-legend', $(this)).eq(0).append(' ').append($('.form-required').eq(0).clone());
        }
        if ($('.error', $(this)).length) {
          $('legend span.fieldset-legend', $(this)).eq(0).addClass('error');
          Drupal.FieldGroup.setGroupWithfocus($(this));
        }
      });
    }
  }
}

/**
 * Implements Drupal.FieldGroup.processHook().
 */
Drupal.FieldGroup.Effects.processAccordion = {
  execute: function (context, settings, type) {
    $('div.field-group-accordion-wrapper', context).once('fieldgroup-effects', function () {
      var wrapper = $(this);

      wrapper.accordion({
        autoHeight: false,
        active: '.field-group-accordion-active',
        collapsible: true,
        changestart: function(event, ui) {
          if ($(this).hasClass('effect-none')) {
            ui.options.animated = false;
          }
          else {
            ui.options.animated = 'slide';
          }
        }
      });

      if (type == 'form') {
        // Add required fields mark to any element containing required fields
        wrapper.find('div.accordion-item').each(function(i){
          if ($(this).is('.required-fields') && $(this).find('.form-required').length > 0) {
            $('h3.ui-accordion-header').eq(i).append(' ').append($('.form-required').eq(0).clone());
          }
          if ($('.error', $(this)).length) {
            $('h3.ui-accordion-header').eq(i).addClass('error');
            var activeOne = $(this).parent().accordion("activate" , i);
            $('.ui-accordion-content-active', activeOne).css({height: 'auto', width: 'auto', display: 'block'});
          }
        });
      }
    });
  }
}

/**
 * Implements Drupal.FieldGroup.processHook().
 */
Drupal.FieldGroup.Effects.processHtabs = {
  execute: function (context, settings, type) {
    if (type == 'form') {
      // Add required fields mark to any element containing required fields
      $('fieldset.horizontal-tabs-pane', context).once('fieldgroup-effects', function(i) {
        if ($(this).is('.required-fields') && $(this).find('.form-required').length > 0) {
          $(this).data('horizontalTab').link.find('strong:first').after($('.form-required').eq(0).clone()).after(' ');
        }
        if ($('.error', $(this)).length) {
          $(this).data('horizontalTab').link.parent().addClass('error');
          Drupal.FieldGroup.setGroupWithfocus($(this));
          $(this).data('horizontalTab').focus();
        }
      });
    }
  }
}

/**
 * Implements Drupal.FieldGroup.processHook().
 */
Drupal.FieldGroup.Effects.processTabs = {
  execute: function (context, settings, type) {
    if (type == 'form') {
      // Add required fields mark to any fieldsets containing required fields
      $('fieldset.vertical-tabs-pane', context).once('fieldgroup-effects', function(i) {
        if ($(this).is('.required-fields') && $(this).find('.form-required').length > 0) {
          $(this).data('verticalTab').link.find('strong:first').after($('.form-required').eq(0).clone()).after(' ');
        }
        if ($('.error', $(this)).length) {
          $(this).data('verticalTab').link.parent().addClass('error');
          Drupal.FieldGroup.setGroupWithfocus($(this));
          $(this).data('verticalTab').focus();
        }
      });
    }
  }
}

/**
 * Implements Drupal.FieldGroup.processHook().
 *
 * TODO clean this up meaning check if this is really
 *      necessary.
 */
Drupal.FieldGroup.Effects.processDiv = {
  execute: function (context, settings, type) {

    $('div.collapsible', context).once('fieldgroup-effects', function() {
      var $wrapper = $(this);

      // Turn the legend into a clickable link, but retain span.field-group-format-toggler
      // for CSS positioning.

      var $toggler = $('span.field-group-format-toggler:first', $wrapper);
      var $link = $('<a class="field-group-format-title" href="#"></a>');
      $link.prepend($toggler.contents());

      // Add required field markers if needed
      if ($(this).is('.required-fields') && $(this).find('.form-required').length > 0) {
        $link.append(' ').append($('.form-required').eq(0).clone());
      }

      $link.appendTo($toggler);

      // .wrapInner() does not retain bound events.
      $link.click(function () {
        var wrapper = $wrapper.get(0);
        // Don't animate multiple times.
        if (!wrapper.animating) {
          wrapper.animating = true;
          var speed = $wrapper.hasClass('speed-fast') ? 300 : 1000;
          if ($wrapper.hasClass('effect-none') && $wrapper.hasClass('speed-none')) {
            $('> .field-group-format-wrapper', wrapper).toggle();
          }
          else if ($wrapper.hasClass('effect-blind')) {
            $('> .field-group-format-wrapper', wrapper).toggle('blind', {}, speed);
          }
          else {
            $('> .field-group-format-wrapper', wrapper).toggle(speed);
          }
          wrapper.animating = false;
        }
        $wrapper.toggleClass('collapsed');
        return false;
      });

    });
  }
};

/**
 * Behaviors.
 */
Drupal.behaviors.fieldGroup = {
  attach: function (context, settings) {
    if (settings.field_group == undefined) {
      return;
    }

    // Execute all of them.
    $.each(Drupal.FieldGroup.Effects, function (func) {
      // We check for a wrapper function in Drupal.field_group as
      // alternative for dynamic string function calls.
      var type = func.toLowerCase().replace("process", "");
      if (settings.field_group[type] != undefined && $.isFunction(this.execute)) {
        this.execute(context, settings, settings.field_group[type]);
      }
    });

    // Fixes css for fieldgroups under vertical tabs.
    $('.fieldset-wrapper .fieldset > legend').css({display: 'block'});
    $('.vertical-tabs fieldset.fieldset').addClass('default-fallback');

  }
};

})(jQuery);;/**/
/**
 * @file: tab_builder.js
 * 
 * take the html markup for tabbed/accordion body
 * content and convert to the desired presentation.
 * 
 * we'll have to rework the markup structure first and then,
 * we can apply the toggle event elements for the user interaction
 * bits.
 */

(function ($){
	
	Drupal.behaviors.wysiwyg_tools_plus_theme_createTabs = {
		attach:function (context) {
			//tabbed elements first
			// for each of the div's apply an id to each
			$('.ready-tabber', context).each(function (index) {

				// a couple of opening set-ups for first run.
				if (index == 0) {
					//create the ul that our headers can be added to for the tabs row plus id's to link to content
					$(this).before('<ul class="ready-tabs"></ul>');
				}
				// add an indexed id to the div
				$(this).attr('id', 'content-' + index);

				//wrap the tab header as an anchor and li
				$(this).children('.ready-tabber-header').wrap('<li class="ready-tab"><a id="tab-' + index + '" href="javascript:void(0);"></a></li>');

				// move the header element to the ul as a li
				$(this).children('li').appendTo('ul.ready-tabs');
			});
			$('.ready-tabs', context).after('<br clear="all" />');
		}
	}
	
	Drupal.behaviors.wysiwyg_tools_plus_theme_createAccordions = {
		attach:function (context) {
			$('.ready-accordion').each(function (index) {
				$(this).attr('id', 'acc-' + index);
				$(this).children('.ready-accordion-header').wrap('<a class="acc-head" id="acc-head-' + index + '" href="javascript:void(0);"></a>');
				$(this).children('a.acc-head').insertBefore(jQuery(this));

        // awful hack: apply .last to the accordion heads which appear to be last
        if ($(this).next().length == 0 || !$(this).next().hasClass("ready-accordion")) {
          $(this).prev().addClass("last");
        }
			});

		}
	}
	
	Drupal.behaviors.wysiwyg_tools_plus_theme_initPage = {
		attach:function (context) {
			$('.ready-accordion', context).hide();
			$('.acc-head', context).children('span').addClass('collapsed');
			// set the click events
			$('.ready-tabs a', context).click(function (event) {
				idClicked = this.id;
				wysiwyg_tools_plus_theme_toggleTabContent(idClicked);
			});

			$('.acc-head', context).click(function (event) {
				idClicked = this.id;
				wysiwyg_tools_plus_theme_toggleAccordionContent(idClicked);

        // attach an active class to active accordion heads
        if ($(this).children('span').hasClass("expanded")) {
          $(this).children('span').removeClass("expanded");
					$(this).children('span').addClass("collapsed");
        } else {
          $(this).children('span').addClass("expanded");
					$(this).children('span').removeClass("collapsed");
        }

			});
			wysiwyg_tools_plus_theme_toggleTabContent('tab-0');
		}
	}	
	
	/**
	 * Toggle the visibility of the tab content and set active link
	 */
	function wysiwyg_tools_plus_theme_toggleTabContent (eventId) {
		eventId = eventId.substring(eventId.length-1, eventId.length);
		$('.ready-tabber').each(function (index) {
			if (this.id == "content-" + eventId) {
				// set the link as active
				$('.ready-tabs #tab-' + eventId).parent('li').addClass('active');
				// expose active content
				$(this).show();
			}
			else {
				//unset active class from non-event links
				$('.ready-tabs #tab-' + index).parent('li').removeClass('active');
				//hide unactive content
				$(this).hide();
			}
		});
	}
	
	/**
	 * Toggle the visibility of the accordion content
	 */
	function wysiwyg_tools_plus_theme_toggleAccordionContent(eventId) {
		eventId = eventId.substring(eventId.lastIndexOf('-')+1, eventId.length);
		$('#acc-' + eventId).toggle('fast');
	}
	
}(jQuery));
;/**/
(function() {
  //////////////////////////////
  // Global Closure Variables
  //
  // Actual definitions set at window.onload to ensure the settings have loaded in before trying to use them.
  //////////////////////////////
  var settings = '';
  var settingsArray = '';
  var settingArrayLength = '';

  var lazyload = '';

  var aspectRatio = '';

  var sizeArray = '';
  var arraySize = '';

  var styleArray = '';


  //////////////////////////////
  // Add indexOf Polyfill
  //
  // indexOf is new to ECMA-262 standard and as such, if it doesn't exist, we need to polyfill for it.
  // Polyfill from https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/indexOf#Compatibility
  //////////////////////////////
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
      "use strict";
      if (this == null) {
        throw new TypeError();
      }
      var t = Object(this);
      var len = t.length >>> 0;
      if (len === 0) {
        return -1;
      }
      var n = 0;
      if (arguments.length > 1) {
        n = Number(arguments[1]);
        if (n != n) { // shortcut for verifying if it's NaN
            n = 0;
        } else if (n != 0 && n != Infinity && n != -Infinity) {
            n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }
      }
      if (n >= len) {
        return -1;
      }
      var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
      for (; k < len; k++) {
        if (k in t && t[k] === searchElement) {
            return k;
        }
      }
      return -1;
    }
  }


  //////////////////////////////
  // Add getComputedStyle Polyfill
  //
  // indexOf is new to ECMA-262 standard and as such, if it doesn't exist, we need to polyfill for it.
  // Polyfill from http://snipplr.com/view/13523/
  //////////////////////////////
  if (!window.getComputedStyle) {
    window.getComputedStyle = function(el, pseudo) {
      this.el = el;
      this.getPropertyValue = function(prop) {
        var re = /(\-([a-z]){1})/g;
        if (prop == 'float') prop = 'styleFloat';
        if (re.test(prop)) {
          prop = prop.replace(re, function () {
            return arguments[2].toUpperCase();
          });
        }
        return el.currentStyle[prop] ? el.currentStyle[prop] : null;
      }
      return this;
    }
  }

  //////////////////////////////
  // On Load, rock it out!
  //////////////////////////////
  window.onload = function() {
    settings = Drupal.settings.borealis_ri.sizes;
    settingsArray = sortObject(settings);
    settingArrayLength = settingsArray.length;

    lazyload = Drupal.settings.borealis_ri.lazyload;

    aspectRatio = Drupal.settings.borealis_ri.aspect_ratio;


    styleArray = Drupal.settings.borealis_ri.styleArray;

    var sizeArraySort = new Array();
    var styleArraySort = new Array();
    for (i = 0; i < settingArrayLength; i++) {
      sizeArraySort.push(settingsArray[i].value);
      styleArraySort.push(settingsArray[i].key);
    }

    sizeArray = sizeArraySort;
    styleArray = styleArraySort;

    arraySize = sizeArray.length;

    if (lazyload) {
      borealisImagePlaceholder();
    }
    else {
      borealisImageRespond();
    }


    // When the screen is resized, check again!
    window.onresize = debounce(function(){

      if (lazyload) {
        borealisImagePlaceholder();
      }
      else {
        borealisImageRespond();
      }
    }, 20);

    // When the screen is scrolled, do it again!
    window.onscroll = window.onresize;
  };


  //////////////////////////////
  // Borealis Image Placeholder
  //
  // Loop over each image, add height and width to get general idea of whether or not an image is in the viewport
  //////////////////////////////
  function borealisImagePlaceholder() {
    var images = document.querySelectorAll('img.borealis');
    var imageLength = images.length;

    for (var i = 0; i < imageLength; i++) {
      var image = images[i];
      var width = blockParentWidth(image);
      var height = width * aspectRatio;

      var imgStyle = image.getAttribute('data-borealis-style') ? true : false


      if (!imgStyle) {
        image.setAttribute('width', width);
        image.setAttribute('height', height);
      }

      if (elementInViewport(image)) {
        borealisFindImage(image);
      }
      
      if (!imgStyle) {
        image.removeAttribute('width');
        image.removeAttribute('height');
      }
      
    }
  }

  //////////////////////////////
  // Borealis Image Resize
  //
  // Resizes image's height/width
  //////////////////////////////

  function borealisImageResize() {
    var images = document.querySelectorAll('img.borealis');
    var imageLength = images.length;

    for (var i = 0; i < imageLength; i++) {
      var image = images[i];
      var imgStyle = image.getAttribute('data-borealis-style') ? true : false

      if (!imgStyle) {
        image.setAttribute('width', image.width);
        image.setAttribute('height', image.height);
      }
    }
  }

  //////////////////////////////
  // Borealis Image Respond
  //
  // Loop over each image, and change their source depending on parent width
  //////////////////////////////
  function borealisImageRespond() {
    var images = document.querySelectorAll('img.borealis');
    var imageLength = images.length;

    for (var i = 0; i < imageLength; i++) {
      var image = images[i];
      borealisFindImage(image);
    } // End Image Loop
  }

  //////////////////////////////
  // Borealis Find Image
  //
  // Reusable chunk of code to find and swap in an image
  //////////////////////////////
  function borealisFindImage(image) {
    var width = blockParentWidth(image);

    if (width > 0) {
      var slfor = arraySize - 1;
      swapped = false;

      if (width <= sizeArray[0]) {
        borealisImageSwap(image, -1, width);
      }
      else if (width >= sizeArray[slfor + 1]) {
        borealisImageSwap(image, slfor, width, true);
      }
      else {
        for (j = slfor; j >= 0; j--) {
          if (width >= sizeArray[j]) {
            borealisImageSwap(image, j, width);
            j = -1;
          }
        }
      } // End Size Loop
    } //End Width > 0 Check
  }

  //////////////////////////////
  // Borealis Image Swap
  //
  // Sets the appropriate image style based off of Device Pixel Ratio
  //////////////////////////////
  function borealisImageSwap(img, index, width, bypass) {
    // Increase index by one to get the next highest size
    index++;

    if (img.getAttribute('data-locked')) {
      return;
    }

    img.setAttribute('data-locked', 1);

    // Set Bypass
    bypass = (typeof bypass === "undefined") ? false : bypass;

    // Get current image style
    var imgStyle = img.getAttribute('data-borealis-style') ? img.getAttribute('data-borealis-style') : styleArray[0];

    // Get Device Pixel Ratio
    var dpr = (window.devicePixelRatio !== undefined) ? window.devicePixelRatio : 1;

    // Create Style variable
    var style = '';

    // Bypass for the index size passed regardless of DPR
    if (bypass) {
      dpr = 1;
    }

    // If we've got a HighDPI device,
    if (dpr > 1.5 && dpr <= 2.5) {
      style = styleArray[index + 1];
    }
    else {
      style = styleArray[index];
    }

    // Only swap the image if the required image is larger
    if (styleArray.indexOf(style) > styleArray.indexOf(imgStyle)) {
      var src = img.getAttribute('data-borealis-' + style);

      var loadImg = new Image();

      loadImg.onload = function() {
        loadImg.onload = null;

        var imgAttributes = img.attributes;
        var imgAttributeLength = imgAttributes.length;

        for (var i = 0; i < imgAttributeLength; i++) {
          if (imgAttributes[i].name != 'height' && imgAttributes[i].name != 'width' && imgAttributes[i].name != 'src' && imgAttributes[i].name != 'data-borealis-style' && imgAttributes[i].name != 'data-locked') {
            loadImg.setAttribute(imgAttributes[i].name, imgAttributes[i].value);
          }
        }

        // Set the current style
        loadImg.setAttribute('data-borealis-style', style);

        // Remove the Placeholder class
        removeClass(loadImg, 'placeholder');

        // Add image to the DOM
        img.parentNode.replaceChild(loadImg, img);

        // Remove the Loading class, add the Loaded class
        removeClass(loadImg.parentNode, 'loading');
        addClass(loadImg.parentNode, 'loaded');

        // Run the whole thing over again
        borealisImagePlaceholder();
      }
      loadImg.src = src;
    }
    else {
      img.removeAttribute('data-locked')
    }
  }

  //////////////////////////////
  // Returns the width of the nearest non-inline parent.
  //////////////////////////////
  function blockParentWidth(element) {
    var parentNode = element.parentNode;
    var parentDisplay = getComputedStyle(parentNode).display;
    
    // The getComputedStyle polyfill is not working for IE8, causing
    // parentDisplay to be undefined.
    // https://drupal.org/node/2011016
    // In this case, simply return the smaller of window width or 1000px.
    if  (typeof(parentDisplay) == 'undefined' || parentDisplay == null) {
      return Math.min(document.documentElement.clientWidth,1000);
    }
    
    if (parentDisplay.indexOf('inline') >= 0 && parentDisplay.indexOf('block') < 0) {
      return blockParentWidth(parentNode);
    }
    else {
      return parseInt(getComputedStyle(parentNode).width);
    }
  }

  //////////////////////////////
  // Sorts an object into an array by value. http://stackoverflow.com/questions/1069666/sorting-javascript-object-by-property-value
  //////////////////////////////
  function sortObject(obj) {
    var arr = new Array();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        arr.push({
          'key': attr,
          'value': obj[attr]
        });
      }
    }
    arr.sort(function(a, b) { return a['value'] - b['value'] });
    return arr; // returns array
  }

  //////////////////////////////
  // Checks to see if element is in viewport
  //
  // From http://css-tricks.com/snippets/javascript/lazy-loading-images/
  //////////////////////////////
  function elementInViewport(el) {
    var rect = el.getBoundingClientRect()

    return (
   rect.left   >= 0
    && rect.top <= (window.innerHeight || document.documentElement.clientHeight)
    )
  }

  //////////////////////////////
  // Debounce
  // Returns a function, that, as long as it continues to be invoked, will not be triggered. The function will be called after it stops being called for N milliseconds. If `immediate` is passed, trigger the function on the leading edge, instead of the trailing.
  //////////////////////////////
  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      }
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    }
  }

  //////////////////////////////
  // Has Class
  //
  // From http://www.avoid.org/?p=78
  //////////////////////////////
  function hasClass(el, name) {
   return new RegExp('(\\s|^)'+name+'(\\s|$)').test(el.className);
  }

  //////////////////////////////
  // Remove Class
  //
  // From http://stackoverflow.com/questions/2155737/remove-css-class-from-element-with-javascript-no-jquery
  //////////////////////////////
  function removeClass(ele,cls) {
    if (hasClass(ele,cls)) {
      var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
      ele.className=ele.className.replace(reg,' ');
    }
  }

  //////////////////////////////
  // Add Class
  //
  // From http://www.avoid.org/?p=78
  //////////////////////////////
  function addClass(el, name) {
   if (!hasClass(el, name)) { el.className += (el.className ? ' ' : '') +name; }
  }
  
  Drupal.BorealisRefresh = function() {
    borealisImageRespond();
  };
  
})();

;/**/
/*
 Highcharts JS v2.1.4 (2011-03-02)

 (c) 2009-2010 Torstein H?nsi

 License: www.highcharts.com/license
*/
(function(){function qa(a,b){a||(a={});for(var c in b)a[c]=b[c];return a}function oa(a,b){return parseInt(a,b||10)}function Kb(a){return typeof a=="string"}function Eb(a){return typeof a=="object"}function ac(a){return typeof a=="number"}function mc(a,b){for(var c=a.length;c--;)if(a[c]==b){a.splice(c,1);break}}function J(a){return a!==Ra&&a!==null}function za(a,b,c){var d,e;if(Kb(b))if(J(c))a.setAttribute(b,c);else{if(a&&a.getAttribute)e=a.getAttribute(b)}else if(J(b)&&Eb(b))for(d in b)a.setAttribute(d,
b[d]);return e}function nc(a){if(!a||a.constructor!=Array)a=[a];return a}function y(){var a=arguments,b,c,d=a.length;for(b=0;b<d;b++){c=a[b];if(typeof c!=="undefined"&&c!==null)return c}}function Wd(a){var b="",c;for(c in a)b+=Ad(c)+":"+a[c]+";";return b}function Ia(a,b){if(Ac)if(b&&b.opacity!==Ra)b.filter="alpha(opacity="+b.opacity*100+")";qa(a.style,b)}function fb(a,b,c,d,e){a=Aa.createElement(a);b&&qa(a,b);e&&Ia(a,{padding:0,border:nb,margin:0});c&&Ia(a,c);d&&d.appendChild(a);return a}function bc(a,
b){Bc=y(a,b.animation)}function Bd(){var a=Sa.global.useUTC;Cc=a?Date.UTC:function(b,c,d,e,f,g){return(new Date(b,c,y(d,1),y(e,0),y(f,0),y(g,0))).getTime()};bd=a?"getUTCMinutes":"getMinutes";cd=a?"getUTCHours":"getHours";dd=a?"getUTCDay":"getDay";oc=a?"getUTCDate":"getDate";Dc=a?"getUTCMonth":"getMonth";Ec=a?"getUTCFullYear":"getFullYear";Cd=a?"setUTCMinutes":"setMinutes";Dd=a?"setUTCHours":"setHours";ed=a?"setUTCDate":"setDate";Ed=a?"setUTCMonth":"setMonth";Fd=a?"setUTCFullYear":"setFullYear"}function Fc(a){Gc||
(Gc=fb(Lb));a&&Gc.appendChild(a);Gc.innerHTML=""}function xb(a,b){var c=function(){};c.prototype=new a;qa(c.prototype,b);return c}function Gd(a,b,c,d){var e=Sa.lang;a=a;var f=isNaN(b=cb(b))?2:b;b=c===undefined?e.decimalPoint:c;d=d===undefined?e.thousandsSep:d;e=a<0?"-":"";c=oa(a=cb(+a||0).toFixed(f))+"";var g=(g=c.length)>3?g%3:0;return e+(g?c.substr(0,g)+d:"")+c.substr(g).replace(/(\d{3})(?=\d)/g,"$1"+d)+(f?b+cb(a-c).toFixed(f).slice(2):"")}function Hc(){}function Hd(a,b){function c(m,h){function x(l,
p){this.pos=l;this.minor=p;this.isNew=true;p||this.addLabel()}function w(l){if(l){this.options=l;this.id=l.id}return this}function O(){var l=[],p=[],r;Ta=u=null;Z=[];t(Ba,function(o){r=false;t(["xAxis","yAxis"],function(la){if(o.isCartesian&&(la=="xAxis"&&ma||la=="yAxis"&&!ma)&&(o.options[la]==h.index||o.options[la]===Ra&&h.index===0)){o[la]=s;Z.push(o);r=true}});if(!o.visible&&v.ignoreHiddenSeries)r=false;if(r){var T,Y,G,B,ia;if(!ma){T=o.options.stacking;Ic=T=="percent";if(T){B=o.type+y(o.options.stack,
"");ia="-"+B;o.stackKey=B;Y=l[B]||[];l[B]=Y;G=p[ia]||[];p[ia]=G}if(Ic){Ta=0;u=99}}if(o.isCartesian){t(o.data,function(la){var C=la.x,na=la.y,S=na<0,$=S?G:Y;S=S?ia:B;if(Ta===null)Ta=u=la[H];if(ma)if(C>u)u=C;else{if(C<Ta)Ta=C}else if(J(na)){if(T)$[C]=J($[C])?$[C]+na:na;na=$?$[C]:na;la=y(la.low,na);if(!Ic)if(na>u)u=na;else if(la<Ta)Ta=la;if(T){ea[S]||(ea[S]={});ea[S][C]={total:na,cum:na}}}});if(/(area|column|bar)/.test(o.type)&&!ma)if(Ta>=0){Ta=0;Id=true}else if(u<0){u=0;Jd=true}}}})}function ja(l,p){var r;
Fb=p?1:Ua.pow(10,ob(Ua.log(l)/Ua.LN10));r=l/Fb;if(!p){p=[1,2,2.5,5,10];if(h.allowDecimals===false)if(Fb==1)p=[1,2,5,10];else if(Fb<=0.1)p=[1/Fb]}for(var o=0;o<p.length;o++){l=p[o];if(r<=(p[o]+(p[o+1]||p[o]))/2)break}l*=Fb;return l}function L(l){var p;p=l;if(J(Fb)){p=(Fb<1?fa(1/Fb):1)*10;p=fa(l*p)/p}return p}function ga(){var l,p,r,o,T=h.tickInterval,Y=h.tickPixelInterval;l=h.maxZoom||(ma?pb(m.smallestInterval*5,u-Ta):null);A=M?wa:sa;if(Mb){r=m[ma?"xAxis":"yAxis"][h.linkedTo];o=r.getExtremes();K=y(o.min,
o.dataMin);P=y(o.max,o.dataMax)}else{K=y(pa,h.min,Ta);P=y(Na,h.max,u)}if(P-K<l){o=(l-P+K)/2;K=Ca(K-o,y(h.min,K-o),Ta);P=pb(K+l,y(h.max,K+l),u)}if(!Va&&!Ic&&!Mb&&J(K)&&J(P)){l=P-K||1;if(!J(h.min)&&!J(pa)&&Vb&&(Ta<0||!Id))K-=l*Vb;if(!J(h.max)&&!J(Na)&&Kd&&(u>0||!Jd))P+=l*Kd}Wa=K==P?1:Mb&&!T&&Y==r.options.tickPixelInterval?r.tickInterval:y(T,Va?1:(P-K)*Y/A);if(!N&&!J(h.tickInterval))Wa=ja(Wa);s.tickInterval=Wa;Jc=h.minorTickInterval==="auto"&&Wa?Wa/5:h.minorTickInterval;if(N){ra=[];T=Sa.global.useUTC;
var G=1E3/qb,B=6E4/qb,ia=36E5/qb;Y=864E5/qb;l=6048E5/qb;o=2592E6/qb;var la=31556952E3/qb,C=[["second",G,[1,2,5,10,15,30]],["minute",B,[1,2,5,10,15,30]],["hour",ia,[1,2,3,4,6,8,12]],["day",Y,[1,2]],["week",l,[1,2]],["month",o,[1,2,3,4,6]],["year",la,null]],na=C[6],S=na[1],$=na[2];for(r=0;r<C.length;r++){na=C[r];S=na[1];$=na[2];if(C[r+1])if(Wa<=(S*$[$.length-1]+C[r+1][1])/2)break}if(S==la&&Wa<5*S)$=[1,2,5];C=ja(Wa/S,$);$=new Date(K*qb);$.setMilliseconds(0);if(S>=G)$.setSeconds(S>=B?0:C*ob($.getSeconds()/
C));if(S>=B)$[Cd](S>=ia?0:C*ob($[bd]()/C));if(S>=ia)$[Dd](S>=Y?0:C*ob($[cd]()/C));if(S>=Y)$[ed](S>=o?1:C*ob($[oc]()/C));if(S>=o){$[Ed](S>=la?0:C*ob($[Dc]()/C));p=$[Ec]()}if(S>=la){p-=p%C;$[Fd](p)}S==l&&$[ed]($[oc]()-$[dd]()+h.startOfWeek);r=1;p=$[Ec]();G=$.getTime()/qb;B=$[Dc]();for(ia=$[oc]();G<P&&r<wa;){ra.push(G);if(S==la)G=Cc(p+r*C,0)/qb;else if(S==o)G=Cc(p,B+r*C)/qb;else if(!T&&(S==Y||S==l))G=Cc(p,B,ia+r*C*(S==Y?1:7));else G+=S*C;r++}ra.push(G);Kc=h.dateTimeLabelFormats[na[0]]}else{r=ob(K/Wa)*
Wa;p=fd(P/Wa)*Wa;ra=[];for(r=L(r);r<=p;){ra.push(r);r=L(r+Wa)}}if(!Mb){if(Va||ma&&m.hasColumn){p=(Va?1:Wa)*0.5;if(Va||!J(y(h.min,pa)))K-=p;if(Va||!J(y(h.max,Na)))P+=p}p=ra[0];r=ra[ra.length-1];if(h.startOnTick)K=p;else K>p&&ra.shift();if(h.endOnTick)P=r;else P<r&&ra.pop();Gb||(Gb={x:0,y:0});if(!N&&ra.length>Gb[H])Gb[H]=ra.length}}function Ea(){var l,p;gb=K;cc=P;O();ga();ha=D;D=A/(P-K||1);if(!ma)for(l in ea)for(p in ea[l])ea[l][p].cum=ea[l][p].total;if(!s.isDirty)s.isDirty=K!=gb||P!=cc}function ua(l){l=
(new w(l)).render();Nb.push(l);return l}function bb(){var l=h.title,p=h.alternateGridColor,r=h.lineWidth,o,T,Y=m.hasRendered,G=Y&&J(gb)&&!isNaN(gb);o=Z.length&&J(K)&&J(P);A=M?wa:sa;D=A/(P-K||1);xa=M?V:rb;if(o||Mb){if(Jc&&!Va)for(o=K+(ra[0]-K)%Jc;o<=P;o+=Jc){Wb[o]||(Wb[o]=new x(o,true));G&&Wb[o].isNew&&Wb[o].render(null,true);Wb[o].isActive=true;Wb[o].render()}t(ra,function(B,ia){if(!Mb||B>=K&&B<=P){G&&sb[B].isNew&&sb[B].render(ia,true);sb[B].isActive=true;sb[B].render(ia)}});p&&t(ra,function(B,ia){if(ia%
2===0&&B<P){dc[B]||(dc[B]=new w);dc[B].options={from:B,to:ra[ia+1]!==Ra?ra[ia+1]:P,color:p};dc[B].render();dc[B].isActive=true}});Y||t((h.plotLines||[]).concat(h.plotBands||[]),function(B){Nb.push((new w(B)).render())})}t([sb,Wb,dc],function(B){for(var ia in B)if(B[ia].isActive)B[ia].isActive=false;else{B[ia].destroy();delete B[ia]}});if(r){o=V+(Oa?wa:0)+Q;T=Pa-rb-(Oa?sa:0)+Q;o=aa.crispLine([Za,M?V:o,M?T:ba,Da,M?Xa-Ab:o,M?T:Pa-rb],r);if(Fa)Fa.animate({d:o});else Fa=aa.path(o).attr({stroke:h.lineColor,
"stroke-width":r,zIndex:7}).add()}if(s.axisTitle){o=M?V:ba;r=oa(l.style.fontSize||12);o={low:o+(M?0:A),middle:o+A/2,high:o+(M?A:0)}[l.align];r=(M?ba+sa:V)+(M?1:-1)*(Oa?-1:1)*gd+(E==2?r:0);s.axisTitle[Y?"animate":"attr"]({x:M?o:r+(Oa?wa:0)+Q+(l.x||0),y:M?r-(Oa?sa:0)+Q:o+(l.y||0)})}s.isDirty=false}function Ja(l){for(var p=Nb.length;p--;)Nb[p].id==l&&Nb[p].destroy()}var ma=h.isX,Oa=h.opposite,M=Ga?!ma:ma,E=M?Oa?0:2:Oa?1:3,ea={};h=ya(ma?Lc:hd,[Xd,Yd,Ld,Zd][E],h);var s=this,N=h.type=="datetime",Q=h.offset||
0,H=ma?"x":"y",A,D,ha,xa=M?V:rb,va,Ka,tb,Hb,Fa,Ta,u,Z,pa,Na,P=null,K=null,gb,cc,Vb=h.minPadding,Kd=h.maxPadding,Mb=J(h.linkedTo),Id,Jd,Ic,Md=h.events,id,Nb=[],Wa,Jc,Fb,ra,sb={},Wb={},dc={},ec,fc,gd,Kc,Va=h.categories,$d=h.labels.formatter||function(){var l=this.value;return Kc?Mc(Kc,l):Wa%1E6===0?l/1E6+"M":Wa%1E3===0?l/1E3+"k":!Va&&l>=1E3?Gd(l,0):l},Nc=M&&h.labels.staggerLines,Xb=h.reversed,Yb=Va&&h.tickmarkPlacement=="between"?0.5:0;x.prototype={addLabel:function(){var l=this.pos,p=h.labels,r=!(l==
K&&!y(h.showFirstLabel,1)||l==P&&!y(h.showLastLabel,0)),o=Va&&M&&Va.length&&!p.step&&!p.staggerLines&&!p.rotation&&wa/Va.length||!M&&wa/2,T=this.label;l=$d.call({isFirst:l==ra[0],isLast:l==ra[ra.length-1],dateTimeLabelFormat:Kc,value:Va&&Va[l]?Va[l]:l});o=o&&{width:o-2*(p.padding||10)+$a};o=qa(o,p.style);if(T===Ra)this.label=J(l)&&r&&p.enabled?aa.text(l,0,0).attr({align:p.align,rotation:p.rotation}).css(o).add(tb):null;else T&&T.attr({text:l}).css(o)},getLabelSize:function(){var l=this.label;return l?
(this.labelBBox=l.getBBox())[M?"height":"width"]:0},render:function(l,p){var r=!this.minor,o=this.label,T=this.pos,Y=h.labels,G=this.gridLine,B=r?h.gridLineWidth:h.minorGridLineWidth,ia=r?h.gridLineColor:h.minorGridLineColor,la=r?h.gridLineDashStyle:h.minorGridLineDashStyle,C=this.mark,na=r?h.tickLength:h.minorTickLength,S=r?h.tickWidth:h.minorTickWidth||0,$=r?h.tickColor:h.minorTickColor,pc=r?h.tickPosition:h.minorTickPosition;r=Y.step;var hb=p&&Oc||Pa,Ob;Ob=M?va(T+Yb,null,null,p)+xa:V+Q+(Oa?(p&&
jd||Xa)-Ab-V:0);hb=M?hb-rb+Q-(Oa?sa:0):hb-va(T+Yb,null,null,p)-xa;if(B){T=Ka(T+Yb,B,p);if(G===Ra){G={stroke:ia,"stroke-width":B};if(la)G.dashstyle=la;this.gridLine=G=B?aa.path(T).attr(G).add(Hb):null}G&&T&&G.animate({d:T})}if(S){if(pc=="inside")na=-na;if(Oa)na=-na;B=aa.crispLine([Za,Ob,hb,Da,Ob+(M?0:-na),hb+(M?na:0)],S);if(C)C.animate({d:B});else this.mark=aa.path(B).attr({stroke:$,"stroke-width":S}).add(tb)}if(o){Ob=Ob+Y.x-(Yb&&M?Yb*D*(Xb?-1:1):0);hb=hb+Y.y-(Yb&&!M?Yb*D*(Xb?1:-1):0);J(Y.y)||(hb+=
parseInt(o.styles.lineHeight)*0.9-o.getBBox().height/2);if(Nc)hb+=l%Nc*16;if(r)o[l%r?"hide":"show"]();o[this.isNew?"attr":"animate"]({x:Ob,y:hb})}this.isNew=false},destroy:function(){for(var l in this)this[l]&&this[l].destroy&&this[l].destroy()}};w.prototype={render:function(){var l=this,p=l.options,r=p.label,o=l.label,T=p.width,Y=p.to,G,B=p.from,ia=p.dashStyle,la=l.svgElem,C=[],na,S,$=p.color;S=p.zIndex;var pc=p.events;if(T){C=Ka(p.value,T);p={stroke:$,"stroke-width":T};if(ia)p.dashstyle=ia}else if(J(B)&&
J(Y)){B=Ca(B,K);Y=pb(Y,P);G=Ka(Y);if((C=Ka(B))&&G)C.push(G[4],G[5],G[1],G[2]);else C=null;p={fill:$}}else return;if(J(S))p.zIndex=S;if(la)if(C)la.animate({d:C},null,la.onGetPath);else{la.hide();la.onGetPath=function(){la.show()}}else if(C&&C.length){l.svgElem=la=aa.path(C).attr(p).add();if(pc){ia=function(hb){la.on(hb,function(Ob){pc[hb].apply(l,[Ob])})};for(na in pc)ia(na)}}if(r&&J(r.text)&&C&&C.length&&wa>0&&sa>0){r=ya({align:M&&G&&"center",x:M?!G&&4:10,verticalAlign:!M&&G&&"middle",y:M?G?16:10:
G?6:-4,rotation:M&&!G&&90},r);if(!o)l.label=o=aa.text(r.text,0,0).attr({align:r.textAlign||r.align,rotation:r.rotation,zIndex:S}).css(r.style).add();G=[C[1],C[4],C[6]||C[1]];C=[C[2],C[5],C[7]||C[2]];na=pb.apply(Ua,G);S=pb.apply(Ua,C);o.align(r,false,{x:na,y:S,width:Ca.apply(Ua,G)-na,height:Ca.apply(Ua,C)-S});o.show()}else o&&o.hide();return l},destroy:function(){for(var l in this){this[l]&&this[l].destroy&&this[l].destroy();delete this[l]}mc(Nb,this)}};va=function(l,p,r,o){var T=1,Y=0,G=o?ha:D;o=
o?gb:K;G||(G=D);if(r){T*=-1;Y=A}if(Xb){T*=-1;Y-=T*A}if(p){if(Xb)l=A-l;l=l/G+o}else l=T*(l-o)*G+Y;return l};Ka=function(l,p,r){var o,T,Y;l=va(l,null,null,r);var G=r&&Oc||Pa,B=r&&jd||Xa,ia;r=T=fa(l+xa);o=Y=fa(G-l-xa);if(isNaN(l))ia=true;else if(M){o=ba;Y=G-rb;if(r<V||r>V+wa)ia=true}else{r=V;T=B-Ab;if(o<ba||o>ba+sa)ia=true}return ia?null:aa.crispLine([Za,r,o,Da,T,Y],p||0)};if(Ga&&ma&&Xb===Ra)Xb=true;qa(s,{addPlotBand:ua,addPlotLine:ua,adjustTickAmount:function(){if(Gb&&!N&&!Va&&!Mb){var l=ec,p=ra.length;
ec=Gb[H];if(p<ec){for(;ra.length<ec;)ra.push(L(ra[ra.length-1]+Wa));D*=(p-1)/(ec-1);P=ra[ra.length-1]}if(J(l)&&ec!=l)s.isDirty=true}},categories:Va,getExtremes:function(){return{min:K,max:P,dataMin:Ta,dataMax:u}},getPlotLinePath:Ka,getThreshold:function(l){if(K>l)l=K;else if(P<l)l=P;return va(l,0,1)},isXAxis:ma,options:h,plotLinesAndBands:Nb,getOffset:function(){var l=Z.length&&J(K)&&J(P),p=0,r=0,o=h.title,T=h.labels,Y=[-1,1,1,-1][E];if(!tb){tb=aa.g("axis").attr({zIndex:7}).add();Hb=aa.g("grid").attr({zIndex:1}).add()}fc=
0;if(l||Mb){t(ra,function(B){if(sb[B])sb[B].addLabel();else sb[B]=new x(B);if(E===0||E==2||{1:"left",3:"right"}[E]==T.align)fc=Ca(sb[B].getLabelSize(),fc)});if(Nc)fc+=(Nc-1)*16}else for(var G in sb){sb[G].destroy();delete sb[G]}if(o&&o.text){if(!s.axisTitle)s.axisTitle=aa.text(o.text,0,0).attr({zIndex:7,rotation:o.rotation||0,align:o.textAlign||{low:"left",middle:"center",high:"right"}[o.align]}).css(o.style).add();p=s.axisTitle.getBBox()[M?"height":"width"];r=y(o.margin,M?5:10)}Q=Y*(h.offset||Pb[E]);
gd=fc+(E!=2&&fc&&Y*h.labels[M?"y":"x"])+r;Pb[E]=Ca(Pb[E],gd+p+Y*Q)},render:bb,setCategories:function(l,p){s.categories=Va=l;t(Z,function(r){r.translate();r.setTooltipPoints(true)});s.isDirty=true;y(p,true)&&m.redraw()},setExtremes:function(l,p,r,o){r=y(r,true);La(s,"setExtremes",{min:l,max:p},function(){pa=l;Na=p;r&&m.redraw(o)})},setScale:Ea,setTickPositions:ga,translate:va,redraw:function(){gc.resetTracker&&gc.resetTracker();bb();t(Nb,function(l){l.render()});t(Z,function(l){l.isDirty=true})},removePlotBand:Ja,
removePlotLine:Ja,reversed:Xb,stacks:ea});for(id in Md)Qa(s,id,Md[id]);Ea()}function d(){var m={};return{add:function(h,x,w,O){if(!m[h]){x=aa.text(x,0,0).css(a.toolbar.itemStyle).align({align:"right",x:-Ab-20,y:ba+30}).on("click",O).attr({align:"right",zIndex:20}).add();m[h]=x}},remove:function(h){Fc(m[h].element);m[h]=null}}}function e(m){function h(){var H=this.points||nc(this),A=H[0].series.xAxis,D=this.x;A=A&&A.options.type=="datetime";var ha=Kb(D)||A,xa;xa=ha?['<span style="font-size: 10px">',
A?Mc("%A, %b %e, %Y",D):D,"</span><br/>"]:[];t(H,function(va){xa.push(va.point.tooltipFormatter(ha))});return xa.join("")}function x(H,A){E=ma?H:(2*E+H)/3;ea=ma?A:(ea+A)/2;s.translate(E,ea);kd=cb(H-E)>1||cb(A-ea)>1?function(){x(H,A)}:null}function w(){if(!ma){var H=q.hoverPoints;s.hide();t(ga,function(A){A&&A.hide()});H&&t(H,function(A){A.setState()});q.hoverPoints=null;ma=true}}var O,ja=m.borderWidth,L=m.crosshairs,ga=[],Ea=m.style,ua=m.shared,bb=oa(Ea.padding),Ja=ja+bb,ma=true,Oa,M,E=0,ea=0;Ea.padding=
0;var s=aa.g("tooltip").attr({zIndex:8}).add(),N=aa.rect(Ja,Ja,0,0,m.borderRadius,ja).attr({fill:m.backgroundColor,"stroke-width":ja}).add(s).shadow(m.shadow),Q=aa.text("",bb+Ja,oa(Ea.fontSize)+bb+Ja).attr({zIndex:1}).css(Ea).add(s);s.hide();return{shared:ua,refresh:function(H){var A,D,ha,xa=0,va={},Ka=[];ha=H.tooltipPos;A=m.formatter||h;va=q.hoverPoints;var tb=function(Fa){return{series:Fa.series,point:Fa,x:Fa.category,y:Fa.y,percentage:Fa.percentage,total:Fa.total||Fa.stackTotal}};if(ua){va&&t(va,
function(Fa){Fa.setState()});q.hoverPoints=H;t(H,function(Fa){Fa.setState(yb);xa+=Fa.plotY;Ka.push(tb(Fa))});D=H[0].plotX;xa=fa(xa)/H.length;va={x:H[0].category};va.points=Ka;H=H[0]}else va=tb(H);va=A.call(va);O=H.series;D=ua?D:H.plotX;xa=ua?xa:H.plotY;A=fa(ha?ha[0]:Ga?wa-xa:D);D=fa(ha?ha[1]:Ga?sa-D:xa);ha=ua||!H.series.isCartesian||hc(A,D);if(va===false||!ha)w();else{if(ma){s.show();ma=false}Q.attr({text:va});ha=Q.getBBox();Oa=ha.width+2*bb;M=ha.height+2*bb;N.attr({width:Oa,height:M,stroke:m.borderColor||
H.color||O.color||"#606060"});A=A-Oa+V-25;D=D-M+ba+10;if(A<7){A=7;D-=30}if(D<5)D=5;else if(D+M>Pa)D=Pa-M-5;x(fa(A-Ja),fa(D-Ja))}if(L){L=nc(L);D=L.length;for(var Hb;D--;)if(L[D]&&(Hb=H.series[D?"yAxis":"xAxis"])){A=Hb.getPlotLinePath(H[D?"y":"x"],1);if(ga[D])ga[D].attr({d:A,visibility:Bb});else{ha={"stroke-width":L[D].width||1,stroke:L[D].color||"#C0C0C0",zIndex:2};if(L[D].dashStyle)ha.dashstyle=L[D].dashStyle;ga[D]=aa.path(A).attr(ha).add()}}}},hide:w}}function f(m,h){function x(E){var ea;E=E||ib.event;
if(!E.target)E.target=E.srcElement;ea=E.touches?E.touches.item(0):E;if(E.type!="mousemove"||ib.opera){for(var s=ta,N={left:s.offsetLeft,top:s.offsetTop};s=s.offsetParent;){N.left+=s.offsetLeft;N.top+=s.offsetTop;if(s!=Aa.body&&s!=Aa.documentElement){N.left-=s.scrollLeft;N.top-=s.scrollTop}}qc=N}if(Ac){E.chartX=E.x;E.chartY=E.y}else if(ea.layerX===Ra){E.chartX=ea.pageX-qc.left;E.chartY=ea.pageY-qc.top}else{E.chartX=E.layerX;E.chartY=E.layerY}return E}function w(E){var ea={xAxis:[],yAxis:[]};t(ab,function(s){var N=
s.translate,Q=s.isXAxis;ea[Q?"xAxis":"yAxis"].push({axis:s,value:N((Ga?!Q:Q)?E.chartX-V:sa-E.chartY+ba,true)})});return ea}function O(){var E=m.hoverSeries,ea=m.hoverPoint;ea&&ea.onMouseOut();E&&E.onMouseOut();rc&&rc.hide();ld=null}function ja(){if(ua){var E={xAxis:[],yAxis:[]},ea=ua.getBBox(),s=ea.x-V,N=ea.y-ba;if(Ea){t(ab,function(Q){var H=Q.translate,A=Q.isXAxis,D=Ga?!A:A,ha=H(D?s:sa-N-ea.height,true);H=H(D?s+ea.width:sa-N,true);E[A?"xAxis":"yAxis"].push({axis:Q,min:pb(ha,H),max:Ca(ha,H)})});La(m,
"selection",E,md)}ua=ua.destroy()}m.mouseIsDown=nd=Ea=false;Cb(Aa,Ib?"touchend":"mouseup",ja)}var L,ga,Ea,ua,bb=v.zoomType,Ja=/x/.test(bb),ma=/y/.test(bb),Oa=Ja&&!Ga||ma&&Ga,M=ma&&!Ga||Ja&&Ga;Pc=function(){if(Qc){Qc.translate(V,ba);Ga&&Qc.attr({width:m.plotWidth,height:m.plotHeight}).invert()}else m.trackerGroup=Qc=aa.g("tracker").attr({zIndex:9}).add()};Pc();if(h.enabled)m.tooltip=rc=e(h);(function(){var E=true;ta.onmousedown=function(s){s=x(s);m.mouseIsDown=nd=true;L=s.chartX;ga=s.chartY;Qa(Aa,
Ib?"touchend":"mouseup",ja)};var ea=function(s){if(!(s&&s.touches&&s.touches.length>1)){s=x(s);if(!Ib)s.returnValue=false;var N=s.chartX,Q=s.chartY,H=!hc(N-V,Q-ba);if(Ib&&s.type=="touchstart")if(za(s.target,"isTracker"))m.runTrackerClick||s.preventDefault();else!ae&&!H&&s.preventDefault();if(H){E||O();if(N<V)N=V;else if(N>V+wa)N=V+wa;if(Q<ba)Q=ba;else if(Q>ba+sa)Q=ba+sa}if(nd&&s.type!="touchstart"){if(Ea=Math.sqrt(Math.pow(L-N,2)+Math.pow(ga-Q,2))>10){if(ic&&(Ja||ma)&&hc(L-V,ga-ba))ua||(ua=aa.rect(V,
ba,Oa?1:wa,M?1:sa,0).attr({fill:"rgba(69,114,167,0.25)",zIndex:7}).add());if(ua&&Oa){N=N-L;ua.attr({width:cb(N),x:(N>0?0:N)+L})}if(ua&&M){Q=Q-ga;ua.attr({height:cb(Q),y:(Q>0?0:Q)+ga})}}}else if(!H){var A;Q=m.hoverPoint;N=m.hoverSeries;var D,ha,xa=Xa,va=Ga?s.chartY:s.chartX-V;if(rc&&h.shared){A=[];D=Ba.length;for(ha=0;ha<D;ha++)if(Ba[ha].visible&&Ba[ha].tooltipPoints.length){s=Ba[ha].tooltipPoints[va];s._dist=cb(va-s.plotX);xa=pb(xa,s._dist);A.push(s)}for(D=A.length;D--;)A[D]._dist>xa&&A.splice(D,
1);if(A.length&&A[0].plotX!=ld){rc.refresh(A);ld=A[0].plotX}}if(N&&N.tracker)(s=N.tooltipPoints[va])&&s!=Q&&s.onMouseOver()}return(E=H)||!ic}};ta.onmousemove=ea;Qa(ta,"mouseleave",O);ta.ontouchstart=function(s){if(Ja||ma)ta.onmousedown(s);ea(s)};ta.ontouchmove=ea;ta.ontouchend=function(){Ea&&O()};ta.onclick=function(s){var N=m.hoverPoint;s=x(s);s.cancelBubble=true;if(!Ea)if(N&&za(s.target,"isTracker")){var Q=N.plotX,H=N.plotY;qa(N,{pageX:qc.left+V+(Ga?wa-H:Q),pageY:qc.top+ba+(Ga?sa-Q:H)});La(N.series,
"click",qa(s,{point:N}));N.firePointEvent("click",s)}else{qa(s,w(s));hc(s.chartX-V,s.chartY-ba)&&La(m,"click",s)}Ea=false}})();Nd=setInterval(function(){kd&&kd()},32);qa(this,{zoomX:Ja,zoomY:ma,resetTracker:O})}function g(m){var h=m.type||v.type||v.defaultSeriesType,x=ub[h],w=q.hasRendered;if(w)if(Ga&&h=="column")x=ub.bar;else if(!Ga&&h=="bar")x=ub.column;h=new x;h.init(q,m);if(!w&&h.inverted)Ga=true;if(h.isCartesian)ic=h.isCartesian;Ba.push(h);return h}function i(){v.alignTicks!==false&&t(ab,function(m){m.adjustTickAmount()});
Gb=null}function k(m){var h=q.isDirtyLegend,x,w=q.isDirtyBox,O=Ba.length,ja=O,L=q.clipRect;for(bc(m,q);ja--;){m=Ba[ja];if(m.isDirty&&m.options.stacking){x=true;break}}if(x)for(ja=O;ja--;){m=Ba[ja];if(m.options.stacking)m.isDirty=true}t(Ba,function(ga){if(ga.isDirty){ga.cleanData();ga.getSegments();if(ga.options.legendType=="point")h=true}});if(h&&od.renderLegend){od.renderLegend();q.isDirtyLegend=false}if(ic){if(!Rc){Gb=null;t(ab,function(ga){ga.setScale()})}i();sc();t(ab,function(ga){if(ga.isDirty||
w){ga.redraw();w=true}})}if(w){pd();Pc();if(L){Sc(L);L.animate({width:q.plotSizeX,height:q.plotSizeY})}}t(Ba,function(ga){if(ga.isDirty&&ga.visible&&(!ga.isCartesian||ga.xAxis))ga.redraw()});gc&&gc.resetTracker&&gc.resetTracker();La(q,"redraw")}function j(){var m=a.xAxis||{},h=a.yAxis||{},x;m=nc(m);t(m,function(w,O){w.index=O;w.isX=true});h=nc(h);t(h,function(w,O){w.index=O});ab=m.concat(h);q.xAxis=[];q.yAxis=[];ab=jc(ab,function(w){x=new c(q,w);q[x.isXAxis?"xAxis":"yAxis"].push(x);return x});i()}
function n(m,h){kc=ya(a.title,m);tc=ya(a.subtitle,h);t([["title",m,kc],["subtitle",h,tc]],function(x){var w=x[0],O=q[w],ja=x[1];x=x[2];if(O&&ja){O.destroy();O=null}if(x&&x.text&&!O)q[w]=aa.text(x.text,0,0).attr({align:x.align,"class":"highcharts-"+w,zIndex:1}).css(x.style).add().align(x,false,uc)})}function z(){jb=v.renderTo;Od=Zb+qd++;if(Kb(jb))jb=Aa.getElementById(jb);jb.innerHTML="";if(!jb.offsetWidth){Qb=jb.cloneNode(0);Ia(Qb,{position:lc,top:"-9999px",display:""});Aa.body.appendChild(Qb)}Tc=
(Qb||jb).offsetWidth;vc=(Qb||jb).offsetHeight;q.chartWidth=Xa=v.width||Tc||600;q.chartHeight=Pa=v.height||(vc>19?vc:400);q.container=ta=fb(Lb,{className:"highcharts-container"+(v.className?" "+v.className:""),id:Od},qa({position:Pd,overflow:vb,width:Xa+$a,height:Pa+$a,textAlign:"left"},v.style),Qb||jb);q.renderer=aa=v.forExport?new Uc(ta,Xa,Pa,true):new Qd(ta,Xa,Pa);var m,h;if(Rd&&ta.getBoundingClientRect){m=function(){Ia(ta,{left:0,top:0});h=ta.getBoundingClientRect();Ia(ta,{left:-h.left%1+$a,top:-h.top%
1+$a})};m();Qa(ib,"resize",m);Qa(q,"destroy",function(){Cb(ib,"resize",m)})}}function F(){function m(){var x=v.width||jb.offsetWidth,w=v.height||jb.offsetHeight;if(x&&w){if(x!=Tc||w!=vc){clearTimeout(h);h=setTimeout(function(){rd(x,w,false)},100)}Tc=x;vc=w}}var h;Qa(window,"resize",m);Qa(q,"destroy",function(){Cb(window,"resize",m)})}function W(){var m=a.labels,h=a.credits,x;n();od=q.legend=new be(q);sc();t(ab,function(w){w.setTickPositions(true)});i();sc();pd();ic&&t(ab,function(w){w.render()});
if(!q.seriesGroup)q.seriesGroup=aa.g("series-group").attr({zIndex:3}).add();t(Ba,function(w){w.translate();w.setTooltipPoints();w.render()});m.items&&t(m.items,function(){var w=qa(m.style,this.style),O=oa(w.left)+V,ja=oa(w.top)+ba+12;delete w.left;delete w.top;aa.text(this.html,O,ja).attr({zIndex:2}).css(w).add()});if(!q.toolbar)q.toolbar=d(q);if(h.enabled&&!q.credits){x=h.href;aa.text(h.text,0,0).on("click",function(){if(x)location.href=x}).attr({align:h.position.align,zIndex:8}).css(h.style).add().align(h.position)}Pc();
q.hasRendered=true;if(Qb){jb.appendChild(ta);Fc(Qb)}}function ca(){var m=Ba.length,h=ta&&ta.parentNode;La(q,"destroy");Cb(ib,"unload",ca);Cb(q);for(t(ab,function(x){Cb(x)});m--;)Ba[m].destroy();if(ta){ta.innerHTML="";Cb(ta);h&&h.removeChild(ta);ta=null}if(aa)aa.alignedObjects=null;clearInterval(Nd);for(m in q)delete q[m]}function ka(){if(!wc&&ib==ib.top&&Aa.readyState!="complete")Aa.attachEvent("onreadystatechange",function(){Aa.detachEvent("onreadystatechange",ka);ka()});else{z();sd();td();t(a.series||
[],function(m){g(m)});q.inverted=Ga=y(Ga,a.chart.inverted);j();q.render=W;q.tracker=gc=new f(q,a.tooltip);W();La(q,"load");b&&b.apply(q,[q]);t(q.callbacks,function(m){m.apply(q,[q])})}}Lc=ya(Lc,Sa.xAxis);hd=ya(hd,Sa.yAxis);Sa.xAxis=Sa.yAxis=null;a=ya(Sa,a);var v=a.chart,I=v.margin;I=Eb(I)?I:[I,I,I,I];var da=y(v.marginTop,I[0]),X=y(v.marginRight,I[1]),U=y(v.marginBottom,I[2]),R=y(v.marginLeft,I[3]),Ha=v.spacingTop,Ya=v.spacingRight,ud=v.spacingBottom,Vc=v.spacingLeft,uc,kc,tc,ba,Ab,rb,V,Pb,jb,Qb,ta,
Od,Tc,vc,Xa,Pa,jd,Oc,Wc,vd,wd,Xc,q=this,ae=(I=v.events)&&!!I.click,xd,hc,rc,nd,$b,Sd,yd,sa,wa,gc,Qc,Pc,od,Rb,Sb,qc,ic=v.showAxes,Rc=0,ab=[],Gb,Ba=[],Ga,aa,kd,Nd,ld,pd,sc,sd,td,rd,md,Td,be=function(m){function h(u,Z){var pa=u.legendItem,Na=u.legendLine,P=u.legendSymbol,K=M.color,gb=Z?L.itemStyle.color:K;K=Z?u.color:K;pa&&pa.css({fill:gb});Na&&Na.attr({stroke:K});P&&P.attr({stroke:K,fill:K})}function x(u,Z,pa){var Na=u.legendItem,P=u.legendLine,K=u.legendSymbol;u=u.checkbox;Na&&Na.attr({x:Z,y:pa});
P&&P.translate(Z,pa-4);K&&K.attr({x:Z+K.xOff,y:pa+K.yOff});if(u){u.x=Z;u.y=pa}}function w(){t(bb,function(u){var Z=u.checkbox;Z&&Ia(Z,{left:Ka.attr("translateX")+u.legendItemWidth+Z.x-40+$a,top:Ka.attr("translateY")+Z.y-11+$a})})}function O(u){var Z,pa,Na,P,K,gb=u.legendItem;P=u.series||u;if(!gb){K=/^(bar|pie|area|column)$/.test(P.type);u.legendItem=gb=aa.text(L.labelFormatter.call(u),0,0).css(u.visible?ma:M).on("mouseover",function(){u.setState(yb);gb.css(Oa)}).on("mouseout",function(){gb.css(u.visible?
ma:M);u.setState()}).on("click",function(){var Vb=function(){u.setVisible()};u.firePointEvent?u.firePointEvent("legendItemClick",null,Vb):La(u,"legendItemClick",null,Vb)}).attr({zIndex:2}).add(Ka);if(!K&&u.options&&u.options.lineWidth){var cc=u.options;P={"stroke-width":cc.lineWidth,zIndex:2};if(cc.dashStyle)P.dashstyle=cc.dashStyle;u.legendLine=aa.path([Za,-Ea-ua,0,Da,-ua,0]).attr(P).add(Ka)}if(K)Z=aa.rect(pa=-Ea-ua,Na=-11,Ea,12,2).attr({"stroke-width":0,zIndex:3}).add(Ka);else if(u.options&&u.options.marker&&
u.options.marker.enabled)Z=aa.symbol(u.symbol,pa=-Ea/2-ua,Na=-4,u.options.marker.radius).attr(u.pointAttr[db]).attr({zIndex:3}).add(Ka);if(Z){Z.xOff=pa;Z.yOff=Na}u.legendSymbol=Z;h(u,u.visible);if(u.options&&u.options.showCheckbox){u.checkbox=fb("input",{type:"checkbox",checked:u.selected,defaultChecked:u.selected},L.itemCheckboxStyle,ta);Qa(u.checkbox,"click",function(Vb){La(u,"checkboxClick",{checked:Vb.target.checked},function(){u.select()})})}}Z=gb.getBBox();pa=u.legendItemWidth=L.itemWidth||
Ea+ua+Z.width+ea;D=Z.height;if(ga&&Q-N+pa>(Hb||Xa-2*E-N)){Q=N;H+=D}A=H;x(u,Q,H);if(ga)Q+=pa;else H+=D;tb=Hb||Ca(ga?Q-N:pa,tb);bb.push(u)}function ja(){Q=N;H=s;A=tb=0;bb=[];Ka||(Ka=aa.g("legend").attr({zIndex:7}).add());Ta&&Fa.reverse();t(Fa,function(Na){if(Na.options.showInLegend)t(Na.options.legendType=="point"?Na.data:[Na],O)});Ta&&Fa.reverse();Rb=Hb||tb;Sb=A-s+D;if(xa||va){Rb+=2*E;Sb+=2*E;if(ha)Rb>0&&Sb>0&&ha.animate(ha.crisp(null,null,null,Rb,Sb));else ha=aa.rect(0,0,Rb,Sb,L.borderRadius,xa||
0).attr({stroke:L.borderColor,"stroke-width":xa||0,fill:va||nb}).add(Ka).shadow(L.shadow);ha[bb.length?"show":"hide"]()}for(var u=["left","right","top","bottom"],Z,pa=4;pa--;){Z=u[pa];if(Ja[Z]&&Ja[Z]!="auto"){L[pa<2?"align":"verticalAlign"]=Z;L[pa<2?"x":"y"]=oa(Ja[Z])*(pa%2?-1:1)}}Ka.align(qa(L,{width:Rb,height:Sb}),true,uc);Rc||w()}var L=m.options.legend;if(L.enabled){var ga=L.layout=="horizontal",Ea=L.symbolWidth,ua=L.symbolPadding,bb,Ja=L.style,ma=L.itemStyle,Oa=L.itemHoverStyle,M=L.itemHiddenStyle,
E=oa(Ja.padding),ea=20,s=18,N=4+E+Ea+ua,Q,H,A,D=0,ha,xa=L.borderWidth,va=L.backgroundColor,Ka,tb,Hb=L.width,Fa=m.series,Ta=L.reversed;ja();Qa(m,"endResize",w);return{colorizeItem:h,destroyItem:function(u){var Z=u.checkbox;t(["legendItem","legendLine","legendSymbol"],function(pa){u[pa]&&u[pa].destroy()});Z&&Fc(u.checkbox)},renderLegend:ja}}};hc=function(m,h){return m>=0&&m<=wa&&h>=0&&h<=sa};Td=function(){La(q,"selection",{resetSelection:true},md);q.toolbar.remove("zoom")};md=function(m){var h=Sa.lang,
x=q.pointCount<100;q.toolbar.add("zoom",h.resetZoom,h.resetZoomTitle,Td);!m||m.resetSelection?t(ab,function(w){w.setExtremes(null,null,false,x)}):t(m.xAxis.concat(m.yAxis),function(w){var O=w.axis;if(q.tracker[O.isXAxis?"zoomX":"zoomY"])O.setExtremes(w.min,w.max,false,x)});k()};sc=function(){var m=a.legend,h=y(m.margin,10),x=m.x,w=m.y,O=m.align,ja=m.verticalAlign,L;sd();if((q.title||q.subtitle)&&!J(da))if(L=Ca(q.title&&!kc.floating&&!kc.verticalAlign&&kc.y||0,q.subtitle&&!tc.floating&&!tc.verticalAlign&&
tc.y||0))ba=Ca(ba,L+y(kc.margin,15)+Ha);if(m.enabled&&!m.floating)if(O=="right")J(X)||(Ab=Ca(Ab,Rb-x+h+Ya));else if(O=="left")J(R)||(V=Ca(V,Rb+x+h+Vc));else if(ja=="top")J(da)||(ba=Ca(ba,Sb+w+h+Ha));else if(ja=="bottom")J(U)||(rb=Ca(rb,Sb-w+h+ud));ic&&t(ab,function(ga){ga.getOffset()});J(R)||(V+=Pb[3]);J(da)||(ba+=Pb[0]);J(U)||(rb+=Pb[2]);J(X)||(Ab+=Pb[1]);td()};rd=function(m,h,x){var w=q.title,O=q.subtitle;Rc+=1;bc(x,q);Oc=Pa;jd=Xa;Xa=fa(m);Pa=fa(h);Ia(ta,{width:Xa+$a,height:Pa+$a});aa.setSize(Xa,
Pa,x);wa=Xa-V-Ab;sa=Pa-ba-rb;Gb=null;t(ab,function(ja){ja.isDirty=true;ja.setScale()});t(Ba,function(ja){ja.isDirty=true});q.isDirtyLegend=true;q.isDirtyBox=true;sc();w&&w.align(null,null,uc);O&&O.align(null,null,uc);k(x);Oc=null;La(q,"resize");setTimeout(function(){La(q,"endResize",null,function(){Rc-=1})},Bc&&Bc.duration||500)};td=function(){q.plotLeft=V=fa(V);q.plotTop=ba=fa(ba);q.plotWidth=wa=fa(Xa-V-Ab);q.plotHeight=sa=fa(Pa-ba-rb);q.plotSizeX=Ga?sa:wa;q.plotSizeY=Ga?wa:sa;uc={x:Vc,y:Ha,width:Xa-
Vc-Ya,height:Pa-Ha-ud}};sd=function(){ba=y(da,Ha);Ab=y(X,Ya);rb=y(U,ud);V=y(R,Vc);Pb=[0,0,0,0]};pd=function(){var m=v.borderWidth||0,h=v.backgroundColor,x=v.plotBackgroundColor,w=v.plotBackgroundImage,O,ja={x:V,y:ba,width:wa,height:sa};O=m+(v.shadow?8:0);if(m||h)if(Wc)Wc.animate(Wc.crisp(null,null,null,Xa-O,Pa-O));else Wc=aa.rect(O/2,O/2,Xa-O,Pa-O,v.borderRadius,m).attr({stroke:v.borderColor,"stroke-width":m,fill:h||nb}).add().shadow(v.shadow);if(x)if(vd)vd.animate(ja);else vd=aa.rect(V,ba,wa,sa,
0).attr({fill:x}).add().shadow(v.plotShadow);if(w)if(wd)wd.animate(ja);else wd=aa.image(w,V,ba,wa,sa).add();if(v.plotBorderWidth)if(Xc)Xc.animate(Xc.crisp(null,V,ba,wa,sa));else Xc=aa.rect(V,ba,wa,sa,0,v.plotBorderWidth).attr({stroke:v.plotBorderColor,"stroke-width":v.plotBorderWidth,zIndex:4}).add();q.isDirtyBox=false};Yc=Jb=0;Qa(ib,"unload",ca);v.reflow!==false&&Qa(q,"load",F);if(I)for(xd in I)Qa(q,xd,I[xd]);q.options=a;q.series=Ba;q.addSeries=function(m,h,x){var w;if(m){bc(x,q);h=y(h,true);La(q,
"addSeries",{options:m},function(){w=g(m);w.isDirty=true;q.isDirtyLegend=true;h&&q.redraw()})}return w};q.animation=y(v.animation,true);q.destroy=ca;q.get=function(m){var h,x,w;for(h=0;h<ab.length;h++)if(ab[h].options.id==m)return ab[h];for(h=0;h<Ba.length;h++)if(Ba[h].options.id==m)return Ba[h];for(h=0;h<Ba.length;h++){w=Ba[h].data;for(x=0;x<w.length;x++)if(w[x].id==m)return w[x]}return null};q.getSelectedPoints=function(){var m=[];t(Ba,function(h){m=m.concat(zd(h.data,function(x){return x.selected}))});
return m};q.getSelectedSeries=function(){return zd(Ba,function(m){return m.selected})};q.hideLoading=function(){Zc($b,{opacity:0},{duration:a.loading.hideDuration,complete:function(){Ia($b,{display:nb})}});yd=false};q.isInsidePlot=hc;q.redraw=k;q.setSize=rd;q.setTitle=n;q.showLoading=function(m){var h=a.loading;if(!$b){$b=fb(Lb,{className:"highcharts-loading"},qa(h.style,{left:V+$a,top:ba+$a,width:wa+$a,height:sa+$a,zIndex:10,display:nb}),ta);Sd=fb("span",null,h.labelStyle,$b)}Sd.innerHTML=m||a.lang.loading;
if(!yd){Ia($b,{opacity:0,display:""});Zc($b,{opacity:h.style.opacity},{duration:h.showDuration});yd=true}};q.pointCount=0;ka()}var Aa=document,ib=window,Ua=Math,fa=Ua.round,ob=Ua.floor,fd=Ua.ceil,Ca=Ua.max,pb=Ua.min,cb=Ua.abs,kb=Ua.cos,zb=Ua.sin,Tb=Ua.PI,Ud=Tb*2/360,xc=navigator.userAgent,Ac=/msie/i.test(xc)&&!ib.opera,yc=Aa.documentMode==8,ce=/AppleWebKit/.test(xc),Rd=/Firefox/.test(xc),wc=!!Aa.createElementNS&&!!Aa.createElementNS("http://www.w3.org/2000/svg","svg").createSVGRect,Ib="ontouchstart"in
Aa.documentElement,Jb,Yc,de={},qd=0,qb=1,Gc,Sa,Mc,Bc,$c,Ra,Lb="div",lc="absolute",Pd="relative",vb="hidden",Zb="highcharts-",Bb="visible",$a="px",nb="none",Za="M",Da="L",Vd="rgba(192,192,192,"+(wc?1.0E-6:0.0020)+")",db="",yb="hover",Cc,bd,cd,dd,oc,Dc,Ec,Cd,Dd,ed,Ed,Fd,eb=ib.HighchartsAdapter,Db=eb||{},t=Db.each,zd=Db.grep,jc=Db.map,ya=Db.merge,Ad=Db.hyphenate,Qa=Db.addEvent,Cb=Db.removeEvent,La=Db.fireEvent,Zc=Db.animate,Sc=Db.stop,ub={};eb&&eb.init&&eb.init();if(!eb&&ib.jQuery){var lb=jQuery;t=function(a,
b){for(var c=0,d=a.length;c<d;c++)if(b.call(a[c],a[c],c,a)===false)return c};zd=lb.grep;jc=function(a,b){for(var c=[],d=0,e=a.length;d<e;d++)c[d]=b.call(a[d],a[d],d,a);return c};ya=function(){var a=arguments;return lb.extend(true,null,a[0],a[1],a[2],a[3])};Ad=function(a){return a.replace(/([A-Z])/g,function(b,c){return"-"+c.toLowerCase()})};Qa=function(a,b,c){lb(a).bind(b,c)};Cb=function(a,b,c){var d=Aa.removeEventListener?"removeEventListener":"detachEvent";if(Aa[d]&&!a[d])a[d]=function(){};lb(a).unbind(b,
c)};La=function(a,b,c,d){var e=lb.Event(b),f="detached"+b;qa(e,c);if(a[b]){a[f]=a[b];a[b]=null}lb(a).trigger(e);if(a[f]){a[b]=a[f];a[f]=null}d&&!e.isDefaultPrevented()&&d(e)};Zc=function(a,b,c){var d=lb(a);if(b.d){a.toD=b.d;b.d=1}d.stop();d.animate(b,c)};Sc=function(a){lb(a).stop()};lb.extend(lb.easing,{easeOutQuad:function(a,b,c,d,e){return-d*(b/=e)*(b-2)+c}});var ee=jQuery.fx.step._default,fe=jQuery.fx.prototype.cur;lb.fx.step._default=function(a){var b=a.elem;b.attr?b.attr(a.prop,a.now):ee.apply(this,
arguments)};lb.fx.step.d=function(a){var b=a.elem;if(!a.started){var c=$c.init(b,b.d,b.toD);a.start=c[0];a.end=c[1];a.started=true}b.attr("d",$c.step(a.start,a.end,a.pos,b.toD))};lb.fx.prototype.cur=function(){var a=this.elem;return a.attr?a.attr(this.prop):fe.apply(this,arguments)}}$c={init:function(a,b,c){b=b||"";var d=a.shift,e=b.indexOf("C")>-1,f=e?7:3,g;b=b.split(" ");c=[].concat(c);var i,k,j=function(n){for(g=n.length;g--;)n[g]==Za&&n.splice(g+1,0,n[g+1],n[g+2],n[g+1],n[g+2])};if(e){j(b);j(c)}if(a.isArea){i=
b.splice(b.length-6,6);k=c.splice(c.length-6,6)}if(d){c=[].concat(c).splice(0,f).concat(c);a.shift=false}if(b.length)for(a=c.length;b.length<a;){d=[].concat(b).splice(b.length-f,f);if(e){d[f-6]=d[f-2];d[f-5]=d[f-1]}b=b.concat(d)}if(i){b=b.concat(i);c=c.concat(k)}return[b,c]},step:function(a,b,c,d){var e=[],f=a.length;if(c==1)e=d;else if(f==b.length&&c<1)for(;f--;){d=parseFloat(a[f]);e[f]=isNaN(d)?a[f]:c*parseFloat(b[f]-d)+d}else e=b;return e}};eb={enabled:true,align:"center",x:0,y:15,style:{color:"#666",
fontSize:"11px",lineHeight:"14px"}};Sa={colors:["#4572A7","#AA4643","#89A54E","#80699B","#3D96AE","#DB843D","#92A8CD","#A47D7C","#B5CA92"],symbols:["circle","diamond","square","triangle","triangle-down"],lang:{loading:"Loading...",months:["January","February","March","April","May","June","July","August","September","October","November","December"],weekdays:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],decimalPoint:".",resetZoom:"Reset zoom",resetZoomTitle:"Reset zoom level 1:1",
thousandsSep:","},global:{useUTC:true},chart:{borderColor:"#4572A7",borderRadius:5,defaultSeriesType:"line",ignoreHiddenSeries:true,spacingTop:10,spacingRight:10,spacingBottom:15,spacingLeft:10,style:{fontFamily:'"Lucida Grande", "Lucida Sans Unicode", Verdana, Arial, Helvetica, sans-serif',fontSize:"12px"},backgroundColor:"#FFFFFF",plotBorderColor:"#C0C0C0"},title:{text:"Chart title",align:"center",y:15,style:{color:"#3E576F",fontSize:"16px"}},subtitle:{text:"",align:"center",y:30,style:{color:"#6D869F"}},
plotOptions:{line:{allowPointSelect:false,showCheckbox:false,animation:{duration:1E3},events:{},lineWidth:2,shadow:true,marker:{enabled:true,lineWidth:0,radius:4,lineColor:"#FFFFFF",states:{hover:{},select:{fillColor:"#FFFFFF",lineColor:"#000000",lineWidth:2}}},point:{events:{}},dataLabels:ya(eb,{enabled:false,y:-6,formatter:function(){return this.y}}),showInLegend:true,states:{hover:{marker:{}},select:{marker:{}}},stickyTracking:true}},labels:{style:{position:lc,color:"#3E576F"}},legend:{enabled:true,
align:"center",layout:"horizontal",labelFormatter:function(){return this.name},borderWidth:1,borderColor:"#909090",borderRadius:5,shadow:false,style:{padding:"5px"},itemStyle:{cursor:"pointer",color:"#3E576F"},itemHoverStyle:{cursor:"pointer",color:"#000000"},itemHiddenStyle:{color:"#C0C0C0"},itemCheckboxStyle:{position:lc,width:"13px",height:"13px"},symbolWidth:16,symbolPadding:5,verticalAlign:"bottom",x:0,y:0},loading:{hideDuration:100,labelStyle:{fontWeight:"bold",position:Pd,top:"1em"},showDuration:100,
style:{position:lc,backgroundColor:"white",opacity:0.5,textAlign:"center"}},tooltip:{enabled:true,backgroundColor:"rgba(255, 255, 255, .85)",borderWidth:2,borderRadius:5,shadow:true,snap:Ib?25:10,style:{color:"#333333",fontSize:"12px",padding:"5px",whiteSpace:"nowrap"}},toolbar:{itemStyle:{color:"#4572A7",cursor:"pointer"}},credits:{enabled:true,text:"Highcharts.com",href:"http://www.highcharts.com",position:{align:"right",x:-10,verticalAlign:"bottom",y:-5},style:{cursor:"pointer",color:"#909090",
fontSize:"10px"}}};var Lc={dateTimeLabelFormats:{second:"%H:%M:%S",minute:"%H:%M",hour:"%H:%M",day:"%e. %b",week:"%e. %b",month:"%b '%y",year:"%Y"},endOnTick:false,gridLineColor:"#C0C0C0",labels:eb,lineColor:"#C0D0E0",lineWidth:1,max:null,min:null,minPadding:0.01,maxPadding:0.01,minorGridLineColor:"#E0E0E0",minorGridLineWidth:1,minorTickColor:"#A0A0A0",minorTickLength:2,minorTickPosition:"outside",startOfWeek:1,startOnTick:false,tickColor:"#C0D0E0",tickLength:5,tickmarkPlacement:"between",tickPixelInterval:100,
tickPosition:"outside",tickWidth:1,title:{align:"middle",style:{color:"#6D869F",fontWeight:"bold"}},type:"linear"},hd=ya(Lc,{endOnTick:true,gridLineWidth:1,tickPixelInterval:72,showLastLabel:true,labels:{align:"right",x:-8,y:3},lineWidth:0,maxPadding:0.05,minPadding:0.05,startOnTick:true,tickWidth:0,title:{rotation:270,text:"Y-values"}}),Zd={labels:{align:"right",x:-8,y:null},title:{rotation:270}},Yd={labels:{align:"left",x:8,y:null},title:{rotation:90}},Ld={labels:{align:"center",x:0,y:14},title:{rotation:0}},
Xd=ya(Ld,{labels:{y:-5}}),wb=Sa.plotOptions;eb=wb.line;wb.spline=ya(eb);wb.scatter=ya(eb,{lineWidth:0,states:{hover:{lineWidth:0}}});wb.area=ya(eb,{});wb.areaspline=ya(wb.area);wb.column=ya(eb,{borderColor:"#FFFFFF",borderWidth:1,borderRadius:0,groupPadding:0.2,marker:null,pointPadding:0.1,minPointLength:0,states:{hover:{brightness:0.1,shadow:false},select:{color:"#C0C0C0",borderColor:"#000000",shadow:false}}});wb.bar=ya(wb.column,{dataLabels:{align:"left",x:5,y:0}});wb.pie=ya(eb,{borderColor:"#FFFFFF",
borderWidth:1,center:["50%","50%"],colorByPoint:true,dataLabels:{distance:30,enabled:true,formatter:function(){return this.point.name},y:5},legendType:"point",marker:null,size:"75%",showInLegend:false,slicedOffset:10,states:{hover:{brightness:0.1,shadow:false}}});Bd();var Ub=function(a){var b=[],c;(function(d){if(c=/rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]?(?:\.[0-9]+)?)\s*\)/.exec(d))b=[oa(c[1]),oa(c[2]),oa(c[3]),parseFloat(c[4],10)];else if(c=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(d))b=
[oa(c[1],16),oa(c[2],16),oa(c[3],16),1]})(a);return{get:function(d){return b&&!isNaN(b[0])?d=="rgb"?"rgb("+b[0]+","+b[1]+","+b[2]+")":d=="a"?b[3]:"rgba("+b.join(",")+")":a},brighten:function(d){if(ac(d)&&d!==0){var e;for(e=0;e<3;e++){b[e]+=oa(d*255);if(b[e]<0)b[e]=0;if(b[e]>255)b[e]=255}}return this},setOpacity:function(d){b[3]=d;return this}}};Mc=function(a,b,c){function d(F){return F.toString().replace(/^([0-9])$/,"0$1")}if(!J(b)||isNaN(b))return"Invalid date";a=y(a,"%Y-%m-%d %H:%M:%S");b=new Date(b*
qb);var e=b[cd](),f=b[dd](),g=b[oc](),i=b[Dc](),k=b[Ec](),j=Sa.lang,n=j.weekdays;j=j.months;b={a:n[f].substr(0,3),A:n[f],d:d(g),e:g,b:j[i].substr(0,3),B:j[i],m:d(i+1),y:k.toString().substr(2,2),Y:k,H:d(e),I:d(e%12||12),l:e%12||12,M:d(b[bd]()),p:e<12?"AM":"PM",P:e<12?"am":"pm",S:d(b.getSeconds())};for(var z in b)a=a.replace("%"+z,b[z]);return c?a.substr(0,1).toUpperCase()+a.substr(1):a};Hc.prototype={init:function(a,b){this.element=Aa.createElementNS("http://www.w3.org/2000/svg",b);this.renderer=a},
animate:function(a,b,c){if(b=y(b,Bc,true)){b=ya(b);if(c)b.complete=c;Zc(this,a,b)}else{this.attr(a);c&&c()}},attr:function(a,b){var c,d,e,f,g=this.element,i=g.nodeName,k=this.renderer,j,n=this.shadows,z,F=this;if(Kb(a)&&J(b)){c=a;a={};a[c]=b}if(Kb(a)){c=a;if(i=="circle")c={x:"cx",y:"cy"}[c]||c;else if(c=="strokeWidth")c="stroke-width";F=za(g,c)||this[c]||0;if(c!="d"&&c!="visibility")F=parseFloat(F)}else for(c in a){j=false;d=a[c];if(c=="d"){if(d&&d.join)d=d.join(" ");if(/(NaN| {2}|^$)/.test(d))d=
"M 0 0";this.d=d}else if(c=="x"&&i=="text"){for(e=0;e<g.childNodes.length;e++){f=g.childNodes[e];za(f,"x")==za(g,"x")&&za(f,"x",d)}if(this.rotation)za(g,"transform","rotate("+this.rotation+" "+d+" "+oa(a.y||za(g,"y"))+")")}else if(c=="fill")d=k.color(d,g,c);else if(i=="circle"&&(c=="x"||c=="y"))c={x:"cx",y:"cy"}[c]||c;else if(c=="translateX"||c=="translateY"||c=="rotation"||c=="verticalAlign"){this[c]=d;this.updateTransform();j=true}else if(c=="stroke")d=k.color(d,g,c);else if(c=="dashstyle"){c="stroke-dasharray";
if(d){d=d.toLowerCase().replace("shortdashdotdot","3,1,1,1,1,1,").replace("shortdashdot","3,1,1,1").replace("shortdot","1,1,").replace("shortdash","3,1,").replace("longdash","8,3,").replace(/dot/g,"1,3,").replace("dash","4,3,").replace(/,$/,"").split(",");for(e=d.length;e--;)d[e]=oa(d[e])*a["stroke-width"];d=d.join(",")}}else if(c=="isTracker")this[c]=d;else if(c=="width")d=oa(d);else if(c=="align"){c="text-anchor";d={left:"start",center:"middle",right:"end"}[d]}if(c=="strokeWidth")c="stroke-width";
if(ce&&c=="stroke-width"&&d===0)d=1.0E-6;if(this.symbolName&&/^(x|y|r|start|end|innerR)/.test(c)){if(!z){this.symbolAttr(a);z=true}j=true}if(n&&/^(width|height|visibility|x|y|d)$/.test(c))for(e=n.length;e--;)za(n[e],c,d);if(c=="text"){this.textStr=d;this.added&&k.buildText(this)}else j||za(g,c,d)}return F},symbolAttr:function(a){var b=this;t(["x","y","r","start","end","width","height","innerR"],function(c){b[c]=y(a[c],b[c])});b.attr({d:b.renderer.symbols[b.symbolName](b.x,b.y,b.r,{start:b.start,end:b.end,
width:b.width,height:b.height,innerR:b.innerR})})},clip:function(a){return this.attr("clip-path","url("+this.renderer.url+"#"+a.id+")")},crisp:function(a,b,c,d,e){var f,g={},i={},k;a=a||this.strokeWidth||0;k=a%2/2;i.x=ob(b||this.x||0)+k;i.y=ob(c||this.y||0)+k;i.width=ob((d||this.width||0)-2*k);i.height=ob((e||this.height||0)-2*k);i.strokeWidth=a;for(f in i)if(this[f]!=i[f])this[f]=g[f]=i[f];return g},css:function(a){var b=this.element;b=a&&a.width&&b.nodeName=="text";if(a&&a.color)a.fill=a.color;
this.styles=a=qa(this.styles,a);if(Ac&&!wc){b&&delete a.width;Ia(this.element,a)}else this.attr({style:Wd(a)});b&&this.added&&this.renderer.buildText(this);return this},on:function(a,b){var c=b;if(Ib&&a=="click"){a="touchstart";c=function(d){d.preventDefault();b()}}this.element["on"+a]=c;return this},translate:function(a,b){return this.attr({translateX:a,translateY:b})},invert:function(){this.inverted=true;this.updateTransform();return this},updateTransform:function(){var a=this.translateX||0,b=this.translateY||
0,c=this.inverted,d=this.rotation,e=[];if(c){a+=this.attr("width");b+=this.attr("height")}if(a||b)e.push("translate("+a+","+b+")");if(c)e.push("rotate(90) scale(-1,1)");else d&&e.push("rotate("+d+" "+this.x+" "+this.y+")");e.length&&za(this.element,"transform",e.join(" "))},toFront:function(){var a=this.element;a.parentNode.appendChild(a);return this},align:function(a,b,c){if(a){this.alignOptions=a;this.alignByTranslate=b;c||this.renderer.alignedObjects.push(this)}else{a=this.alignOptions;b=this.alignByTranslate}c=
y(c,this.renderer);var d=a.align,e=a.verticalAlign,f=(c.x||0)+(a.x||0),g=(c.y||0)+(a.y||0),i={};if(/^(right|center)$/.test(d))f+=(c.width-(a.width||0))/{right:1,center:2}[d];i[b?"translateX":"x"]=fa(f);if(/^(bottom|middle)$/.test(e))g+=(c.height-(a.height||0))/({bottom:1,middle:2}[e]||1);i[b?"translateY":"y"]=fa(g);this[this.placed?"animate":"attr"](i);this.placed=true;return this},getBBox:function(){var a,b,c,d=this.rotation,e=d*Ud;try{a=qa({},this.element.getBBox())}catch(f){a={width:0,height:0}}b=
a.width;c=a.height;if(d){a.width=cb(c*zb(e))+cb(b*kb(e));a.height=cb(c*kb(e))+cb(b*zb(e))}return a},show:function(){return this.attr({visibility:Bb})},hide:function(){return this.attr({visibility:vb})},add:function(a){var b=this.renderer,c=a||b,d=c.element||b.box,e=d.childNodes,f=this.element,g=za(f,"zIndex");this.parentInverted=a&&a.inverted;this.textStr!==undefined&&b.buildText(this);if(g){c.handleZ=true;g=oa(g)}if(c.handleZ)for(c=0;c<e.length;c++){a=e[c];b=za(a,"zIndex");if(a!=f&&(oa(b)>g||!J(g)&&
J(b))){d.insertBefore(f,a);return this}}d.appendChild(f);this.added=true;return this},destroy:function(){var a=this.element||{},b=this.shadows,c=a.parentNode,d;a.onclick=a.onmouseout=a.onmouseover=a.onmousemove=null;Sc(this);c&&c.removeChild(a);b&&t(b,function(e){(c=e.parentNode)&&c.removeChild(e)});mc(this.renderer.alignedObjects,this);for(d in this)delete this[d];return null},empty:function(){for(var a=this.element,b=a.childNodes,c=b.length;c--;)a.removeChild(b[c])},shadow:function(a){var b=[],
c,d=this.element,e=this.parentInverted?"(-1,-1)":"(1,1)";if(a){for(a=1;a<=3;a++){c=d.cloneNode(0);za(c,{isShadow:"true",stroke:"rgb(0, 0, 0)","stroke-opacity":0.05*a,"stroke-width":7-2*a,transform:"translate"+e,fill:nb});d.parentNode.insertBefore(c,d);b.push(c)}this.shadows=b}return this}};var Uc=function(){this.init.apply(this,arguments)};Uc.prototype={init:function(a,b,c,d){var e=location,f;this.Element=Hc;f=this.createElement("svg").attr({xmlns:"http://www.w3.org/2000/svg",version:"1.1"});a.appendChild(f.element);
this.box=f.element;this.boxWrapper=f;this.alignedObjects=[];this.url=Ac?"":e.href.replace(/#.*?$/,"");this.defs=this.createElement("defs").add();this.forExport=d;this.setSize(b,c,false)},createElement:function(a){var b=new this.Element;b.init(this,a);return b},buildText:function(a){for(var b=a.element,c=y(a.textStr,"").toString().replace(/<(b|strong)>/g,'<span style="font-weight:bold">').replace(/<(i|em)>/g,'<span style="font-style:italic">').replace(/<a/g,"<span").replace(/<\/(b|strong|i|em|a)>/g,
"</span>").split(/<br[^>]?>/g),d=b.childNodes,e=/style="([^"]+)"/,f=/href="([^"]+)"/,g=za(b,"x"),i=a.styles,k=Rd&&i&&i.HcDirection=="rtl"&&!this.forExport,j,n=i&&oa(i.width),z=i&&i.lineHeight,F,W=d.length;W--;)b.removeChild(d[W]);n&&!a.added&&this.box.appendChild(b);t(c,function(ca,ka){var v,I=0,da;ca=ca.replace(/<span/g,"|||<span").replace(/<\/span>/g,"</span>|||");v=ca.split("|||");t(v,function(X){if(X!==""||v.length==1){var U={},R=Aa.createElementNS("http://www.w3.org/2000/svg","tspan");e.test(X)&&
za(R,"style",X.match(e)[1].replace(/(;| |^)color([ :])/,"$1fill$2"));if(f.test(X)){za(R,"onclick",'location.href="'+X.match(f)[1]+'"');Ia(R,{cursor:"pointer"})}X=X.replace(/<(.|\n)*?>/g,"")||" ";if(k){j=[];for(W=X.length;W--;)j.push(X.charAt(W));X=j.join("")}R.appendChild(Aa.createTextNode(X));if(I)U.dx=3;else U.x=g;if(!I){if(ka){da=oa(window.getComputedStyle(F,null).getPropertyValue("line-height"));if(isNaN(da))da=z||F.offsetHeight||18;za(R,"dy",da)}F=R}za(R,U);b.appendChild(R);I++;if(n){X=X.replace(/-/g,
"- ").split(" ");for(var Ha,Ya=[];X.length||Ya.length;){Ha=b.getBBox().width;U=Ha>n;if(!U||X.length==1){X=Ya;Ya=[];if(X.length){R=Aa.createElementNS("http://www.w3.org/2000/svg","tspan");za(R,{x:g,dy:z||16});b.appendChild(R);if(Ha>n)n=Ha}}else{R.removeChild(R.firstChild);Ya.unshift(X.pop())}R.appendChild(Aa.createTextNode(X.join(" ").replace(/- /g,"-")))}}}})})},crispLine:function(a,b){if(a[1]==a[4])a[1]=a[4]=fa(a[1])+b%2/2;if(a[2]==a[5])a[2]=a[5]=fa(a[2])+b%2/2;return a},path:function(a){return this.createElement("path").attr({d:a,
fill:nb})},circle:function(a,b,c){a=Eb(a)?a:{x:a,y:b,r:c};return this.createElement("circle").attr(a)},arc:function(a,b,c,d,e,f){if(Eb(a)){b=a.y;c=a.r;d=a.innerR;e=a.start;f=a.end;a=a.x}return this.symbol("arc",a||0,b||0,c||0,{innerR:d||0,start:e||0,end:f||0})},rect:function(a,b,c,d,e,f){if(Eb(a)){b=a.y;c=a.width;d=a.height;e=a.r;a=a.x}e=this.createElement("rect").attr({rx:e,ry:e,fill:nb});return e.attr(e.crisp(f,a,b,Ca(c,0),Ca(d,0)))},setSize:function(a,b,c){var d=this.alignedObjects,e=d.length;
this.width=a;this.height=b;for(this.boxWrapper[y(c,true)?"animate":"attr"]({width:a,height:b});e--;)d[e].align()},g:function(a){return this.createElement("g").attr(J(a)&&{"class":Zb+a})},image:function(a,b,c,d,e){var f={preserveAspectRatio:nb};arguments.length>1&&qa(f,{x:b,y:c,width:d,height:e});f=this.createElement("image").attr(f);f.element.setAttributeNS("http://www.w3.org/1999/xlink","href",a);return f},symbol:function(a,b,c,d,e){var f,g=this.symbols[a];g=g&&g(b,c,d,e);var i=/^url\((.*?)\)$/;
if(g){f=this.path(g);qa(f,{symbolName:a,x:b,y:c,r:d});e&&qa(f,e)}else if(i.test(a)){a=a.match(i)[1];f=this.image(a).attr({x:b,y:c});fb("img",{onload:function(){var k=de[this.src]||[this.width,this.height];f.attr({width:k[0],height:k[1]}).translate(-fa(k[0]/2),-fa(k[1]/2))},src:a})}else f=this.circle(b,c,d);return f},symbols:{square:function(a,b,c){c=0.707*c;return[Za,a-c,b-c,Da,a+c,b-c,a+c,b+c,a-c,b+c,"Z"]},triangle:function(a,b,c){return[Za,a,b-1.33*c,Da,a+c,b+0.67*c,a-c,b+0.67*c,"Z"]},"triangle-down":function(a,
b,c){return[Za,a,b+1.33*c,Da,a-c,b-0.67*c,a+c,b-0.67*c,"Z"]},diamond:function(a,b,c){return[Za,a,b-c,Da,a+c,b,a,b+c,a-c,b,"Z"]},arc:function(a,b,c,d){var e=d.start,f=d.end-1.0E-6,g=d.innerR,i=kb(e),k=zb(e),j=kb(f);f=zb(f);d=d.end-e<Tb?0:1;return[Za,a+c*i,b+c*k,"A",c,c,0,d,1,a+c*j,b+c*f,Da,a+g*j,b+g*f,"A",g,g,0,d,0,a+g*i,b+g*k,"Z"]}},clipRect:function(a,b,c,d){var e=Zb+qd++,f=this.createElement("clipPath").attr({id:e}).add(this.defs);a=this.rect(a,b,c,d,0).add(f);a.id=e;return a},color:function(a,
b,c){var d,e=/^rgba/;if(a&&a.linearGradient){var f=this;b=a.linearGradient;c=Zb+qd++;var g,i,k;g=f.createElement("linearGradient").attr({id:c,gradientUnits:"userSpaceOnUse",x1:b[0],y1:b[1],x2:b[2],y2:b[3]}).add(f.defs);t(a.stops,function(j){if(e.test(j[1])){d=Ub(j[1]);i=d.get("rgb");k=d.get("a")}else{i=j[1];k=1}f.createElement("stop").attr({offset:j[0],"stop-color":i,"stop-opacity":k}).add(g)});return"url("+this.url+"#"+c+")"}else if(e.test(a)){d=Ub(a);za(b,c+"-opacity",d.get("a"));return d.get("rgb")}else return a},
text:function(a,b,c){var d=Sa.chart.style;b=fa(y(b,0));c=fa(y(c,0));a=this.createElement("text").attr({x:b,y:c,text:a}).css({"font-family":d.fontFamily,"font-size":d.fontSize});a.x=b;a.y=c;return a}};var Ma;if(!wc){var ge=xb(Hc,{init:function(a,b){var c=["<",b,' filled="f" stroked="f"'],d=["position: ",lc,";"];if(b=="shape"||b==Lb)d.push("left:0;top:0;width:10px;height:10px;");if(yc)d.push("visibility: ",b==Lb?vb:Bb);c.push(' style="',d.join(""),'"/>');if(b){c=b==Lb||b=="span"||b=="img"?c.join(""):
a.prepVML(c);this.element=fb(c)}this.renderer=a},add:function(a){var b=this.renderer,c=this.element,d=b.box;d=a?a.element||a:d;a&&a.inverted&&b.invertChild(c,d);yc&&d.gVis==vb&&Ia(c,{visibility:vb});d.appendChild(c);this.added=true;this.alignOnAdd&&this.updateTransform();return this},attr:function(a,b){var c,d,e,f=this.element||{},g=f.style,i=f.nodeName,k=this.renderer,j=this.symbolName,n,z,F=this.shadows,W=this;if(Kb(a)&&J(b)){c=a;a={};a[c]=b}if(Kb(a)){c=a;W=c=="strokeWidth"||c=="stroke-width"?this.strokeweight:
this[c]}else for(c in a){d=a[c];n=false;if(j&&/^(x|y|r|start|end|width|height|innerR)/.test(c)){if(!z){this.symbolAttr(a);z=true}n=true}else if(c=="d"){d=d||[];this.d=d.join(" ");e=d.length;for(n=[];e--;)n[e]=ac(d[e])?fa(d[e]*10)-5:d[e]=="Z"?"x":d[e];d=n.join(" ")||"x";f.path=d;if(F)for(e=F.length;e--;)F[e].path=d;n=true}else if(c=="zIndex"||c=="visibility"){if(yc&&c=="visibility"&&i=="DIV"){f.gVis=d;n=f.childNodes;for(e=n.length;e--;)Ia(n[e],{visibility:d});if(d==Bb)d=null}if(d)g[c]=d;n=true}else if(/^(width|height)$/.test(c)){if(this.updateClipping){this[c]=
d;this.updateClipping()}else g[c]=d;n=true}else if(/^(x|y)$/.test(c)){this[c]=d;if(f.tagName=="SPAN")this.updateTransform();else g[{x:"left",y:"top"}[c]]=d}else if(c=="class")f.className=d;else if(c=="stroke"){d=k.color(d,f,c);c="strokecolor"}else if(c=="stroke-width"||c=="strokeWidth"){f.stroked=d?true:false;c="strokeweight";this[c]=d;if(ac(d))d+=$a}else if(c=="dashstyle"){(f.getElementsByTagName("stroke")[0]||fb(k.prepVML(["<stroke/>"]),null,null,f))[c]=d||"solid";this.dashstyle=d;n=true}else if(c==
"fill")if(i=="SPAN")g.color=d;else{f.filled=d!=nb?true:false;d=k.color(d,f,c);c="fillcolor"}else if(c=="translateX"||c=="translateY"||c=="rotation"||c=="align"){if(c=="align")c="textAlign";this[c]=d;this.updateTransform();n=true}else if(c=="text"){f.innerHTML=d;n=true}if(F&&c=="visibility")for(e=F.length;e--;)F[e].style[c]=d;if(!n)if(yc)f[c]=d;else za(f,c,d)}return W},clip:function(a){var b=this,c=a.members;c.push(b);b.destroyClip=function(){mc(c,b)};return b.css(a.getCSS(b.inverted))},css:function(a){var b=
this.element;if(b=a&&b.tagName=="SPAN"&&a.width){delete a.width;this.textWidth=b;this.updateTransform()}this.styles=qa(this.styles,a);Ia(this.element,a);return this},destroy:function(){this.destroyClip&&this.destroyClip();Hc.prototype.destroy.apply(this)},empty:function(){for(var a=this.element.childNodes,b=a.length,c;b--;){c=a[b];c.parentNode.removeChild(c)}},getBBox:function(){var a=this.element;if(a.nodeName=="text")a.style.position=lc;return{x:a.offsetLeft,y:a.offsetTop,width:a.offsetWidth,height:a.offsetHeight}},
on:function(a,b){this.element["on"+a]=function(){var c=ib.event;c.target=c.srcElement;b(c)};return this},updateTransform:function(){if(this.added){var a=this,b=a.element,c=a.translateX||0,d=a.translateY||0,e=a.x||0,f=a.y||0,g=a.textAlign||"left",i={left:0,center:0.5,right:1}[g],k=g&&g!="left";if(c||d)a.css({marginLeft:c,marginTop:d});a.inverted&&t(b.childNodes,function(I){a.renderer.invertChild(I,b)});if(b.tagName=="SPAN"){var j,n;c=a.rotation;var z;j=0;d=1;var F=0,W;z=oa(a.textWidth);var ca=a.xCorr||
0,ka=a.yCorr||0,v=[c,g,b.innerHTML,a.textWidth].join(",");if(v!=a.cTT){if(J(c)){j=c*Ud;d=kb(j);F=zb(j);Ia(b,{filter:c?["progid:DXImageTransform.Microsoft.Matrix(M11=",d,", M12=",-F,", M21=",F,", M22=",d,", sizingMethod='auto expand')"].join(""):nb})}j=b.offsetWidth;n=b.offsetHeight;if(j>z){Ia(b,{width:z+$a,display:"block",whiteSpace:"normal"});j=z}z=fa(oa(b.style.fontSize||12)*1.2);ca=d<0&&-j;ka=F<0&&-n;W=d*F<0;ca+=F*z*(W?1-i:i);ka-=d*z*(c?W?i:1-i:1);if(k){ca-=j*i*(d<0?-1:1);if(c)ka-=n*i*(F<0?-1:
1);Ia(b,{textAlign:g})}a.xCorr=ca;a.yCorr=ka}Ia(b,{left:e+ca,top:f+ka});a.cTT=v}}else this.alignOnAdd=true},shadow:function(a){var b=[],c=this.element,d=this.renderer,e,f=c.style,g,i=c.path;if(""+c.path==="")i="x";if(a){for(a=1;a<=3;a++){g=['<shape isShadow="true" strokeweight="',7-2*a,'" filled="false" path="',i,'" coordsize="100,100" style="',c.style.cssText,'" />'];e=fb(d.prepVML(g),null,{left:oa(f.left)+1,top:oa(f.top)+1});g=['<stroke color="black" opacity="',0.05*a,'"/>'];fb(d.prepVML(g),null,
null,e);c.parentNode.insertBefore(e,c);b.push(e)}this.shadows=b}return this}});Ma=function(){this.init.apply(this,arguments)};Ma.prototype=ya(Uc.prototype,{isIE8:xc.indexOf("MSIE 8.0")>-1,init:function(a,b,c){var d;this.Element=ge;this.alignedObjects=[];d=this.createElement(Lb);a.appendChild(d.element);this.box=d.element;this.boxWrapper=d;this.setSize(b,c,false);if(!Aa.namespaces.hcv){Aa.namespaces.add("hcv","urn:schemas-microsoft-com:vml");Aa.createStyleSheet().cssText="hcv\\:fill, hcv\\:path, hcv\\:shape, hcv\\:stroke{ behavior:url(#default#VML); display: inline-block; } "}},
clipRect:function(a,b,c,d){var e=this.createElement();return qa(e,{members:[],left:a,top:b,width:c,height:d,getCSS:function(f){var g=this.top,i=this.left,k=i+this.width,j=g+this.height;g={clip:"rect("+fa(f?i:g)+"px,"+fa(f?j:k)+"px,"+fa(f?k:j)+"px,"+fa(f?g:i)+"px)"};!f&&yc&&qa(g,{width:k+$a,height:j+$a});return g},updateClipping:function(){t(e.members,function(f){f.css(e.getCSS(f.inverted))})}})},color:function(a,b,c){var d,e=/^rgba/;if(a&&a.linearGradient){var f,g,i=a.linearGradient,k,j,n,z;t(a.stops,
function(F,W){if(e.test(F[1])){d=Ub(F[1]);f=d.get("rgb");g=d.get("a")}else{f=F[1];g=1}if(W){n=f;z=g}else{k=f;j=g}});a=90-Ua.atan((i[3]-i[1])/(i[2]-i[0]))*180/Tb;c=["<",c,' colors="0% ',k,",100% ",n,'" angle="',a,'" opacity="',z,'" o:opacity2="',j,'" type="gradient" focus="100%" />'];fb(this.prepVML(c),null,null,b)}else if(e.test(a)&&b.tagName!="IMG"){d=Ub(a);c=["<",c,' opacity="',d.get("a"),'"/>'];fb(this.prepVML(c),null,null,b);return d.get("rgb")}else return a},prepVML:function(a){var b=this.isIE8;
a=a.join("");if(b){a=a.replace("/>",' xmlns="urn:schemas-microsoft-com:vml" />');a=a.indexOf('style="')==-1?a.replace("/>",' style="display:inline-block;behavior:url(#default#VML);" />'):a.replace('style="','style="display:inline-block;behavior:url(#default#VML);')}else a=a.replace("<","<hcv:");return a},text:function(a,b,c){var d=Sa.chart.style;return this.createElement("span").attr({text:a,x:fa(b),y:fa(c)}).css({whiteSpace:"nowrap",fontFamily:d.fontFamily,fontSize:d.fontSize})},path:function(a){return this.createElement("shape").attr({coordsize:"100 100",
d:a})},circle:function(a,b,c){return this.path(this.symbols.circle(a,b,c))},g:function(a){var b;if(a)b={className:Zb+a,"class":Zb+a};return this.createElement(Lb).attr(b)},image:function(a,b,c,d,e){var f=this.createElement("img").attr({src:a});arguments.length>1&&f.css({left:b,top:c,width:d,height:e});return f},rect:function(a,b,c,d,e,f){if(Eb(a)){b=a.y;c=a.width;d=a.height;e=a.r;a=a.x}var g=this.symbol("rect");g.r=e;return g.attr(g.crisp(f,a,b,Ca(c,0),Ca(d,0)))},invertChild:function(a,b){var c=b.style;
Ia(a,{flip:"x",left:oa(c.width)-10,top:oa(c.height)-10,rotation:-90})},symbols:{arc:function(a,b,c,d){var e=d.start,f=d.end,g=kb(e),i=zb(e),k=kb(f),j=zb(f);d=d.innerR;var n=0.07/c,z=d&&0.1/d||0;if(f-e===0)return["x"];else if(2*Tb-f+e<n)k=-n;else if(f-e<z)k=kb(e+z);return["wa",a-c,b-c,a+c,b+c,a+c*g,b+c*i,a+c*k,b+c*j,"at",a-d,b-d,a+d,b+d,a+d*k,b+d*j,a+d*g,b+d*i,"x","e"]},circle:function(a,b,c){return["wa",a-c,b-c,a+c,b+c,a+c,b,a+c,b,"e"]},rect:function(a,b,c,d){if(!J(d))return[];var e=d.width;d=d.height;
var f=a+e,g=b+d;c=pb(c,e,d);return[Za,a+c,b,Da,f-c,b,"wa",f-2*c,b,f,b+2*c,f-c,b,f,b+c,Da,f,g-c,"wa",f-2*c,g-2*c,f,g,f,g-c,f-c,g,Da,a+c,g,"wa",a,g-2*c,a+2*c,g,a+c,g,a,g-c,Da,a,b+c,"wa",a,b,a+2*c,b+2*c,a,b+c,a+c,b,"x","e"]}}})}var Qd=wc?Uc:Ma;Hd.prototype.callbacks=[];var zc=function(){};zc.prototype={init:function(a,b){var c;this.series=a;this.applyOptions(b);this.pointAttr={};if(a.options.colorByPoint){c=a.chart.options.colors;if(!this.options)this.options={};this.color=this.options.color=this.color||
c[Jb++];if(Jb>=c.length)Jb=0}a.chart.pointCount++;return this},applyOptions:function(a){var b=this.series;this.config=a;if(ac(a)||a===null)this.y=a;else if(Eb(a)&&!ac(a.length)){qa(this,a);this.options=a}else if(Kb(a[0])){this.name=a[0];this.y=a[1]}else if(ac(a[0])){this.x=a[0];this.y=a[1]}if(this.x===Ra)this.x=b.autoIncrement()},destroy:function(){var a=this,b=a.series,c;b.chart.pointCount--;a==b.chart.hoverPoint&&a.onMouseOut();b.chart.hoverPoints=null;Cb(a);t(["graphic","tracker","group","dataLabel",
"connector"],function(d){a[d]&&a[d].destroy()});a.legendItem&&a.series.chart.legend.destroyItem(a);for(c in a)a[c]=null},select:function(a,b){var c=this,d=c.series.chart;c.selected=a=y(a,!c.selected);c.firePointEvent(a?"select":"unselect");c.setState(a&&"select");b||t(d.getSelectedPoints(),function(e){if(e.selected&&e!=c){e.selected=false;e.setState(db);e.firePointEvent("unselect")}})},onMouseOver:function(){var a=this.series.chart,b=a.tooltip,c=a.hoverPoint;c&&c!=this&&c.onMouseOut();this.firePointEvent("mouseOver");
b&&!b.shared&&b.refresh(this);this.setState(yb);a.hoverPoint=this},onMouseOut:function(){this.firePointEvent("mouseOut");this.setState();this.series.chart.hoverPoint=null},tooltipFormatter:function(a){var b=this.series;return['<span style="color:'+b.color+'">',this.name||b.name,"</span>: ",!a?"<b>x = "+(this.name||this.x)+",</b> ":"","<b>",!a?"y = ":"",this.y,"</b><br/>"].join("")},getDataLabelText:function(){return this.series.options.dataLabels.formatter.call({x:this.x,y:this.y,series:this.series,
point:this,percentage:this.percentage,total:this.total||this.stackTotal})},update:function(a,b,c){var d=this,e=d.series,f=d.dataLabel,g=d.graphic,i=e.chart;b=y(b,true);d.firePointEvent("update",{options:a},function(){d.applyOptions(a);f&&f.attr({text:d.getDataLabelText()});if(Eb(a)){e.getAttribs();g&&g.attr(d.pointAttr[e.state])}e.isDirty=true;b&&i.redraw(c)})},remove:function(a,b){var c=this,d=c.series,e=d.chart,f=d.data;bc(b,e);a=y(a,true);c.firePointEvent("remove",null,function(){mc(f,c);c.destroy();
d.isDirty=true;a&&e.redraw()})},firePointEvent:function(a,b,c){var d=this,e=this.series.options;if(e.point.events[a]||d.options&&d.options.events&&d.options.events[a])this.importEvents();if(a=="click"&&e.allowPointSelect)c=function(f){d.select(null,f.ctrlKey||f.metaKey||f.shiftKey)};La(this,a,b,c)},importEvents:function(){if(!this.hasImportedEvents){var a=ya(this.series.options.point,this.options).events,b;this.events=a;for(b in a)Qa(this,b,a[b]);this.hasImportedEvents=true}},setState:function(a){var b=
this.series,c=b.options.states,d=wb[b.type].marker&&b.options.marker,e=d&&!d.enabled,f=(d=d&&d.states[a])&&d.enabled===false,g=b.stateMarkerGraphic,i=b.chart,k=this.pointAttr;a||(a=db);if(!(a==this.state||this.selected&&a!="select"||c[a]&&c[a].enabled===false||a&&(f||e&&!d.enabled))){if(this.graphic)this.graphic.attr(k[a]);else{if(a){if(!g)b.stateMarkerGraphic=g=i.renderer.circle(0,0,k[a].r).attr(k[a]).add(b.group);g.translate(this.plotX,this.plotY)}if(g)g[a?"show":"hide"]()}this.state=a}}};var mb=
function(){};mb.prototype={isCartesian:true,type:"line",pointClass:zc,pointAttrToOptions:{stroke:"lineColor","stroke-width":"lineWidth",fill:"fillColor",r:"radius"},init:function(a,b){var c,d;d=a.series.length;this.chart=a;b=this.setOptions(b);qa(this,{index:d,options:b,name:b.name||"Series "+(d+1),state:db,pointAttr:{},visible:b.visible!==false,selected:b.selected===true});d=b.events;for(c in d)Qa(this,c,d[c]);if(d&&d.click||b.point&&b.point.events&&b.point.events.click||b.allowPointSelect)a.runTrackerClick=
true;this.getColor();this.getSymbol();this.setData(b.data,false)},autoIncrement:function(){var a=this.options,b=this.xIncrement;b=y(b,a.pointStart,0);this.pointInterval=y(this.pointInterval,a.pointInterval,1);this.xIncrement=b+this.pointInterval;return b},cleanData:function(){var a=this.chart,b=this.data,c,d,e=a.smallestInterval,f,g;b.sort(function(i,k){return i.x-k.x});for(g=b.length-1;g>=0;g--)b[g-1]&&b[g-1].x==b[g].x&&b.splice(g-1,1);for(g=b.length-1;g>=0;g--)if(b[g-1]){f=b[g].x-b[g-1].x;if(d===
Ra||f<d){d=f;c=g}}if(e===Ra||d<e)a.smallestInterval=d;this.closestPoints=c},getSegments:function(){var a=-1,b=[],c=this.data;t(c,function(d,e){if(d.y===null){e>a+1&&b.push(c.slice(a+1,e));a=e}else e==c.length-1&&b.push(c.slice(a+1,e+1))});this.segments=b},setOptions:function(a){var b=this.chart.options.plotOptions;return ya(b[this.type],b.series,a)},getColor:function(){var a=this.chart.options.colors;this.color=this.options.color||a[Jb++]||"#0000ff";if(Jb>=a.length)Jb=0},getSymbol:function(){var a=
this.chart.options.symbols;this.symbol=this.options.marker.symbol||a[Yc++];if(Yc>=a.length)Yc=0},addPoint:function(a,b,c,d){var e=this.data,f=this.graph,g=this.area,i=this.chart;a=(new this.pointClass).init(this,a);bc(d,i);if(f&&c)f.shift=c;if(g){g.shift=c;g.isArea=true}b=y(b,true);e.push(a);c&&e[0].remove(false);this.isDirty=true;b&&i.redraw()},setData:function(a,b){var c=this,d=c.data,e=c.initialColor,f=c.chart,g=d&&d.length||0;c.xIncrement=null;if(J(e))Jb=e;for(a=jc(nc(a||[]),function(i){return(new c.pointClass).init(c,
i)});g--;)d[g].destroy();c.data=a;c.cleanData();c.getSegments();c.isDirty=true;f.isDirtyBox=true;y(b,true)&&f.redraw(false)},remove:function(a,b){var c=this,d=c.chart;a=y(a,true);if(!c.isRemoving){c.isRemoving=true;La(c,"remove",null,function(){c.destroy();d.isDirtyLegend=d.isDirtyBox=true;a&&d.redraw(b)})}c.isRemoving=false},translate:function(){for(var a=this.chart,b=this.options.stacking,c=this.xAxis.categories,d=this.yAxis,e=this.data,f=e.length;f--;){var g=e[f],i=g.x,k=g.y,j=g.low,n=d.stacks[(k<
0?"-":"")+this.stackKey];g.plotX=this.xAxis.translate(i);if(b&&this.visible&&n&&n[i]){j=n[i];i=j.total;j.cum=j=j.cum-k;k=j+k;if(b=="percent"){j=i?j*100/i:0;k=i?k*100/i:0}g.percentage=i?g.y*100/i:0;g.stackTotal=i}if(J(j))g.yBottom=d.translate(j,0,1);if(k!==null)g.plotY=d.translate(k,0,1);g.clientX=a.inverted?a.plotHeight-g.plotX:g.plotX;g.category=c&&c[g.x]!==Ra?c[g.x]:g.x}},setTooltipPoints:function(a){var b=this.chart,c=b.inverted,d=[],e=fa((c?b.plotTop:b.plotLeft)+b.plotSizeX),f,g,i=[];if(a)this.tooltipPoints=
null;t(this.segments,function(k){d=d.concat(k)});if(this.xAxis&&this.xAxis.reversed)d=d.reverse();t(d,function(k,j){f=d[j-1]?d[j-1].high+1:0;for(g=k.high=d[j+1]?ob((k.plotX+(d[j+1]?d[j+1].plotX:e))/2):e;f<=g;)i[c?e-f++:f++]=k});this.tooltipPoints=i},onMouseOver:function(){var a=this.chart,b=a.hoverSeries;if(!(!Ib&&a.mouseIsDown)){b&&b!=this&&b.onMouseOut();this.options.events.mouseOver&&La(this,"mouseOver");this.tracker&&this.tracker.toFront();this.setState(yb);a.hoverSeries=this}},onMouseOut:function(){var a=
this.options,b=this.chart,c=b.tooltip,d=b.hoverPoint;d&&d.onMouseOut();this&&a.events.mouseOut&&La(this,"mouseOut");c&&!a.stickyTracking&&c.hide();this.setState();b.hoverSeries=null},animate:function(a){var b=this.chart,c=this.clipRect,d=this.options.animation;if(d&&!Eb(d))d={};if(a){if(!c.isAnimating){c.attr("width",0);c.isAnimating=true}}else{c.animate({width:b.plotSizeX},d);this.animate=null}},drawPoints:function(){var a,b=this.data,c=this.chart,d,e,f,g,i,k;if(this.options.marker.enabled)for(f=
b.length;f--;){g=b[f];d=g.plotX;e=g.plotY;k=g.graphic;if(e!==Ra&&!isNaN(e)){a=g.pointAttr[g.selected?"select":db];i=a.r;if(k)k.animate({x:d,y:e,r:i});else g.graphic=c.renderer.symbol(y(g.marker&&g.marker.symbol,this.symbol),d,e,i).attr(a).add(this.group)}}},convertAttribs:function(a,b,c,d){var e=this.pointAttrToOptions,f,g,i={};a=a||{};b=b||{};c=c||{};d=d||{};for(f in e){g=e[f];i[f]=y(a[g],b[f],c[f],d[f])}return i},getAttribs:function(){var a=this,b=wb[a.type].marker?a.options.marker:a.options,c=
b.states,d=c[yb],e,f=a.color,g={stroke:f,fill:f},i=a.data,k=[],j,n=a.pointAttrToOptions;if(a.options.marker){d.radius=d.radius||b.radius+2;d.lineWidth=d.lineWidth||b.lineWidth+1}else d.color=d.color||Ub(d.color||f).brighten(d.brightness).get();k[db]=a.convertAttribs(b,g);t([yb,"select"],function(F){k[F]=a.convertAttribs(c[F],k[db])});a.pointAttr=k;for(f=i.length;f--;){g=i[f];if((b=g.options&&g.options.marker||g.options)&&b.enabled===false)b.radius=0;e=false;if(g.options)for(var z in n)if(J(b[n[z]]))e=
true;if(e){j=[];c=b.states||{};e=c[yb]=c[yb]||{};if(!a.options.marker)e.color=Ub(e.color||g.options.color).brighten(e.brightness||d.brightness).get();j[db]=a.convertAttribs(b,k[db]);j[yb]=a.convertAttribs(c[yb],k[yb],j[db]);j.select=a.convertAttribs(c.select,k.select,j[db])}else j=k;g.pointAttr=j}},destroy:function(){var a=this,b=a.chart,c=/\/5[0-9\.]+ (Safari|Mobile)\//.test(xc),d,e;Cb(a);a.legendItem&&a.chart.legend.destroyItem(a);t(a.data,function(f){f.destroy()});t(["area","graph","dataLabelsGroup",
"group","tracker"],function(f){if(a[f]){d=c&&f=="group"?"hide":"destroy";a[f][d]()}});if(b.hoverSeries==a)b.hoverSeries=null;mc(b.series,a);for(e in a)delete a[e]},drawDataLabels:function(){if(this.options.dataLabels.enabled){var a,b,c=this.data,d=this.options.dataLabels,e,f=this.dataLabelsGroup,g=this.chart,i=g.inverted,k=this.type,j;if(!f)f=this.dataLabelsGroup=g.renderer.g(Zb+"data-labels").attr({visibility:this.visible?Bb:vb,zIndex:5}).translate(g.plotLeft,g.plotTop).add();j=d.color;if(j=="auto")j=
null;d.style.color=y(j,this.color);t(c,function(n){var z=n.barX;z=z&&z+n.barW/2||n.plotX||-999;var F=y(n.plotY,-999),W=n.dataLabel,ca=d.align;e=n.getDataLabelText();a=(i?g.plotWidth-F:z)+d.x;b=(i?g.plotHeight-z:F)+d.y;if(k=="column")a+={left:-1,right:1}[ca]*n.barW/2||0;if(W)W.animate({x:a,y:b});else if(J(e))W=n.dataLabel=g.renderer.text(e,a,b).attr({align:ca,rotation:d.rotation,zIndex:1}).css(d.style).add(f);i&&!d.y&&W.attr({y:b+parseInt(W.styles.lineHeight)*0.9-W.getBBox().height/2})})}},drawGraph:function(){var a=
this,b=a.options,c=a.graph,d=[],e,f=a.area,g=a.group,i=b.lineColor||a.color,k=b.lineWidth,j=b.dashStyle,n,z=a.chart.renderer,F=a.yAxis.getThreshold(b.threshold||0),W=/^area/.test(a.type),ca=[],ka=[];t(a.segments,function(v){n=[];t(v,function(U,R){if(a.getPointSpline)n.push.apply(n,a.getPointSpline(v,U,R));else{n.push(R?Da:Za);R&&b.step&&n.push(U.plotX,v[R-1].plotY);n.push(U.plotX,U.plotY)}});if(v.length>1)d=d.concat(n);else ca.push(v[0]);if(W){var I=[],da,X=n.length;for(da=0;da<X;da++)I.push(n[da]);
X==3&&I.push(Da,n[1],n[2]);if(b.stacking&&a.type!="areaspline")for(da=v.length-1;da>=0;da--)I.push(v[da].plotX,v[da].yBottom);else I.push(Da,v[v.length-1].plotX,F,Da,v[0].plotX,F);ka=ka.concat(I)}});a.graphPath=d;a.singlePoints=ca;if(W){e=y(b.fillColor,Ub(a.color).setOpacity(b.fillOpacity||0.75).get());if(f)f.animate({d:ka});else a.area=a.chart.renderer.path(ka).attr({fill:e}).add(g)}if(c)c.animate({d:d});else if(k){c={stroke:i,"stroke-width":k};if(j)c.dashstyle=j;a.graph=z.path(d).attr(c).add(g).shadow(b.shadow)}},
render:function(){var a=this,b=a.chart,c,d,e=a.options,f=e.animation,g=f&&a.animate;f=g?f&&f.duration||500:0;var i=a.clipRect;d=b.renderer;if(!i){i=a.clipRect=!b.hasRendered&&b.clipRect?b.clipRect:d.clipRect(0,0,b.plotSizeX,b.plotSizeY);if(!b.clipRect)b.clipRect=i}if(!a.group){c=a.group=d.g("series");if(b.inverted){d=function(){c.attr({width:b.plotWidth,height:b.plotHeight}).invert()};d();Qa(b,"resize",d)}c.clip(a.clipRect).attr({visibility:a.visible?Bb:vb,zIndex:e.zIndex}).translate(b.plotLeft,b.plotTop).add(b.seriesGroup)}a.drawDataLabels();
g&&a.animate(true);a.getAttribs();a.drawGraph&&a.drawGraph();a.drawPoints();a.options.enableMouseTracking!==false&&a.drawTracker();g&&a.animate();setTimeout(function(){i.isAnimating=false;if((c=a.group)&&i!=b.clipRect&&i.renderer){c.clip(a.clipRect=b.clipRect);i.destroy()}},f);a.isDirty=false},redraw:function(){var a=this.chart,b=this.group;if(b){a.inverted&&b.attr({width:a.plotWidth,height:a.plotHeight});b.animate({translateX:a.plotLeft,translateY:a.plotTop})}this.translate();this.setTooltipPoints(true);
this.render()},setState:function(a){var b=this.options,c=this.graph,d=b.states;b=b.lineWidth;a=a||db;if(this.state!=a){this.state=a;if(!(d[a]&&d[a].enabled===false)){if(a)b=d[a].lineWidth||b+1;if(c&&!c.dashstyle)c.attr({"stroke-width":b},a?0:500)}}},setVisible:function(a,b){var c=this.chart,d=this.legendItem,e=this.group,f=this.tracker,g=this.dataLabelsGroup,i,k=this.data,j=c.options.chart.ignoreHiddenSeries;i=this.visible;i=(this.visible=a=a===Ra?!i:a)?"show":"hide";e&&e[i]();if(f)f[i]();else for(e=
k.length;e--;){f=k[e];f.tracker&&f.tracker[i]()}g&&g[i]();d&&c.legend.colorizeItem(this,a);this.isDirty=true;this.options.stacking&&t(c.series,function(n){if(n.options.stacking&&n.visible)n.isDirty=true});if(j)c.isDirtyBox=true;b!==false&&c.redraw();La(this,i)},show:function(){this.setVisible(true)},hide:function(){this.setVisible(false)},select:function(a){this.selected=a=a===Ra?!this.selected:a;if(this.checkbox)this.checkbox.checked=a;La(this,a?"select":"unselect")},drawTracker:function(){var a=
this,b=a.options,c=[].concat(a.graphPath),d=c.length,e=a.chart,f=e.options.tooltip.snap,g=a.tracker,i=b.cursor;i=i&&{cursor:i};var k=a.singlePoints,j;if(d)for(j=d+1;j--;){c[j]==Za&&c.splice(j+1,0,c[j+1]-f,c[j+2],Da);if(j&&c[j]==Za||j==d)c.splice(j,0,Da,c[j-2]+f,c[j-1])}for(j=0;j<k.length;j++){d=k[j];c.push(Za,d.plotX-f,d.plotY,Da,d.plotX+f,d.plotY)}if(g)g.attr({d:c});else a.tracker=e.renderer.path(c).attr({isTracker:true,stroke:Vd,fill:nb,"stroke-width":b.lineWidth+2*f,visibility:a.visible?Bb:vb,
zIndex:1}).on(Ib?"touchstart":"mouseover",function(){e.hoverSeries!=a&&a.onMouseOver()}).on("mouseout",function(){b.stickyTracking||a.onMouseOut()}).css(i).add(e.trackerGroup)}};Ma=xb(mb);ub.line=Ma;Ma=xb(mb,{type:"area"});ub.area=Ma;Ma=xb(mb,{type:"spline",getPointSpline:function(a,b,c){var d=b.plotX,e=b.plotY,f=a[c-1],g=a[c+1],i,k,j,n;if(c&&c<a.length-1){a=f.plotY;j=g.plotX;g=g.plotY;var z;i=(1.5*d+f.plotX)/2.5;k=(1.5*e+a)/2.5;j=(1.5*d+j)/2.5;n=(1.5*e+g)/2.5;z=(n-k)*(j-d)/(j-i)+e-n;k+=z;n+=z;if(k>
a&&k>e){k=Ca(a,e);n=2*e-k}else if(k<a&&k<e){k=pb(a,e);n=2*e-k}if(n>g&&n>e){n=Ca(g,e);k=2*e-n}else if(n<g&&n<e){n=pb(g,e);k=2*e-n}b.rightContX=j;b.rightContY=n}if(c){b=["C",f.rightContX||f.plotX,f.rightContY||f.plotY,i||d,k||e,d,e];f.rightContX=f.rightContY=null}else b=[Za,d,e];return b}});ub.spline=Ma;Ma=xb(Ma,{type:"areaspline"});ub.areaspline=Ma;var ad=xb(mb,{type:"column",pointAttrToOptions:{stroke:"borderColor","stroke-width":"borderWidth",fill:"color",r:"borderRadius"},init:function(){mb.prototype.init.apply(this,
arguments);var a=this,b=a.chart;b.hasColumn=true;b.hasRendered&&t(b.series,function(c){if(c.type==a.type)c.isDirty=true})},translate:function(){var a=this,b=a.chart,c=0,d=a.xAxis.reversed,e=a.xAxis.categories,f={},g,i;mb.prototype.translate.apply(a);t(b.series,function(I){if(I.type==a.type){if(I.options.stacking){g=I.stackKey;if(f[g]===Ra)f[g]=c++;i=f[g]}else if(I.visible)i=c++;I.columnIndex=i}});var k=a.options,j=a.data,n=a.closestPoints;b=cb(j[1]?j[n].plotX-j[n-1].plotX:b.plotSizeX/(e?e.length:
1));e=b*k.groupPadding;n=(b-2*e)/c;var z=k.pointWidth,F=J(z)?(n-z)/2:n*k.pointPadding,W=Ca(y(z,n-2*F),1),ca=F+(e+((d?c-a.columnIndex:a.columnIndex)||0)*n-b/2)*(d?-1:1),ka=a.yAxis.getThreshold(k.threshold||0),v=y(k.minPointLength,5);t(j,function(I){var da=I.plotY,X=I.yBottom||ka,U=I.plotX+ca,R=fd(pb(da,X)),Ha=fd(Ca(da,X)-R),Ya;if(cb(Ha)<v){if(v){Ha=v;R=cb(R-ka)>v?X-v:ka-(da<=ka?v:0)}Ya=R-3}qa(I,{barX:U,barY:R,barW:W,barH:Ha});I.shapeType="rect";I.shapeArgs={x:U,y:R,width:W,height:Ha,r:k.borderRadius};
I.trackerArgs=J(Ya)&&ya(I.shapeArgs,{height:Ca(6,Ha+3),y:Ya})})},getSymbol:function(){},drawGraph:function(){},drawPoints:function(){var a=this,b=a.options,c=a.chart.renderer,d,e;t(a.data,function(f){var g=f.plotY;if(g!==Ra&&!isNaN(g)){d=f.graphic;e=f.shapeArgs;if(d){Sc(d);d.animate(e)}else f.graphic=c[f.shapeType](e).attr(f.pointAttr[f.selected?"select":db]).add(a.group).shadow(b.shadow)}})},drawTracker:function(){var a=this,b=a.chart,c=b.renderer,d,e,f=+new Date,g=a.options.cursor,i=g&&{cursor:g},
k;t(a.data,function(j){e=j.tracker;d=j.trackerArgs||j.shapeArgs;if(j.y!==null)if(e)e.attr(d);else j.tracker=c[j.shapeType](d).attr({isTracker:f,fill:Vd,visibility:a.visible?Bb:vb,zIndex:1}).on(Ib?"touchstart":"mouseover",function(n){k=n.relatedTarget||n.fromElement;b.hoverSeries!=a&&za(k,"isTracker")!=f&&a.onMouseOver();j.onMouseOver()}).on("mouseout",function(n){if(!a.options.stickyTracking){k=n.relatedTarget||n.toElement;za(k,"isTracker")!=f&&a.onMouseOut()}}).css(i).add(b.trackerGroup)})},animate:function(a){var b=
this,c=b.data;if(!a){t(c,function(d){var e=d.graphic;if(e){e.attr({height:0,y:b.yAxis.translate(0,0,1)});e.animate({height:d.barH,y:d.barY},b.options.animation)}});b.animate=null}},remove:function(){var a=this,b=a.chart;b.hasRendered&&t(b.series,function(c){if(c.type==a.type)c.isDirty=true});mb.prototype.remove.apply(a,arguments)}});ub.column=ad;Ma=xb(ad,{type:"bar",init:function(a){a.inverted=this.inverted=true;ad.prototype.init.apply(this,arguments)}});ub.bar=Ma;Ma=xb(mb,{type:"scatter",translate:function(){var a=
this;mb.prototype.translate.apply(a);t(a.data,function(b){b.shapeType="circle";b.shapeArgs={x:b.plotX,y:b.plotY,r:a.chart.options.tooltip.snap}})},drawTracker:function(){var a=this,b=a.options.cursor,c=b&&{cursor:b},d;t(a.data,function(e){(d=e.graphic)&&d.attr({isTracker:true}).on("mouseover",function(){a.onMouseOver();e.onMouseOver()}).on("mouseout",function(){a.options.stickyTracking||a.onMouseOut()}).css(c)})},cleanData:function(){}});ub.scatter=Ma;Ma=xb(zc,{init:function(){zc.prototype.init.apply(this,
arguments);var a=this,b;qa(a,{visible:a.visible!==false,name:y(a.name,"Slice")});b=function(){a.slice()};Qa(a,"select",b);Qa(a,"unselect",b);return a},setVisible:function(a){var b=this.series.chart,c=this.tracker,d=this.dataLabel,e=this.connector,f;f=(this.visible=a=a===Ra?!this.visible:a)?"show":"hide";this.group[f]();c&&c[f]();d&&d[f]();e&&e[f]();this.legendItem&&b.legend.colorizeItem(this,a)},slice:function(a,b,c){var d=this.series.chart,e=this.slicedTranslation;bc(c,d);y(b,true);a=this.sliced=
J(a)?a:!this.sliced;this.group.animate({translateX:a?e[0]:d.plotLeft,translateY:a?e[1]:d.plotTop})}});Ma=xb(mb,{type:"pie",isCartesian:false,pointClass:Ma,pointAttrToOptions:{stroke:"borderColor","stroke-width":"borderWidth",fill:"color"},getColor:function(){this.initialColor=Jb},animate:function(){var a=this;t(a.data,function(b){var c=b.graphic;b=b.shapeArgs;var d=-Tb/2;if(c){c.attr({r:0,start:d,end:d});c.animate({r:b.r,start:b.start,end:b.end},a.options.animation)}});a.animate=null},translate:function(){var a=
0,b=-0.25,c=this.options,d=c.slicedOffset,e=d+c.borderWidth,f=c.center,g=this.chart,i=g.plotWidth,k=g.plotHeight,j,n,z,F=this.data,W=2*Tb,ca,ka=pb(i,k),v,I,da,X=c.dataLabels.distance;f.push(c.size,c.innerSize||0);f=jc(f,function(U,R){return(v=/%$/.test(U))?[i,k,ka,ka][R]*oa(U)/100:U});this.getX=function(U,R){z=Ua.asin((U-f[1])/(f[2]/2+X));return f[0]+(R?-1:1)*kb(z)*(f[2]/2+X)};this.center=f;t(F,function(U){a+=U.y});t(F,function(U){ca=a?U.y/a:0;j=fa(b*W*1E3)/1E3;b+=ca;n=fa(b*W*1E3)/1E3;U.shapeType=
"arc";U.shapeArgs={x:f[0],y:f[1],r:f[2]/2,innerR:f[3]/2,start:j,end:n};z=(n+j)/2;U.slicedTranslation=jc([kb(z)*d+g.plotLeft,zb(z)*d+g.plotTop],fa);I=kb(z)*f[2]/2;da=zb(z)*f[2]/2;U.tooltipPos=[f[0]+I*0.7,f[1]+da*0.7];U.labelPos=[f[0]+I+kb(z)*X,f[1]+da+zb(z)*X,f[0]+I+kb(z)*e,f[1]+da+zb(z)*e,f[0]+I,f[1]+da,X<0?"center":z<W/4?"left":"right",z];U.percentage=ca*100;U.total=a});this.setTooltipPoints()},render:function(){this.getAttribs();this.drawPoints();this.options.enableMouseTracking!==false&&this.drawTracker();
this.drawDataLabels();this.options.animation&&this.animate&&this.animate();this.isDirty=false},drawPoints:function(){var a=this.chart,b=a.renderer,c,d,e,f;t(this.data,function(g){d=g.graphic;f=g.shapeArgs;e=g.group;if(!e)e=g.group=b.g("point").attr({zIndex:5}).add();c=g.sliced?g.slicedTranslation:[a.plotLeft,a.plotTop];e.translate(c[0],c[1]);if(d)d.animate(f);else g.graphic=b.arc(f).attr(qa(g.pointAttr[db],{"stroke-linejoin":"round"})).add(g.group);g.visible===false&&g.setVisible(false)})},drawDataLabels:function(){var a=
this.data,b,c=this.chart,d=this.options.dataLabels,e=y(d.connectorPadding,10),f=y(d.connectorWidth,1),g,i,k=d.distance>0,j,n,z=this.center[1],F=[[],[],[],[]],W,ca,ka,v,I,da,X,U=4,R;mb.prototype.drawDataLabels.apply(this);t(a,function(Ha){var Ya=Ha.labelPos[7];F[Ya<0?0:Ya<Tb/2?1:Ya<Tb?2:3].push(Ha)});F[1].reverse();F[3].reverse();for(X=function(Ha,Ya){return Ha.y>Ya.y};U--;){a=0;b=[].concat(F[U]);b.sort(X);for(R=b.length;R--;)b[R].rank=R;for(v=0;v<2;v++){n=(da=U%3)?9999:-9999;I=da?-1:1;for(R=0;R<F[U].length;R++){b=
F[U][R];if(g=b.dataLabel){i=b.labelPos;ka=Bb;W=i[0];ca=i[1];j||(j=g&&g.getBBox().height);if(k)if(v&&b.rank<a)ka=vb;else if(!da&&ca<n+j||da&&ca>n-j){ca=n+I*j;W=this.getX(ca,U>1);if(!da&&ca+j>z||da&&ca-j<z)if(v)ka=vb;else a++}if(b.visible===false)ka=vb;if(ka==Bb)n=ca;if(v){g.attr({visibility:ka,align:i[6]})[g.moved?"animate":"attr"]({x:W+d.x+({left:e,right:-e}[i[6]]||0),y:ca+d.y});g.moved=true;if(k&&f){g=b.connector;i=[Za,W+(i[6]=="left"?5:-5),ca,Da,W,ca,Da,i[2],i[3],Da,i[4],i[5]];if(g){g.animate({d:i});
g.attr("visibility",ka)}else b.connector=g=this.chart.renderer.path(i).attr({"stroke-width":f,stroke:d.connectorColor||"#606060",visibility:ka,zIndex:3}).translate(c.plotLeft,c.plotTop).add()}}}}}}},drawTracker:ad.prototype.drawTracker,getSymbol:function(){}});ub.pie=Ma;ib.Highcharts={Chart:Hd,dateFormat:Mc,pathAnim:$c,getOptions:function(){return Sa},numberFormat:Gd,Point:zc,Color:Ub,Renderer:Qd,seriesTypes:ub,setOptions:function(a){Sa=ya(Sa,a);Bd();return Sa},Series:mb,addEvent:Qa,createElement:fb,
discardElement:Fc,css:Ia,each:t,extend:qa,map:jc,merge:ya,pick:y,extendClass:xb,version:"2.1.4"}})();
;/**/
var DATAVIZ = { };

(function($){
	
DATAVIZ.adapters = new Array();

DATAVIZ.adapters['jquery.jqplot'] = {
	render : function(data_object, type, container_id) {
		$.getScript('/sites/all/modules/custom/energy_data_viz_api/adapters/DATAVIZ.jqplot.js', function(data, textStatus){
			DATAVIZ.jqplot.render(data_object, type, container_id);
			return true;
		});
	}
};

DATAVIZ.adapters['jquery.jit'] = {
	render : function(data_object, type, container_id) {
		$.getScript('/sites/all/modules/custom/energy_data_viz_api/adapters/DATAVIZ.jit.js', function(data, textStatus){
			DATAVIZ.jit.render(data_object, type, container_id);
			return true;
		});
	}
};

DATAVIZ.adapters['jquery.highcharts'] = {
	render : function(data_object, type, container_id){
		$.getScript('/sites/all/modules/custom/energy_data_viz_api/adapters/DATAVIZ.highcharts.js', function(data, textStatus){
			DATAVIZ.highcharts.render(data_object, type, container_id);
			return true;
		});
	}
};

DATAVIZ.render = function(adapter, data_object, type, container_id) {
	//Load the obect whether from file or passed into the function
	if(data_object.constructor == String) {
		var filepath = data_object;
		$.getJSON(filepath, function(data){
			//Call the render function of the passed in adapter object
			adapter.render(data, type, container_id);
		});
	} else {
		//Call the render function of the passed in adapter object
		adapter.render(data_object, type, container_id);
	}  
};

// $(document).ready(function(){
// 	
// 	var line_data_object = {
// 		series : [{seriesName: "series1", data:[[1, 2],[3,5.12],[5,13.1],[7,33.6],[9,85.9],[11,219.9]] }],
// 		options :
// 			{ title : "A test for jqplot adapter",
// 			  description : "test description" }
// 	};
// 	
// 	var bar_data_object_external_file = 'http://doe.local/sites/all/modules/custom/energy_data_viz_api/doe_example_bar_data.js';
// 	
// 	var doe_data_object_external_file = 'http://doe.local/sites/all/modules/custom/energy_data_viz_api/doe_rd_projects_funding_fy2002.js';
// 	
// 	
// 	
// 	var line_container_id = 'jqplot-line';
// 	var bar_container_id = 'jqplot-bar';
// 	var doechart_container_id = 'jqplot-doe';
// 
// 	DATAVIZ.render(DATAVIZ.adapters['jqplot'], line_data_object, 'line', line_container_id);
// 	DATAVIZ.render(DATAVIZ.adapters['jqplot'], bar_data_object_external_file, 'bar', bar_container_id);
// 	DATAVIZ.render(DATAVIZ.adapters['jqplot'], doe_data_object_external_file, 'pie', doechart_container_id);
// 	
// 	line_container_id = 'jit-line';
// 	bar_container_id = 'jit-bar';
// 	doechart_container_id = 'jit-doe';
// 	
// 	DATAVIZ.render(DATAVIZ.adapters['jit'], line_data_object, 'line', line_container_id);
// 	DATAVIZ.render(DATAVIZ.adapters['jit'], bar_data_object_external_file, 'bar', bar_container_id);
// 	DATAVIZ.render(DATAVIZ.adapters['jit'], doe_data_object_external_file, 'pie', doechart_container_id);
// 	
// 	line_container_id = 'highcharts-line';
// 	bar_container_id = 'highcharts-bar';
// 	doechart_container_id = 'highcharts-doe';
// 	
// 	DATAVIZ.render(DATAVIZ.adapters['highcharts'], line_data_object, 'line', line_container_id);
// 	DATAVIZ.render(DATAVIZ.adapters['highcharts'], bar_data_object_external_file, 'bar', bar_container_id);
// 	DATAVIZ.render(DATAVIZ.adapters['highcharts'], doe_data_object_external_file, 'pie', doechart_container_id);
// 	
// });

})(jQuery);;/**/
