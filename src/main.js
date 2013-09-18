
var fc = $.fullCalendar = { version: "<%= meta.version %>" };
var fcViews = fc.views = {};


$.fn.fullCalendar = function(options) {

	// method calling
	if (typeof options == 'string') {
		var args = Array.prototype.slice.call(arguments, 1);
		var res;
		this.each(function() {
			var calendar = $.data(this, 'fullCalendar');
			if (calendar && $.isFunction(calendar[options])) {
				var r = calendar[options].apply(calendar, args);
				if (res === undefined) {
					res = r;
				}
				if (options == 'destroy') {
					$.removeData(this, 'fullCalendar');
				}
			}
		});
		if (res !== undefined) {
			return res;
		}
		return this;
	}
	
	this.each(function(i, _element) {
		var element = $(_element);
		var calendar = new Calendar(element, options);
		element.data('fullCalendar', calendar);
		calendar.render();
	});
	
	return this;
};


// function for adding/overriding defaults
function setDefaults(d) {
	mergeOptions(defaults, d);
}


function mergeOptions(target) {
	for (var i=1; i<arguments.length; i++) {
		$.each(arguments[i], function(name, value) {
			if ($.isPlainObject(value) && $.isPlainObject(target[name])) {
				mergeOptions(target[name], value);
			}
			else {
				target[name] = value;
			}
		});
	}
	return target;
}