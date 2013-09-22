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

		langCode = match[1];

		// given "fr-ca", get just "fr"
		shortLangCode = false;
		if (langCode.indexOf('-') != -1) {
			shortLangCode = langCode.replace(/-.*/, '');
		}

		momentLangJS = getMomentLangJS(MOMENT_LANG_DIR + '/' + filename);

		datepickerLangJS = getDatepickerLangJS(langCode);
		if (!datepickerLangJS && shortLangCode) {
			datepickerLangJS = getDatepickerLangJS(shortLangCode, langCode);
		}

		fullCalendarLangJS = getFullCalendarLangJS(langCode);
		if (!fullCalendarLangJS && shortLangCode) {
			fullCalendarLangJS = getFullCalendarLangJS(shortLangCode, langCode);
		}

		// If this is an "en" language, only the Moment config is needed.
		// For all other languages, all 3 configs are needed.
		if (momentLangJS && (shortLangCode == 'en' || (datepickerLangJS && fullCalendarLangJS))) {

			// if there is no definition, we still need to tell FC to set the default
			if (!fullCalendarLangJS) {
				fullCalendarLangJS = '$.fullCalendar.lang("' + langCode + '");';
			}

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

	var js = fs.readFileSync(path, { encoding: 'utf8' });

	js = js.replace( // remove the UMD wrap
		/\(\s*function[\S\s]*?function\s*\(\s*moment\s*\)\s*\{([\S\s]*)\}\)\);?/,
		function(m0, body) {
			body = body.replace(/^    /mg, ''); // remove 1 level of indentation
			return body;
		}
	);

	return js;
}



// jQuery UI Datepicker translations
// -------------------------------------------------------------------------------------------------


function getDatepickerLangJS(langCode, targetLangCode) {

	// convert "en-ca" to "en-CA"
	var datepickerLangCode = langCode.replace(/\-(\w+)/, function(m0, m1) {
		return '-' + m1.toUpperCase();
	});

	var path = DATEPICKER_LANG_DIR + '/jquery.ui.datepicker-' + datepickerLangCode + '.js';
	var js;

	try {
		js = fs.readFileSync(path, { encoding: 'utf8' });
	}
	catch (ex) {
		return false;
	}

	js = js.replace(
		/^jQuery\([\S\s]*?\{([\S\s]*)\}\);?/m, // inside the jQuery(function) wrap,
		function(m0, body) {                   // use only the function body, modified.

			var match = body.match(/\$\.datepicker\.regional[\S\s]*?(\{[\S\s]*?\});?/);
			var props = match[1];

			// remove 1 level of tab indentation
			props = props.replace(/^\t/mg, '');

			return "$.fullCalendar.datepickerLang(" +
				"'" + (targetLangCode || langCode) + "', " + // for FullCalendar
				"'" + datepickerLangCode + "', " + // for datepicker
				props +
				");";
		}
	);

	return js;
}



// FullCalendar translations
// -------------------------------------------------------------------------------------------------


function getFullCalendarLangJS(langCode, targetLangCode) {

	var path = FC_LANG_DIR + '/' + langCode + '.js';
	var js;

	try {
		js = fs.readFileSync(path, { encoding: 'utf8' }); // return as-is
	}
	catch (ex) {
		return false;
	}

	// if we originally wanted "ar-ma", but only "ar" is available, we have to adjust
	// the declaration
	if (targetLangCode && targetLangCode != langCode) {
		js = js.replace(
			/\$\.fullCalendar\.lang\(['"]([^'"]*)['"]/,
			'$.fullCalendar.lang("' + targetLangCode + '"'
		);
	}

	return js;
}

