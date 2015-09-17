
//$(document).ready(function() {
	function MyEvent(params) {
		this.generateId = function() {
			return Math.random().toString().substring(2);
		}	
		
		this.id = this.generateId();		
		this.title = params.title;
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
	
	var event1 = new MyEvent({title: "Tom's party"});
	var event2 = new MyEvent({title: "meeting with boss"});
	
	events.add(event1);
	events.add(event2);
	
	
	console.log(events.eventsList);
		
	var source = $("#event-template").html();
	var template = Handlebars.compile(source);
	var data = {
		eventsList: events.getAll()
	};
	
	var output = template(data);
	$(".events-list").html(output);

//});