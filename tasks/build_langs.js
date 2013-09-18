var fs = require('fs');

// directory paths
var FC_LANG_DIR = '../lang';
var MOMENT_LANG_DIR = '../lib/moment/lang';
var DATEPICKER_LANG_DIR = '../lib/jquery-ui/ui/i18n';
var OUT_DIR = '../build/out/lang';

// Universal Module Definition wrap
var UMD_START = [
	"(function(factory) {",
	"    if (typeof define === 'function' && define.amd) {",
	"        define([ 'jquery', 'moment' ], factory);",
	"    }",
	"    else {",
	"        factory(jQuery, moment);",
	"    }",
	"})(function($, moment) {"
	].join('\n');
var UMD_END = "});";



// Main
// -------------------------------------------------------------------------------------------------

// NOTE: this script needs to be executed from the current directory!!!

var languageCnt = 0;
var failedLangCodes = [];

if (!fs.existsSync(OUT_DIR)) {
	fs.mkdirSync(OUT_DIR, 0755); // create the root output directory
}

// loop through all of Moment's translation files
fs.readdirSync(MOMENT_LANG_DIR).forEach(function(filename) {
	var match = filename.match(/([\w-]*)\.js/);
	var langCode;
	var shortLangCode;
	var momentLangJS;
	var datepickerLangJS;
	var fullCalendarLangJS;
	var finalJS;

	if (match) {

		langCode = match[1].toLowerCase();

		// given "fr-ca", get just "fr"
		shortLangCode = false;
		if (langCode.indexOf('-') != -1) {
			shortLangCode = langCode.replace(/-.*/, '');
		}

		momentLangJS = getMomentLangJS(MOMENT_LANG_DIR + '/' + filename);

		datepickerLangJS = getDatepickerLangJS(langCode) ||
			(shortLangCode ? getDatepickerLangJS(shortLangCode) : null);

		fullCalendarLangJS = getFullCalendarLangJS(langCode) ||
			(shortLangCode ? getFullCalendarLangJS(shortLangCode) : null);

		// all 3 configs need to be present (except for en-ca, which doesn't have datepicker)
		if (momentLangJS && (datepickerLangJS || shortLangCode == 'en') && fullCalendarLangJS) {

			finalJS = [
				UMD_START,
				'',
				momentLangJS,
				datepickerLangJS || '',
				fullCalendarLangJS,
				'',
				UMD_END
			].join('\n');

			// write the translation file!
			fs.createWriteStream(OUT_DIR + '/' + langCode + '.js')
				.write(finalJS);

			languageCnt++;
		}
		else {
			failedLangCodes.push(langCode);
		}
	}
});

console.log(failedLangCodes.length + ' failed languages: ' + failedLangCodes.join(', '));
console.log(languageCnt + ' generated languages.');



// MomentJS translations
// -------------------------------------------------------------------------------------------------


function getMomentLangJS(path) { // file assumed to exist
	var text = fs.readFileSync(path, { encoding: 'utf8' });

	// remove the CommonJS module definition
	text = text.replace(/require\([\'\"]\.\.\/moment[\'\"]\)/g, 'moment');

	return text;
}



// jQuery UI Datepicker translations
// -------------------------------------------------------------------------------------------------


function getDatepickerLangPath(langCode) {

	// convert "en-ca" to "en-CA"
	langCode = langCode.replace(/\-(\w+)/, function(m0, m1) {
		return '-' + m1.toUpperCase();
	});

	return DATEPICKER_LANG_DIR + '/jquery.ui.datepicker-' + langCode + '.js';
}


function getDatepickerLangJS(langCode) {
	var path = getDatepickerLangPath(langCode);
	var text;

	try {
		text = fs.readFileSync(path, { encoding: 'utf8' });
	}
	catch (ex) {
		return false;
	}

	text = text.replace(
		/^jQuery\([\S\s]*?\{([\S\s]*)\}\);?/m, // inside the jQuery(function) wrap,
		function(m0, body) {                   // use only the function body, modified.
			var match = body.match(/\$\.datepicker\.regional[\S\s]*?(\{[\S\s]*?\});?/);
			var props = match[1];
			props = props.replace(/^\t/mg, ''); // remove 1 level of tab indentation
			return "$.fullCalendar.datepickerLang('" + langCode + "', " + props + ');';
		}
	);

	return text;
}



// FullCalendar translations
// -------------------------------------------------------------------------------------------------


function getFullCalendarLangPath(langCode) {

	langCode = langCode.toLowerCase();

	return FC_LANG_DIR + '/' + langCode + '.js';
}


function getFullCalendarLangJS(langCode) {
	var path = getFullCalendarLangPath(langCode);

	try {
		return fs.readFileSync(path, { encoding: 'utf8' }); // return as-is
	}
	catch (ex) {
		return false;
	}
}

