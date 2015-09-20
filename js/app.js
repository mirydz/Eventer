/* global Handlebars */
/* global $ */

//$(document).ready(function() {
	function MyEvent(params) {
		this.id = params.id	|| undefined,	
		this.title = params.title;
		this.description = params.description || "";
		this.time = params.time;
		this.reminderTime = params.reminderTime;
		this.isReminderSent = false;
	}
	
	MyEvent.prototype.formatTime = function(date) {
		var monthNames = [
			"January", "February", "March",
			"April", "May", "June", "July",
			"August", "September", "October",
			"November", "December"
			];
		
		var day = date.getDate();
		var monthIndex = date.getMonth();
		var year = date.getFullYear();
		var hours = date.getHours();
		var minutes = date.getMinutes();
		if (minutes < 10) {
			minutes = "0" + minutes;
		}
				
		return day +" "+ monthNames[monthIndex] + " "
				+ year + " " + hours + ":" + minutes;
	};
	
	MyEvent.prototype.formattedTime = function() {
		
		//return this.time.toLocaleString();
		return this.formatTime(this.time);
	}
	
	MyEvent.prototype.formattedReminderTime = function() {
		return this.formatTime(this.reminderTime);
	};
	
	var events = (function() {
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
			store.event.add(newEvent);
		}
		
		function update(updatedEvent) {
			store.event.put(updatedEvent);
		}
		
		function removeById(eventId) {
			store.event.delete(eventId);
		}
		
		function populateWithSampleData() {
			var initialData = [	
				{
					title: "Tom's party",
					time: new Date(2015, 10, 30, 18, 0),
					reminderTime: new Date(2015, 10, 30, 17, 0),
					description: "Remember to bering beer",
					isReminderSent: false
				},
				{
					title: "meeting with boss",
					time: new Date(2015, 10, 25, 9, 0),
					reminderTime: new Date(2015, 10, 25, 8, 0),
					description: "",
					isReminderSent: false
				},
				{
					title: "doctor's appointment",
					time: new Date(2015, 10, 26, 15, 0),
					reminderTime: new Date(2015, 10, 26, 10, 0),
					isReminderSent: false
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
			if( ! event.isReminderSent) {
				if (event.time > now && event.reminderTime <= now) {
					var msg = event.title + " at " + event.formattedTime()
					console.log(msg);
					alert(msg);
					if (document['hidden']) {
						new Notification(msg);
					}
					event.isReminderSent = true;
					events.update(event);
					renderList();
				}				
			}

		}, this);
	}
	
	function renderList() {	
		function onFinishedFetchingData(data) {
			var sortedData = data.sort(function sortByTime(a, b) {
				if(a.time < b.time)
					return -1;
				else if (a.time > b.time)
					return 1;
					
				return 0
			});
			var templateData = { eventsList: sortedData };
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
		if (dateTimeLocalStr === ""){
			return dateTimeLocalStr;
		}
		var dateTime = new Date(dateTimeLocalStr);
		dateTime.setHours(dateTime.getHours() + dateTime.getTimezoneOffset()/60);
		return dateTime;
	}	

	$(".add-event-btn").on("click", function addEvent(ev) {
		ev.preventDefault();
		var eventTime = getTimeFromInput($newEventTime);
		var reminderTime = getTimeFromInput($newEventReminderTime);
		
		var validateForm = function() {
			var result = {
				isValid: false,
				errors: [],
			};
			var areRequiredFieldsFilled = $newEventTitle.val() && $newEventTime.val() 
			var isReminderTimeLessThanEventTime = reminderTime < eventTime;
			
			if(! areRequiredFieldsFilled)
				result.errors.push("Event title and time are required.")
			if (! isReminderTimeLessThanEventTime)
				result.errors.push("Reminder time must be before the event.")
			if (areRequiredFieldsFilled && isReminderTimeLessThanEventTime) {
				result.isValid = true;
			}	
			
			return result;	
		}
		
		var validationResult = validateForm();
		
		if (validationResult.isValid) {			
			var event = {
				title: $newEventTitle.val(),
				description: $newEventDescription.val(),
				time: getTimeFromInput($newEventTime),
				reminderTime: getTimeFromInput($newEventReminderTime)
			};
			if ($(".new-event-id").val()) {
				event.id = Number($(".new-event-id").val());		
			}
			
			if (! event.id) {
				events.add(event);	
			} else {
				events.update(event);
			}
				
			$(".new-event-form")[0].reset();
			$(".new-event-id").val("");
			$newEventTime.val(new Date().toDateInputValue());
			$newEventReminderTime.val(new Date().toDateInputValue());
			renderList();
		} else {
			var msg = "";
			validationResult.errors.forEach(function(error) {
				msg += error + '\n';
			}, this);
			alert(msg)
		}
	});
	
	$(".clear-form").on("click", function clearForm() {
		$(".new-event-form")[0].reset();
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