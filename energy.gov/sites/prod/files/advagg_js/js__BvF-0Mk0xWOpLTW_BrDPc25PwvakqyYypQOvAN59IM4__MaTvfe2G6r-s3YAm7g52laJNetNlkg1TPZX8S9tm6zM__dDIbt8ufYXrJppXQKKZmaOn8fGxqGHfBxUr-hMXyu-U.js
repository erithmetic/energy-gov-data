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
/**
 * @file
 * Some basic behaviors and utility functions for Views.
 */
(function ($) {

Drupal.Views = {};

/**
 * jQuery UI tabs, Views integration component
 */
Drupal.behaviors.viewsTabs = {
  attach: function (context) {
    if ($.viewsUi && $.viewsUi.tabs) {
      $('#views-tabset').once('views-processed').viewsTabs({
        selectedClass: 'active'
      });
    }

    $('a.views-remove-link').once('views-processed').click(function(event) {
      var id = $(this).attr('id').replace('views-remove-link-', '');
      $('#views-row-' + id).hide();
      $('#views-removed-' + id).attr('checked', true);
      event.preventDefault();
   });
  /**
    * Here is to handle display deletion
    * (checking in the hidden checkbox and hiding out the row)
    */
  $('a.display-remove-link')
    .addClass('display-processed')
    .click(function() {
      var id = $(this).attr('id').replace('display-remove-link-', '');
      $('#display-row-' + id).hide();
      $('#display-removed-' + id).attr('checked', true);
      return false;
  });
  }
};

/**
 * Helper function to parse a querystring.
 */
Drupal.Views.parseQueryString = function (query) {
  var args = {};
  var pos = query.indexOf('?');
  if (pos != -1) {
    query = query.substring(pos + 1);
  }
  var pairs = query.split('&');
  for(var i in pairs) {
    if (typeof(pairs[i]) == 'string') {
      var pair = pairs[i].split('=');
      // Ignore the 'q' path argument, if present.
      if (pair[0] != 'q' && pair[1]) {
        args[decodeURIComponent(pair[0].replace(/\+/g, ' '))] = decodeURIComponent(pair[1].replace(/\+/g, ' '));
      }
    }
  }
  return args;
};

/**
 * Helper function to return a view's arguments based on a path.
 */
Drupal.Views.parseViewArgs = function (href, viewPath) {
  var returnObj = {};
  var path = Drupal.Views.getPath(href);
  // Ensure we have a correct path.
  if (viewPath && path.substring(0, viewPath.length + 1) == viewPath + '/') {
    var args = decodeURIComponent(path.substring(viewPath.length + 1, path.length));
    returnObj.view_args = args;
    returnObj.view_path = path;
  }
  return returnObj;
};

/**
 * Strip off the protocol plus domain from an href.
 */
Drupal.Views.pathPortion = function (href) {
  // Remove e.g. http://example.com if present.
  var protocol = window.location.protocol;
  if (href.substring(0, protocol.length) == protocol) {
    // 2 is the length of the '//' that normally follows the protocol
    href = href.substring(href.indexOf('/', protocol.length + 2));
  }
  return href;
};

/**
 * Return the Drupal path portion of an href.
 */
Drupal.Views.getPath = function (href) {
  href = Drupal.Views.pathPortion(href);
  href = href.substring(Drupal.settings.basePath.length, href.length);
  // 3 is the length of the '?q=' added to the url without clean urls.
  if (href.substring(0, 3) == '?q=') {
    href = href.substring(3, href.length);
  }
  var chars = ['#', '?', '&'];
  for (i in chars) {
    if (href.indexOf(chars[i]) > -1) {
      href = href.substr(0, href.indexOf(chars[i]));
    }
  }
  return href;
};

})(jQuery);
;/**/
(function ($) {

/**
 * A progressbar object. Initialized with the given id. Must be inserted into
 * the DOM afterwards through progressBar.element.
 *
 * method is the function which will perform the HTTP request to get the
 * progress bar state. Either "GET" or "POST".
 *
 * e.g. pb = new progressBar('myProgressBar');
 *      some_element.appendChild(pb.element);
 */
Drupal.progressBar = function (id, updateCallback, method, errorCallback) {
  var pb = this;
  this.id = id;
  this.method = method || 'GET';
  this.updateCallback = updateCallback;
  this.errorCallback = errorCallback;

  // The WAI-ARIA setting aria-live="polite" will announce changes after users
  // have completed their current activity and not interrupt the screen reader.
  this.element = $('<div class="progress" aria-live="polite"></div>').attr('id', id);
  this.element.html('<div class="bar"><div class="filled"></div></div>' +
                    '<div class="percentage"></div>' +
                    '<div class="message">&nbsp;</div>');
};

/**
 * Set the percentage and status message for the progressbar.
 */
Drupal.progressBar.prototype.setProgress = function (percentage, message) {
  if (percentage >= 0 && percentage <= 100) {
    $('div.filled', this.element).css('width', percentage + '%');
    $('div.percentage', this.element).html(percentage + '%');
  }
  $('div.message', this.element).html(message);
  if (this.updateCallback) {
    this.updateCallback(percentage, message, this);
  }
};

/**
 * Start monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.startMonitoring = function (uri, delay) {
  this.delay = delay;
  this.uri = uri;
  this.sendPing();
};

/**
 * Stop monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.stopMonitoring = function () {
  clearTimeout(this.timer);
  // This allows monitoring to be stopped from within the callback.
  this.uri = null;
};

/**
 * Request progress data from server.
 */
Drupal.progressBar.prototype.sendPing = function () {
  if (this.timer) {
    clearTimeout(this.timer);
  }
  if (this.uri) {
    var pb = this;
    // When doing a post request, you need non-null data. Otherwise a
    // HTTP 411 or HTTP 406 (with Apache mod_security) error may result.
    $.ajax({
      type: this.method,
      url: this.uri,
      data: '',
      dataType: 'json',
      success: function (progress) {
        // Display errors.
        if (progress.status == 0) {
          pb.displayError(progress.data);
          return;
        }
        // Update display.
        pb.setProgress(progress.percentage, progress.message);
        // Schedule next timer.
        pb.timer = setTimeout(function () { pb.sendPing(); }, pb.delay);
      },
      error: function (xmlhttp) {
        pb.displayError(Drupal.ajaxError(xmlhttp, pb.uri));
      }
    });
  }
};

/**
 * Display errors on the page.
 */
Drupal.progressBar.prototype.displayError = function (string) {
  var error = $('<div class="messages error"></div>').html(string);
  $(this.element).before(error).hide();

  if (this.errorCallback) {
    this.errorCallback(this);
  }
};

})(jQuery);
;/**/
/**
 * @file
 * Handles AJAX fetching of views, including filter submission and response.
 */
(function ($) {

/**
 * Attaches the AJAX behavior to Views exposed filter forms and key View links.
 */
Drupal.behaviors.ViewsAjaxView = {};
Drupal.behaviors.ViewsAjaxView.attach = function() {
  if (Drupal.settings && Drupal.settings.views && Drupal.settings.views.ajaxViews) {
    $.each(Drupal.settings.views.ajaxViews, function(i, settings) {
      Drupal.views.instances[i] = new Drupal.views.ajaxView(settings);
    });
  }
};

Drupal.views = {};
Drupal.views.instances = {};

/**
 * Javascript object for a certain view.
 */
Drupal.views.ajaxView = function(settings) {
  var selector = '.view-dom-id-' + settings.view_dom_id;
  this.$view = $(selector);

  // Retrieve the path to use for views' ajax.
  var ajax_path = Drupal.settings.views.ajax_path;

  // If there are multiple views this might've ended up showing up multiple times.
  if (ajax_path.constructor.toString().indexOf("Array") != -1) {
    ajax_path = ajax_path[0];
  }

  // Check if there are any GET parameters to send to views.
  var queryString = window.location.search || '';
  if (queryString !== '') {
    // Remove the question mark and Drupal path component if any.
    var queryString = queryString.slice(1).replace(/q=[^&]+&?|&?render=[^&]+/, '');
    if (queryString !== '') {
      // If there is a '?' in ajax_path, clean url are on and & should be used to add parameters.
      queryString = ((/\?/.test(ajax_path)) ? '&' : '?') + queryString;
    }
  }

  this.element_settings = {
    url: ajax_path + queryString,
    submit: settings,
    setClick: true,
    event: 'click',
    selector: selector,
    progress: { type: 'throbber' }
  };

  this.settings = settings;

  // Add the ajax to exposed forms.
  this.$exposed_form = $('#views-exposed-form-'+ settings.view_name.replace(/_/g, '-') + '-' + settings.view_display_id.replace(/_/g, '-'));
  this.$exposed_form.once(jQuery.proxy(this.attachExposedFormAjax, this));

  // Add the ajax to pagers.
  this.$view
    // Don't attach to nested views. Doing so would attach multiple behaviors
    // to a given element.
    .filter(jQuery.proxy(this.filterNestedViews, this))
    .once(jQuery.proxy(this.attachPagerAjax, this));

  // Add a trigger to update this view specifically. In order to trigger a
  // refresh use the following code.
  //
  // @code
  // jQuery('.view-name').trigger('RefreshView');
  // @endcode
  // Add a trigger to update this view specifically.
  var self_settings = this.element_settings;
  self_settings.event = 'RefreshView';
  this.refreshViewAjax = new Drupal.ajax(this.selector, this.$view, self_settings);
};

Drupal.views.ajaxView.prototype.attachExposedFormAjax = function() {
  var button = $('input[type=submit], button[type=submit], input[type=image]', this.$exposed_form);
  button = button[0];

  this.exposedFormAjax = new Drupal.ajax($(button).attr('id'), button, this.element_settings);
};

Drupal.views.ajaxView.prototype.filterNestedViews= function() {
  // If there is at least one parent with a view class, this view
  // is nested (e.g., an attachment). Bail.
  return !this.$view.parents('.view').size();
};

/**
 * Attach the ajax behavior to each link.
 */
Drupal.views.ajaxView.prototype.attachPagerAjax = function() {
  this.$view.find('ul.pager > li > a, th.views-field a, .attachment .views-summary a')
  .each(jQuery.proxy(this.attachPagerLinkAjax, this));
};

/**
 * Attach the ajax behavior to a singe link.
 */
Drupal.views.ajaxView.prototype.attachPagerLinkAjax = function(id, link) {
  var $link = $(link);
  var viewData = {};
  var href = $link.attr('href');
  // Construct an object using the settings defaults and then overriding
  // with data specific to the link.
  $.extend(
    viewData,
    this.settings,
    Drupal.Views.parseQueryString(href),
    // Extract argument data from the URL.
    Drupal.Views.parseViewArgs(href, this.settings.view_base_path)
  );

  // For anchor tags, these will go to the target of the anchor rather
  // than the usual location.
  $.extend(viewData, Drupal.Views.parseViewArgs(href, this.settings.view_base_path));

  this.element_settings.submit = viewData;
  this.pagerAjax = new Drupal.ajax(false, $link, this.element_settings);
};

Drupal.ajax.prototype.commands.viewsScrollTop = function (ajax, response, status) {
  // Scroll to the top of the view. This will allow users
  // to browse newly loaded content after e.g. clicking a pager
  // link.
  var offset = $(response.selector).offset();
  // We can't guarantee that the scrollable object should be
  // the body, as the view could be embedded in something
  // more complex such as a modal popup. Recurse up the DOM
  // and scroll the first element that has a non-zero top.
  var scrollTarget = response.selector;
  while ($(scrollTarget).scrollTop() == 0 && $(scrollTarget).parent()) {
    scrollTarget = $(scrollTarget).parent();
  }
  // Only scroll upward
  if (offset.top - 10 < $(scrollTarget).scrollTop()) {
    $(scrollTarget).animate({scrollTop: (offset.top - 10)}, 500);
  }
};

})(jQuery);
;/**/
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
