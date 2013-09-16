
fcViews.agendaWeek = AgendaWeekView;

function AgendaWeekView(element, calendar) {
	var t = this;
	
	
	// exports
	t.render = render;
	
	
	// imports
	AgendaView.call(t, element, calendar, 'agendaWeek');


	function render(date, delta) {

		if (delta) {
			date.add('weeks', delta).startOf('week');
		}

		t.start = t.intervalStart = date.clone().startOf('week');
		t.end = t.intervalEnd = t.start.clone().add('weeks', 1);

		t.skipHiddenDays(t.start);
		t.skipHiddenDays(t.end, -1, true);

		t.renderAgenda(t.getCellsPerWeek());
	}


}
