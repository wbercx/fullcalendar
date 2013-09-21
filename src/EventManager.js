
fc.sourceNormalizers = [];
fc.sourceFetchers = [];

var ajaxDefaults = {
	dataType: 'json',
	cache: false
};

var eventGUID = 1;


function EventManager(options) { // assumed to be a calendar
	var t = this;
	
	
	// exports
	t.isFetchNeeded = isFetchNeeded;
	t.fetchEvents = fetchEvents;
	t.addEventSource = addEventSource;
	t.removeEventSource = removeEventSource;
	t.updateEvent = updateEvent;
	t.renderEvent = renderEvent;
	t.removeEvents = removeEvents;
	t.clientEvents = clientEvents;
	
	
	// imports
	var trigger = t.trigger;
	var getView = t.getView;
	var reportEvents = t.reportEvents;
	var getEventEnd = t.getEventEnd;
	
	
	// locals
	var stickySource = { events: [] };
	var sources = [ stickySource ];
	var rangeStart, rangeEnd;
	var currentFetchID = 0;
	var pendingSourceCnt = 0;
	var loadingLevel = 0;
	var cache = [];



	var _sources = options.eventSources || [];

	if (options.events) {
		_sources.push(options.events);
	}
	
	for (var i=0; i<_sources.length; i++) {
		_addEventSource(_sources[i]);
	}
	
	
	
	/* Fetching
	-----------------------------------------------------------------------------*/
	
	
	function isFetchNeeded(start, end) {
		return !rangeStart || start < rangeStart || end > rangeEnd;
	}
	
	
	function fetchEvents(start, end) {
		rangeStart = start;
		rangeEnd = end;
		cache = [];
		var fetchID = ++currentFetchID;
		var len = sources.length;
		pendingSourceCnt = len;
		for (var i=0; i<len; i++) {
			fetchEventSource(sources[i], fetchID);
		}
	}
	
	
	function fetchEventSource(source, fetchID) {
		_fetchEventSource(source, function(events) {
			if (fetchID == currentFetchID) {

				if (events) {
					for (var i=0; i<events.length; i++) {
						var event = buildEvent(events[i], source);
						if (event) {
							cache.push(event);
						}
					}
				}

				pendingSourceCnt--;
				if (!pendingSourceCnt) {
					reportEvents(cache);
				}
			}
		});
	}
	
	
	function _fetchEventSource(source, callback) {
		var i;
		var fetchers = fc.sourceFetchers;
		var realRangeStart = t.realMoment(rangeStart);
		var realRangeEnd = t.realMoment(rangeEnd);
		var res;

		for (i=0; i<fetchers.length; i++) {
			res = fetchers[i].call(t, source, realRangeStart.clone(), realRangeEnd.clone(), callback);
			// ^ clone moments in case they are modified. we need them for later

			if (res === true) {
				// the fetcher is in charge. made its own async request
				return;
			}
			else if (typeof res == 'object') {
				// the fetcher returned a new source. process it
				_fetchEventSource(res, callback);
				return;
			}
		}

		var events = source.events;
		if (events) {
			if ($.isFunction(events)) {
				pushLoading();
				events(realRangeStart, realRangeEnd, function(events) {
					callback(events);
					popLoading();
				});
			}
			else if ($.isArray(events)) {
				callback(events);
			}
			else {
				callback();
			}
		}else{
			var url = source.url;
			if (url) {
				var success = source.success;
				var error = source.error;
				var complete = source.complete;

				// retrieve any outbound GET/POST $.ajax data from the options
				var customData;
				if ($.isFunction(source.data)) {
					// supplied as a function that returns a key/value object
					customData = source.data();
				}
				else {
					// supplied as a straight key/value object
					customData = source.data;
				}

				// use a copy of the custom data so we can modify the parameters
				// and not affect the passed-in object.
				var data = $.extend({}, customData || {});

				var startParam = firstDefined(source.startParam, options.startParam);
				var endParam = firstDefined(source.endParam, options.endParam);
				var timezoneParam = firstDefined(source.timezoneParam, options.timezoneParam);

				var formatStr = 'YYYY-MM-DD';
				if (options.timezone == 'local' || options.timezone == 'UTC') {
					formatStr += 'THH:mm:ssZ';
				}

				if (options.timezone && options.timezone != 'local') {
					data[timezoneParam] = options.timezone;
				}

				if (startParam) {
					data[startParam] = realRangeStart.format(formatStr);
				}
				if (endParam) {
					data[endParam] = realRangeEnd.format(formatStr);
				}

				pushLoading();
				$.ajax($.extend({}, ajaxDefaults, source, {
					data: data,
					success: function(events) {
						events = events || [];
						var res = applyAll(success, this, arguments);
						if ($.isArray(res)) {
							events = res;
						}
						callback(events);
					},
					error: function() {
						applyAll(error, this, arguments);
						callback();
					},
					complete: function() {
						applyAll(complete, this, arguments);
						popLoading();
					}
				}));
			}else{
				callback();
			}
		}
	}
	
	
	
	/* Sources
	-----------------------------------------------------------------------------*/
	

	function addEventSource(source) {
		source = _addEventSource(source);
		if (source) {
			pendingSourceCnt++;
			fetchEventSource(source, currentFetchID); // will eventually call reportEvents
		}
	}
	
	
	function _addEventSource(source) {
		if ($.isFunction(source) || $.isArray(source)) {
			source = { events: source };
		}
		else if (typeof source == 'string') {
			source = { url: source };
		}
		if (typeof source == 'object') {
			normalizeSource(source);
			sources.push(source);
			return source;
		}
	}
	

	function removeEventSource(source) {
		sources = $.grep(sources, function(src) {
			return !isSourcesEqual(src, source);
		});
		// remove all client events from that source
		cache = $.grep(cache, function(e) {
			return !isSourcesEqual(e.source, source);
		});
		reportEvents(cache);
	}
	
	
	
	/* Manipulation
	-----------------------------------------------------------------------------*/


	var miscCopyableProps = [
		'title',
		'url',
		'allDay',
		'className',
		'editable',
		'color',
		'backgroundColor',
		'borderColor',
		'textColor'
	];
	
	
	function updateEvent(event) { // update an existing event
		var i;
		var e;
		var startDelta = event.start.diff(event._start);
		var endDelta = 0;
		var j;
		var prop;

		if (event.end !== undefined) {
			endDelta = event.end.diff(event._end || getEventEnd(event));
		}

		for (i=0; i<cache.length; i++) {
			e = cache[i];

			if (e._id == event._id && e != event) {

				e.start.add('ms', startDelta);

				if (event.end) {
					if (e.end) {
						e.end.add('ms', endDelta);
					}
					else {
						e.end = getEventEnd(e).add('ms', endDelta);
					}
				}
				else {
					delete e.end;
				}

				for (j=0; j<miscCopyableProps.length; j++) {
					prop = miscCopyableProps[j];

					if (event[prop] !== undefined) {
						e[prop] = event[prop];
					}
				}
			}
		}

		reportEvents(cache);
	}
	
	
	function renderEvent(eventData, stick) {
		var event = buildEvent(eventData);
		if (event) {
			if (!event.source) {
				if (stick) {
					stickySource.events.push(event);
					event.source = stickySource;
				}
				cache.push(event);
			}
			reportEvents(cache);
		}
	}
	
	
	function removeEvents(filter) {
		if (!filter) { // remove all
			cache = [];
			// clear all array sources
			for (var i=0; i<sources.length; i++) {
				if ($.isArray(sources[i].events)) {
					sources[i].events = [];
				}
			}
		}else{
			if (!$.isFunction(filter)) { // an event ID
				var id = filter + '';
				filter = function(e) {
					return e._id == id;
				};
			}
			cache = $.grep(cache, filter, true);
			// remove events from array sources
			for (var i=0; i<sources.length; i++) {
				if ($.isArray(sources[i].events)) {
					sources[i].events = $.grep(sources[i].events, filter, true);
				}
			}
		}
		reportEvents(cache);
	}
	
	
	function clientEvents(filter) {
		if ($.isFunction(filter)) {
			return $.grep(cache, filter);
		}
		else if (filter) { // an event ID
			filter += '';
			return $.grep(cache, function(e) {
				return e._id == filter;
			});
		}
		return cache; // else, return all
	}
	
	
	
	/* Loading State
	-----------------------------------------------------------------------------*/
	
	
	function pushLoading() {
		if (!loadingLevel++) {
			trigger('loading', null, true, getView());
		}
	}
	
	
	function popLoading() {
		if (!--loadingLevel) {
			trigger('loading', null, false, getView());
		}
	}
	
	
	
	/* Event Normalization
	-----------------------------------------------------------------------------*/


	var simpleIsoRegex = /^\s*\d{4}-\d\d-\d\d$/;


	function buildEvent(data, source) {
		var out = {};
		var startInput = data.start || data.date;

		out.source = source || {};

		out._id = data._id || (data.id === undefined ? '_fc' + eventGUID++ : data.id + '');

		out.start = t.moment(startInput);
		if (!out.start.isValid()) {
			return;
		}
		out._start = out.start.clone();

		if (data.end !== undefined) {
			out.end = t.moment(data.end);
			if (!out.end.isValid()) {
				return;
			}
			out._end = out.end.clone();
		}

		if (data.allDay !== undefined) {
			out.allDay = data.allDay;
		}
		else {
			out.allDay =
				typeof startInput === 'string' &&
				simpleIsoRegex.test(startInput) &&
				(
					data.end === undefined ||
					typeof data.end === 'string' &&
					simpleIsoRegex.test(data.end)
				);
		}

		// TODO: change to plain string
		if (data.className) {
			if (typeof data.className == 'string') {
				out.className = data.className.split(/\s+/);
			}
		}
		else {
			out.className = [];
		}

		$.each(data, function(key, value) {
			if (!/start|date|end|allDay|className/.test(key)) {
				out[key] = value;
			}
		});

		if (options.eventDataTransform) {
			out = options.eventDataTransform(out);
		}
		if (source.eventDataTransform) {
			out = source.eventDataTransform(out);
		}

		return out;
	}
	
	
	
	/* Utils
	------------------------------------------------------------------------------*/
	
	
	function normalizeSource(source) {
		if (source.className) {
			// TODO: repeat code, same code for event classNames
			if (typeof source.className == 'string') {
				source.className = source.className.split(/\s+/);
			}
		}else{
			source.className = [];
		}
		var normalizers = fc.sourceNormalizers;
		for (var i=0; i<normalizers.length; i++) {
			normalizers[i].call(t, source);
		}
	}
	
	
	function isSourcesEqual(source1, source2) {
		return source1 && source2 && getSourcePrimitive(source1) == getSourcePrimitive(source2);
	}
	
	
	function getSourcePrimitive(source) {
		return ((typeof source == 'object') ? (source.events || source.url) : '') || source;
	}


}
