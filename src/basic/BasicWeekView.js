
fcViews.basicWeek = BasicWeekView;

function BasicWeekView(element, calendar) {
	var t = this;
	
	
	// exports
	t.render = render;
	
	
	// imports
	BasicView.call(t, element, calendar, 'basicWeek');


	function render(date, delta) {

		if (delta) {
			date.add('weeks', delta).startOf('week');
		}

		t.start = t.intervalStart = date.clone().startOf('week');
		t.end = t.intervalEnd = t.start.clone().add('weeks', 1);

		t.skipHiddenDays(t.start);
		t.skipHiddenDays(t.end, -1, true);

		t.renderBasic(1, t.getCellsPerWeek(), false);
	}
	
	
}
