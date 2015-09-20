/* global Handlebars */
/* global $ */

//$(document).ready(function() {
	function MyEvent(params) {
		this.id = params.id	|| undefined,	
		this.title = params.title;
		this.description = params.description || "";
		this.time = params.time;
		this.reminderTime = params.reminderTime;
	}
	
	MyEvent.prototype.formattedTime = function() {
		return this.time.toLocaleString();
	};
	
	MyEvent.prototype.formattedReminderTime = function() {
		return this.reminderTime.toLocaleString();
	};
	
	var events = (function() {
		var eventsList =  [];
		var store = new Dexie("events-store");
		store.version(1).stores({event: '++id', });
		store.event.mapToClass(MyEvent);
		store.on("populate", populateWithSampleData);
		store.open();
		function getAll(callback) { 
			store.event.toArray(function(result) {
				eventsViewModel.data = result;
				callback(result);
			});
		}
		
		function add(newEvent) {
			//eventsList.push(newEvent);
			var ev = {
				title: 			newEvent.title,
				description: 	newEvent.description,
				time: 			newEvent.time,
				reminderTime: 	newEvent.reminderTime,
			};
			ev.reminderTime = newEvent.reminderTime;
			store.event.put(ev);
		}
		
		function update(updatedEvent) {
			store.event.put({
				title: updatedEvent.title,
				description: updatedEvent.description,
				time: updatedEvent.time,
				reminderTime: updatedEvent.reminderTime,
				id: updatedEvent.id
			});
		}
		
		function getById(id) {
			var eventWeLookFor = null;
			eventsList.forEach(function(element) {
				if (element.id == id) {
					eventWeLookFor = element;
				}
			}, this);
			return eventWeLookFor;
		}
		
		function removeById(eventId) {
			store.event.delete(eventId);
		}
		
		function populateWithSampleData() {
			var initialData = [	
				{
					title: "Tom's party",
					time: new Date(2015, 10, 30),
					description: "Remember to bering beer"
				},
				{
					title: "meeting with boss",
					time: new Date(2015, 10, 25),
					description: ""
				},
				{
					title: "doctor's appointment",
					time: new Date(2015, 10, 26)
				}
			];
			
			initialData.forEach(function(sampleEvent) {
				store.event.add(sampleEvent);
			}, this);
		}
		return {
			getAll: getAll,
			add: add,
			update: update,
			removeById: removeById,
			store: store,
		}

	}());
	
	var eventsViewModel = {
		data: [],
		
		getById: function getById(id) {
			var eventWeLookFor = null;
			this.data.forEach(function(element) {
				if (element.id == id) {
					eventWeLookFor = element;
				}
			}, this);
			return eventWeLookFor;
		}
	};
	
	function checkReminders() {
		eventsViewModel.data.forEach(function(event) {
			var now = new Date();
			if (event.time > now) {
				if (event.reminderTime <= now) {
					var msg = event.title + " at " + event.formattedTime()
					console.log(msg);
					if (document['hidden']) {
						new Notification(msg);
					}
				}
			}
		}, this);
	}
	
	function renderList() {	
		function onFinishedFetchingData(data) {
			var templateData = { eventsList: data };
			var output = template(templateData);
			//x = data;
			$eventsList.html(output);
			registerHandlers();
			window.setInterval(checkReminders, 10*1000);	
		}
		events.getAll(onFinishedFetchingData);	
	}
	
	function registerHandlers() {
		$(".event-delete").on("click", function deleteEvent() {
			var id = $(this).parent().data("id");
			events.removeById(id);
			renderList();
		});	
				
		// places the edited event data in the top form on page
		$(".event-edit").on("click", function edit() {
			var $eventEditBtn = $(this);
			var eventId = Number($eventEditBtn.parent(".event").data("id"));
			var eventToEdit = eventsViewModel.getById(eventId);
			$(".new-event-id").val(eventId);
			$newEventTitle.val(eventToEdit.title);
			$newEventDescription.val(eventToEdit.description);
			$newEventTime.val(eventToEdit.time.toDateInputValue());
			if (eventToEdit.hasOwnProperty("reminderTime")) {
				$newEventReminderTime.val(eventToEdit.reminderTime.toDateInputValue());			
			}
		});
	}
	
	function getTimeFromInput($element) {
		var dateTimeLocalStr = $element.val();
		var dateTime = new Date(dateTimeLocalStr);
		dateTime.setHours(dateTime.getHours() - 2);
		return dateTime;
	}	

	$(".add-event-btn").on("click", function addEvent(ev) {
		ev.preventDefault();
		var isModelValid = $newEventTitle.val() && $newEventTime.val() 
		if (isModelValid) {
			var eventTime = new Date($newEventTime.val());
			eventTime.setHours(eventTime.getHours() - 1);
			
			var params = {
				id: Number($(".new-event-id").val()),
				title: $newEventTitle.val(),
				description: $newEventDescription.val(),
				time: getTimeFromInput($newEventTime),
				reminderTime: getTimeFromInput($newEventReminderTime)
			};
			
			if (! params.id) {
				events.add(new MyEvent(params));	
			} else {
				events.update(new MyEvent(params));
			}
				
			$(".new-event-form")[0].reset();
			$newEventTime.val(new Date().toDateInputValue());
			$newEventReminderTime.val(new Date().toDateInputValue());
			renderList();
		} else {
			alert("Please specify the name and time of event.")
		}
	});
	

	
	var $eventsList = $(".events-list");
	var templateSource = $("#event-template").html();
	var $newEventTitle = $(".new-event-title");
	var $newEventTime = $(".new-event-time");
	var $newEventReminderTime = $(".new-event-reminder-time");
	var $newEventDescription = $(".new-event-description");			
	
	// initial rendering of events list
	var template = Handlebars.compile(templateSource);
	renderList();
	// ask for permission to send notifications 
	var notification = window.Notification || window.mozNotification || window.webkitNotification;
	notification.requestPermission(function(permission){});
	
	// set datetime-local input value to today for easier work
	// see: http://stackoverflow.com/questions/6982692/html5-input-type-date-default-value-to-today
	Date.prototype.toDateInputValue = (function() {
		var local = new Date(this);
		local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
		return local.toJSON().slice(0,16);
	});
	$newEventTime.val(new Date().toDateInputValue());
	$newEventReminderTime.val(new Date().toDateInputValue());
	

//});