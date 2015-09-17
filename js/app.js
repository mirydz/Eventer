
//$(document).ready(function() {
	function MyEvent(params) {
		this.generateId = function() {
			return Math.random().toString().substring(2);
		}	
		
		this.id = this.generateId();		
		this.title = params.title;
		this.time = params.time;
		this.formattedTime = function() {
			
			return this.time.toLocaleString()
		};
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

	}
	
	function renderList() {
		var templateData = {
			eventsList: events.getAll()
		};
		var output = template(templateData);
		$eventsList.html(output);
		registerHandlers();
				
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
	
	function registerHandlers() {
		$(".event-delete").on("click", function deleteEvent() {
			var id = $(this).parent().data("id");
			events.removeById(id);
			renderList();
		});	
	}	

	$(".new-event-form").on("submit", function addEvent(ev) {
		ev.preventDefault();
		var isModelValid = $newEventTitle.val() && $newEventTime.val() 
		if (isModelValid) {
				var params = {
				title: $newEventTitle.val(),
				time: new Date($newEventTime.val())
			};
			events.add(new MyEvent(params));
			this.reset();
			$newEventTime.val(new Date().toDateInputValue());
			renderList();
		} else {
			alert("Please specify the name and time of event.")
		}
	});
	
	var $eventsList = $(".events-list");
	var templateSource = $("#event-template").html();
	var $newEventTitle = $(".new-event-title");
	var $newEventTime = $(".new-event-time");
	
	// initial rendering of events list
	var template = Handlebars.compile(templateSource);
	insertInitialData();
	renderList();
	
	// set datetime-local input value to today for easier work
	// see: http://stackoverflow.com/questions/6982692/html5-input-type-date-default-value-to-today
	Date.prototype.toDateInputValue = (function() {
		var local = new Date(this);
		local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
		return local.toJSON().slice(0,16);
	});
	$newEventTime.val(new Date().toDateInputValue());
	
	

//});