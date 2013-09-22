

//var langOptionHash = {}; // done in defaults.js


fc.datepickerLang = function(langCode, options) {
	var langOptions = langOptionHash[langCode];

	if (!langOptions) {
		langOptions = langOptionHash[langCode] = {};
	}

	// merge certain datepicker options into FullCalendar's options
	mergeOptions(langOptions, {
		isRTL: options.isRTL,
		weekNumberTitle: options.weekHeader,
		showMonthAfterYear: options.showMonthAfterYear,
		yearSuffix: options.yearSuffix,
		buttonText: {
			prev: options.prevText,
			next: options.nextText,
			today: options.currentText
		}
	});

	// pass settings along to datepicker if available
	if ($.datepicker) {

		// datepicker uses "fr-CA" instead of "fr-ca"
		langCode = langCode.replace(/\-(\w+)/, function(m0, m1) {
			return '-' + m1.toUpperCase();
		});

		// register the language with datepicker and set it as the default
		$.datepicker.setDefaults(
			$.datepicker.regional[langCode] = options
		);
	}
};


fc.lang = function(langCode, options) {
	var langOptions = langOptionHash[langCode];

	if (!langOptions) {
		langOptions = langOptionHash[langCode] = {};
	}

	mergeOptions(langOptions, options);

	// set it as the default language for FullCalendar
	defaults.lang = langCode;
};