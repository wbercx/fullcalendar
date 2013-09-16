
fcViews.basicDay = BasicDayView;

function BasicDayView(element, calendar) {
	var t = this;
	
	
	// exports
	t.render = render;
	
	
	// imports
	BasicView.call(t, element, calendar, 'basicDay');


	function render(date, delta) {

		if (delta) {
			date.add('days', delta).startOf('day');
		}

		t.skipHiddenDays(date, delta < 0 ? -1 : 1);

		t.start = t.intervalStart = date.clone().startOf('day');
		t.end = t.intervalEnd = t.start.clone().add('days', 1);

		t.renderBasic(1, 1, false);
	}
	
	
}
