

//var langOptionHash = {}; // done in defaults.js

fc.langs = langOptionHash;


fc.datepickerLang = function(langCode, datepickerLangCode, options) {
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

	// register the language with datepicker and set it as the default
	if ($.datepicker) {
		$.datepicker.setDefaults(
			$.datepicker.regional[datepickerLangCode] = options
		);
	}
};


fc.lang = function(langCode, options) {
	var langOptions = langOptionHash[langCode];

	if (!langOptions) {
		langOptions = langOptionHash[langCode] = {};
	}

	mergeOptions(langOptions, options || {});

	// set it as the default language for FullCalendar
	defaults.lang = langCode;
};