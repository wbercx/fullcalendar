
module.exports = function(grunt) {

	// directory paths
	var FC_LANG_DIR = 'lang';
	var MOMENT_LANG_DIR = 'lib/moment/lang';
	var DATEPICKER_LANG_DIR = 'lib/jquery-ui/ui/i18n';
	var OUT_DIR = 'build/out/lang';

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


	grunt.registerTask('languages', function() {

		var languageCnt = 0;
		var skippedLangCodes = [];

		grunt.file.mkdir(OUT_DIR, 0755);

		grunt.file.expand(MOMENT_LANG_DIR + '/*.js').forEach(function(momentPath) {

			var langCode = momentPath.match(/([^\/]*)\.js$/)[1];
			var shortLangCode = false;
			var momentLangJS;
			var datepickerLangJS;
			var fullCalendarLangJS;
			var finalJS;

			// given "fr-ca", get just "fr"
			if (langCode.indexOf('-') != -1) {
				shortLangCode = langCode.replace(/-.*/, '');
			}

			momentLangJS = getMomentLangJS(momentPath);

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

				grunt.file.write(OUT_DIR + '/' + langCode + '.js', finalJS);

				languageCnt++;
			}
			else {
				skippedLangCodes.push(langCode);
			}

		});

		grunt.log.writeln(skippedLangCodes.length + ' skipped languages: ' + skippedLangCodes.join(', '));
		grunt.log.writeln(languageCnt + ' generated languages.');

	});


	function getMomentLangJS(path) { // file assumed to exist

		var js = grunt.file.read(path);

		js = js.replace( // remove the UMD wrap
			/\(\s*function[\S\s]*?function\s*\(\s*moment\s*\)\s*\{([\S\s]*)\}\)\);?/,
			function(m0, body) {
				body = body.replace(/^    /mg, ''); // remove 1 level of indentation
				return body;
			}
		);

		return js;
	}


	function getDatepickerLangJS(langCode, targetLangCode) {

		// convert "en-ca" to "en-CA"
		var datepickerLangCode = langCode.replace(/\-(\w+)/, function(m0, m1) {
			return '-' + m1.toUpperCase();
		});

		var path = DATEPICKER_LANG_DIR + '/jquery.ui.datepicker-' + datepickerLangCode + '.js';
		var js;

		try {
			js = grunt.file.read(path);
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


	function getFullCalendarLangJS(langCode, targetLangCode) {

		var path = FC_LANG_DIR + '/' + langCode + '.js';
		var js;

		try {
			js = grunt.file.read(path);
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


};
