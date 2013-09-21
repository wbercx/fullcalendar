
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

	weekNumberCalculation: 'iso', // needs updating with Moment
	weekNumberTitle: 'W',         //
	
	// editing
	//editable: false,
	//disableDragging: false,
	//disableResizing: false,
	
	allDayDefault: true,
	
	// event ajax
	lazyFetching: true,
	startParam: 'start',
	endParam: 'end',
	timezoneParam: 'timezone',
	
	// time formats
	titleFormat: {
		month: 'MMMM YYYY', //'MMMM yyyy', // TODO: make i18n somehow!
		week: 'll', //"MMM d[ yyyy]{ '&#8212;'[ MMM] d yyyy}",
		day: 'LL' //'dddd, MMM d, yyyy' // TODO: add day-of-week somehow!
	},
	columnFormat: {
		month: 'ddd',
		week: 'ddd M/D',
		day: 'dddd M/D'
	},
	timeFormat: { // for event elements
		'': 'h(:mm)aa' //'h(:mm)t' // default
	},
	
	// locale
	isRTL: false,
	buttonText: {
		prev: "<span class='fc-text-arrow'>&lsaquo;</span>",
		next: "<span class='fc-text-arrow'>&rsaquo;</span>",
		prevYear: "<span class='fc-text-arrow'>&laquo;</span>",
		nextYear: "<span class='fc-text-arrow'>&raquo;</span>",
		today: 'today',
		month: 'month',
		week: 'week',
		day: 'day'
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

// right-to-left defaults
var rtlDefaults = {
	header: {
		left: 'next,prev today',
		center: '',
		right: 'title'
	},
	buttonText: {
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


