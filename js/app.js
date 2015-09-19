/* global Handlebars */
/* global $ */

//$(document).ready(function() {
	function MyEvent(params) {
		this.id = params.id;		
		this.title = params.title;
		this.time = params.time;
	}
	
	MyEvent.prototype.formattedTime = function() {
		return this.time.toLocaleString()
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
				callback(result);
			});
		}
		
		function add(newEvent) {
			//eventsList.push(newEvent);
			store.event.put({
				title: newEvent.title,
				time: newEvent.time,
			});
		}
		
		function update(updatedEvent) {
			store.event.put({
				title: updatedEvent.title,
				time: updatedEvent.time,
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
					time: new Date(2015, 10, 30)
				},
				{
					title: "meeting with boss",
					time: new Date(2015, 10, 25)
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
	var x = null;
	function renderList() {	
		function onFinishedFetchingData(data) {
			var templateData = { eventsList: data };
			var output = template(templateData);
			x = data;
			$eventsList.html(output);
			registerHandlers();
		}
		events.getAll(onFinishedFetchingData)			
	}
	
	function registerHandlers() {
		$(".event-delete").on("click", function deleteEvent() {
			var id = $(this).parent().data("id");
			events.removeById(id);
			renderList();
		});	
		
		$(".event-edit").on("click", function editEvent() {
			var $eventEditBtn = $(this);
			var $eventSaveBtn = $eventEditBtn.siblings(".event-save");
			var $eventTitle = $eventEditBtn.siblings(".event-title");
			var $eventTime = $eventEditBtn.siblings(".event-time");
			var eventId = $eventEditBtn.parent(".event").data("id");
			var enableEdit = function(state) {
				$eventEditBtn.siblings(".event-title, .event-time")
				.attr("contenteditable", state);
			};
			enableEdit(true);
			$eventEditBtn.hide();	
			$eventSaveBtn.on("click", function saveEvent() {
				enableEdit(false);
				$eventSaveBtn.hide();
				var modifiedEvent = new MyEvent({
					title: $eventTitle.html(),
					time: $eventTime.html(),
					id: eventId
				});
				events.update(modifiedEvent)
					
				$eventEditBtn.show();
				renderList();
			});
			$eventSaveBtn.show();
			
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