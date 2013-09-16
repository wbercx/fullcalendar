
var fs = require('fs');

var FC_LANG_DIR = '../lang';
var MOMENT_LANG_DIR = '../lib/moment/lang';
var JQUI_LANG_DIR = '../lib/jquery-ui/ui/i18n';
var OUT_DIR = '../build/out/lang';


function getMomentLangText(path) { // file assumed to exist
	var text = fs.readFileSync(path, { encoding: 'utf8' });
	text = text.replace(/require\([\'\"]\.\.\/moment[\'\"]\)/g, "moment");
	return text;
}

function getJQUILangData(code) { // returns { comments, properties }

	if (code == 'en') {
		return { comments: '', properties: {} };
	}

	var path = getJQUILangPath(code);
	var text;
	var match;
	var obj;

	try {
		text = fs.readFileSync(path, { encoding: 'utf8' });
	}
	catch (ex) {
		return false;
	}

	match = text.match(/^([\S\s]*)jQuery[\S\s]*?\{[\S\s]*?(\{[\S\s]*?\});/);
	if (match) {
		obj = eval('(' + match[2] + ')');
		if (obj) {
			return {
				commentText: match[1],
				properties: obj
			};
		}
	}

	return false;
}

function getJQUILangPath(code) {
	code = code.replace(/\-(\w+)/, function(m0, m1) {
		return '-' + m1.toUpperCase(); // "en-ca" -> "en-CA"
	});
	return JQUI_LANG_DIR + '/jquery.ui.datepicker-' + code + '.js';
}


function getFCLangData(code) {
	var path = getFCLangPath(code);
	var text;

	try {
		text = fs.readFileSync(path, { encoding: 'utf8' });
	}
	catch (ex) {
		return false;
	}

	return JSON.parse(text);
}


function getFCLangPath(code) {
	code = code.toLowerCase();
	return FC_LANG_DIR + '/' + code + '.json';
}


var START = [
	'(function() {',
	'function onload(moment, $) {'
].join('\n');

var END = [
	'}',
	'if (typeof define === "function" && define.amd) {',
	'    define(["moment", "jquery"], onload);',
	'}',
	'if (typeof window !== "undefined" && window.moment && window.jQuery) {',
	'    onload(window.moment, window.jQuery);',
	'}',
	'})();'
].join('\n');


function generateLangText(code, momentText, jquiData, fcData) {

	var jquiProperties = jquiData.properties;

	delete jquiProperties.monthNames;
	delete jquiProperties.monthNamesShort;
	delete jquiProperties.dayNames;

	// don't delete these because of discrepancies
	//delete jquiProperties.dayNamesShort; // JQUI has uppercase first letter, but moment doesn't
	//delete jquiProperties.dayNamesMin; // JQUI has 1-letter, but moment has 2-letter

	return [
		START,
		'',
		momentText,
		'',
		'if ($.fullCalendar)',
		'$.fullCalendar.lang("' + code + '",',
		JSON.stringify(fcData, null, 4),
		',',
		jquiData.commentText,
		JSON.stringify(jquiProperties, null, 4),
		');',
		'',
		END
	].join('\n');
}


function outputLang(code, momentText, jquiData, fcData) { // always assumed to be momentData

	var text = generateLangText(code, momentText, jquiData, fcData);
	var outFile = fs.createWriteStream(OUT_DIR + '/' + code + '.js');

	outFile.write(text, 'utf8');

}


var languageCnt = 0;
var failedCodes = [];

if (!fs.existsSync(OUT_DIR)) {
	fs.mkdirSync(OUT_DIR, 0755);
}

fs.readdirSync(MOMENT_LANG_DIR).forEach(function(filename) {

	var match = filename.match(/([\w-]*)\.js/);
	var momentLangPath = MOMENT_LANG_DIR + '/' + filename;
	var code;
	var shortCode;
	var success;
	var momentText;
	var jquiData;
	var fcData;

	if (match) {

		code = match[1].toLowerCase();

		shortCode = false;
		if (code.indexOf('-') != -1) {
			shortCode = code.replace(/-.*/, '');
		}

		momentText = getMomentLangText(momentLangPath);

		jquiData = getJQUILangData(code) ||
			(shortCode ? getJQUILangData(shortCode) : null);

		fcData = getFCLangData(code) ||
			(shortCode ? getFCLangData(shortCode) : null);

		if (momentText && jquiData && fcData) {
			outputLang(code, momentText, jquiData, fcData);
			languageCnt++;
		}
		else {
			failedCodes.push(code);
		}
	}
});

console.log(failedCodes.length + ' failed languages: ' + failedCodes.join(', '));
console.log(languageCnt + ' generated languages.');


