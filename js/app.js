
//$(document).ready(function() {
	function Task(params) {
		this.generateId = function() {
			return Math.random().toString().substring(2);
		}	
		
		this.id = this.generateId();		
		this.title = params.title;
	}
	
	var tasks = {
		tasksList: [],
		
		getAll: function() { return this.tasksList; },
		
		add: function(task) {
			this.tasksList.push(task)
		},
		
		update: function(updatedTask) {
			var taskIndex = this.tasksList.indexOf(this.getById(updatedTask.taskId));
			this[taskIndex] = updatedTask;	
		},
		
		getById: function(id) {
			var taskWeLookFor = null;
			this.tasksList.forEach(function(element) {
				if (element.id == id) {
					taskWeLookFor = element;
				}
			}, this);
			return taskWeLookFor;
		},
		
		removeById: function(taskId) {
			var IndexOfTaskToRemove = this.tasksList.indexOf(this.getById(taskId));
			if (IndexOfTaskToRemove > -1) {
				this.tasksList.splice(IndexOfTaskToRemove, 1);
			}
		}

	};
	
	var task1 = new Task({title: "buy milk"});
	var task2 = new Task({title: "go to gym"});
	
	tasks.add(task1);
	tasks.add(task2);
	
	
	console.log(tasks.tasksList);
		
	var source = $("#task-template").html();
	var template = Handlebars.compile(source);
	var data = {
		tasksList: tasks.getAll()
	};
	
	var output = template(data);
	$(".tasks-list").html(output);

//});