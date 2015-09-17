
//$(document).ready(function() {
	function MyEvent(params) {
		this.generateId = function() {
			return Math.random().toString().substring(2);
		}	
		
		this.id = this.generateId();		
		this.title = params.title;
		this.time = params.time;
	}
	
	var events = {
		eventsList: [],
		
		getAll: function() { return this.eventsList; },
		
		add: function(event) {
			this.eventsList.push(event)
		},
		
		update: function(updatedevent) {
			var eventIndex = this.eventsList.indexOf(this.getById(updatedevent.eventId));
			this[eventIndex] = updatedevent;	
		},
		
		getById: function(id) {
			var eventWeLookFor = null;
			this.eventsList.forEach(function(element) {
				if (element.id == id) {
					eventWeLookFor = element;
				}
			}, this);
			return eventWeLookFor;
		},
		
		removeById: function(eventId) {
			var IndexOfeventToRemove = this.eventsList.indexOf(this.getById(eventId));
			if (IndexOfeventToRemove > -1) {
				this.eventsList.splice(IndexOfeventToRemove, 1);
			}
		}

	};
	
	function renderList() {
		var templateData = {
			eventsList: events.getAll()
		};
		var output = template(templateData);
		$eventsList.html(output);		
	}
	
	function insertInitialData() {	
		var event1 = new MyEvent({
			title: "Tom's party",
			time: new Date(2015, 09, 30)
		});
		var event2 = new MyEvent({
			title: "meeting with boss",
			time: new Date(2015, 09, 25)
		});
		
		events.add(event1);
		events.add(event2);
		console.log(events.eventsList);
	};
	
	var $eventsList = $(".events-list");
	var templateSource = $("#event-template").html();
	var $newEventTitle = $(".new-event-title");
	var $newEventTime = $(".new-event-time");
	
	// initial rendering of events list
	var template = Handlebars.compile(templateSource);
	insertInitialData();
	renderList();
	
	// interaction with user
	$(".new-event-form").on("submit", function addEvent(ev) {
		ev.preventDefault();
		var params = {
			title: $newEventTitle.val(),
			time: new Date($newEventTime.val())
		};
		events.add(new MyEvent(params));
		console.log(this);
		this.reset();
		renderList();
	});
	
	$(".event-delete").on("click", function deleteEvent() {
		var id = $(this).parent().data("id");
		events.removeById(id);
		renderList();
	});
	
	

	

	
	

//});