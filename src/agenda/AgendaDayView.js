
fcViews.agendaDay = AgendaDayView;

function AgendaDayView(element, calendar) {
	var t = this;
	
	
	// exports
	t.render = render;
	
	
	// imports
	AgendaView.call(t, element, calendar, 'agendaDay');


	function render(date, delta) {

		if (delta) {
			date.add('days', delta).startOf('day');
		}

		t.skipHiddenDays(date, delta < 0 ? -1 : 1);

		t.start = t.intervalStart = date.clone().startOf('day');
		t.end = t.intervalEnd = t.start.clone().add('days', 1);

		t.renderAgenda(1);
	}
	

}
