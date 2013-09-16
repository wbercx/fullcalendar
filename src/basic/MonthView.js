
fcViews.month = MonthView;

function MonthView(element, calendar) {
	var t = this;
	
	
	// exports
	t.render = render;
	
	
	// imports
	BasicView.call(t, element, calendar, 'month');


	function render(date, delta) {

		if (delta) {
			date.add('months', delta).startOf('month');
		}

		t.intervalStart = date.clone().startOf('month');
		t.intervalEnd = t.intervalStart.clone().add('months', 1);

		t.start = t.intervalStart.clone().startOf('week');
		t.end = t.intervalEnd.clone().startOf('week').add('weeks', 1);

		t.skipHiddenDays(t.start);
		t.skipHiddenDays(t.end, -1, true);

		var rowCnt = t.end.diff(t.start, 'weeks');

		if (t.opt('weekMode') == 'fixed') {
			t.end.add('weeks', 6 - rowCnt);
			rowCnt = 6;
		}

		t.renderBasic(rowCnt, t.getCellsPerWeek(), true);
	}
	
	
}
