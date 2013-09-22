
var defaults = {

	lang: 'en',

	defaultEventDuration: '02:00:00',
	defaultAllDayEventDuration: '24:00:00',

	// display
	defaultView: 'month',
	aspectRatio: 1.35,
	header: {
		left: 'title',
		center: '',
		right: 'today prev,next'
	},
	weekends: true,
	weekNumbers: false,

	weekNumberTitle: 'W',
	weekNumberFormat: 'w', // 'w' for local (default), 'W' for ISO
	
	// editing
	//editable: false,
	//disableDragging: false,
	//disableResizing: false,
	
	// event ajax
	lazyFetching: true,
	startParam: 'start',
	endParam: 'end',
	timezoneParam: 'timezone',

	showMonthAfterYear: false,
	yearSuffix: '',
	
	// time formats
	titleFormat: {
		month: generateMonthTitleFormat,
		week: 'll', // like "Sep 4 1986"
		day: 'LL' // like "September 4 1986"
	},
	columnFormat: {
		month: 'ddd', // like "Sat"
		week: 'ddd', // like "Sat" // too vague, but at least English will override this (below)
		day: 'dddd' // like "Saturday"
	},
	timeFormat: { // for event elements
		'': generateShortTimeFormat
	},
	
	// locale
	isRTL: false,
	buttonText: {
		prev: "previous",
		next: "next",
		prevYear: "previous year",
		nextYear: "next year",
		today: 'today',
		month: 'month',
		week: 'week',
		day: 'day'
	},

	buttonHTML: {
		prev: "<span class='fc-text-arrow'>&lsaquo;</span>",
		next: "<span class='fc-text-arrow'>&rsaquo;</span>",
		prevYear: "<span class='fc-text-arrow'>&laquo;</span>",
		nextYear: "<span class='fc-text-arrow'>&raquo;</span>"
	},
	
	// jquery-ui theming
	theme: false,
	buttonIcons: {
		prev: 'circle-triangle-w',
		next: 'circle-triangle-e'
	},
	
	//selectable: false,
	unselectAuto: true,
	
	dropAccept: '*',
	
	handleWindowResize: true
	
};


function generateMonthTitleFormat(options, langData) {
	if (options.showMonthAfterYear) {
		return 'YYYY[' + options.yearSuffix + '] MMMM';
	}
	else {
		return 'MMMM YYYY[' + options.yearSuffix + ']';
	}
}


function generateShortTimeFormat(options, langData) {
	return langData.longDateFormat('LT')
		.replace(':mm', '(:mm)')
		.replace(/(\Wmm)$/, '($1)') // like above, but for foreign langs
		.replace(/\s*a$/i, 'aa'); // make " PM" -> "p"
}


var langOptionHash = {
	en: {
		columnFormat: {
			week: 'ddd M/D'
		}
	}
};


// right-to-left defaults
var rtlDefaults = {
	header: {
		left: 'next,prev today',
		center: '',
		right: 'title'
	},
	buttonHTML: {
		prev: "<span class='fc-text-arrow'>&rsaquo;</span>",
		next: "<span class='fc-text-arrow'>&lsaquo;</span>",
		prevYear: "<span class='fc-text-arrow'>&raquo;</span>",
		nextYear: "<span class='fc-text-arrow'>&laquo;</span>"
	},
	buttonIcons: {
		prev: 'circle-triangle-e',
		next: 'circle-triangle-w'
	}
};


