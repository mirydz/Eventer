
$(document).ready(function() {
	function Task(title) {
		this.title = title;
	}
	
	var tasks = [];
	
	var task1 = new Task("buy milk");
	var task2 = new Task("go to gym");
	
	tasks.push(task1, task2);
	
	console.log(tasks);
	
});