/*!
 * <%= meta.title %> v<%= meta.version %> Google Calendar Plugin
 * Docs & License: <%= meta.homepage %>
 * (c) <%= meta.copyright %>
 */
 
(function($) { // TODO: deal with moment dependency and UMD


var fc = $.fullCalendar;
var applyAll = fc.applyAll;


fc.sourceNormalizers.push(function(sourceOptions) {
	if (sourceOptions.dataType == 'gcal' ||
		sourceOptions.dataType === undefined &&
		(sourceOptions.url || '').match(/^(http|https):\/\/www.google.com\/calendar\/feeds\//)) {
			sourceOptions.dataType = 'gcal';
			if (sourceOptions.editable === undefined) {
				sourceOptions.editable = false;
			}
		}
});


fc.sourceFetchers.push(function(sourceOptions, start, end) {
	if (sourceOptions.dataType == 'gcal') {
		return transformOptions(sourceOptions, start, end, this);
	}
});


function transformOptions(sourceOptions, start, end, calendar) {

	var success = sourceOptions.success;
	var data = $.extend({}, sourceOptions.data || {}, {
		'singleevents': true,
		'max-results': 9999
	});
	var timezone = calendar.options.timezone;

	return $.extend({}, sourceOptions, {
		url: sourceOptions.url.replace(/\/basic$/, '/full') + '?alt=json-in-script&callback=?',
		dataType: 'jsonp',
		data: data,
		timezoneParam: 'ctz',
		startParam: 'start-min',
		endParam: 'start-max',
		success: function(data) {
			var events = [];
			if (data.feed.entry) {
				$.each(data.feed.entry, function(i, entry) {

					//console.log(entry['title']['$t'], entry['gd$when'][0]['startTime'], entry['gd$when'][0]['endTime']);

					var startStr = entry['gd$when'][0]['startTime'];
					var start = calendar.moment(startStr);
					var end = calendar.moment(entry['gd$when'][0]['endTime']);
					var allDay = startStr.indexOf('T') == -1;
					var url;

					$.each(entry.link, function(i, link) {
						if (link.type == 'text/html') {
							url = link.href;
							if (timezone && timezone != 'local') {
								url += (url.indexOf('?') == -1 ? '?' : '&') + 'ctz=' + timezone;
							}
						}
					});

					if (allDay) {
						end.add('days', -1); // make inclusive
					}

					events.push({
						id: entry['gCal$uid']['value'],
						title: entry['title']['$t'],
						url: url,
						start: start,
						end: end,
						allDay: allDay,
						location: entry['gd$where'][0]['valueString'],
						description: entry['content']['$t']
					});

				});
			}
			var args = [events].concat(Array.prototype.slice.call(arguments, 1));
			var res = applyAll(success, this, args);
			if ($.isArray(res)) {
				return res;
			}
			return events;
		}
	});
	
}


// legacy
fc.gcalFeed = function(url, sourceOptions) {
	return $.extend({}, sourceOptions, { url: url, dataType: 'gcal' });
};


})(jQuery);
