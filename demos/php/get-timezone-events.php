<?php // requires PHP 5.3

// TODO: accept start/end

$raw_json = file_get_contents(__DIR__ . '/../json/chicago-events.json');
$raw_events = json_decode($raw_json, true);

$timezone = null;
if (isset($_REQUEST['timezone'])) {
	$timezone = new DateTimeZone($_REQUEST['timezone']);
}

$events = array();
foreach ($raw_events as $raw_event) {
	$events[] = buildEvent($raw_event, $timezone);
}

echo json_encode($events);


function buildEvent($raw_event, $timezone=null) {

	$event = array(
		'title' => $raw_event['title'],
		'start' => buildDateTime($raw_event['start'], $timezone)->format('c')
	);

	if (isset($raw_event['end'])) {
		$event['end'] = buildDateTime($raw_event['end'], $timezone)->format('c');
	}

	return $event;
}


function buildDateTime($raw_string, $timezone=null) {

	$date = new DateTime(
		$raw_string,
		$timezone ?: new DateTimeZone('UTC')
			// used only when ambiguous
			// ignored if string has a timezone offset in it
	);

	// if our timezone was ignore above, force it
	if ($timezone) {
		$date->setTimezone($timezone);
	}

	return $date;
}


?>