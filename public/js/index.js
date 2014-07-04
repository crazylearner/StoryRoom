function init(){
	
	var domainURL = document.domain;
	
	var socket = io.connect(domainURL);
	var sessionID = "";
	
	var userData = {};
	
	$.ajax({
			  url:  '/isAuthentic',
			  type: 'GET',
			  dataType: 'json',
			  data: {}
			}).done(function(data){
				var isAuth = data.isAuth; 
				var user = data.user;
				if(!isAuth){
							$("#userInfoDialog").modal("show");
				}else{
					if(user != undefined){
						userData.username = user;
						$("#welcomeTag")[0].innerText = "Welcome " + user + "!";
					}else
						$("#userInfoDialog").modal("show");
				}
			
			});
	
	socket.on("connect", function(){
		//alert(socket.io.engine.id);
	});
	socket.on("newStoryAdded", function(){
		$.reloadSection('#dashboard');
	});
	socket.on("newTaskAdded", function(data){
		$.reloadSection('#dashboard');
	});
	socket.on("taskAssignmentChanged", function(data){
		$.reloadSection('#dashboard');
	});
	function setStoryID(){
		 var id= $(this).data('id');
		 $("#storyIDforTasks")[0].innerText = id;
	}
	
	function saveStory(event){
		var title = $("#title").val();
		var description = $("#desc").val();
		
		var data = {title: title, description: description};
		
		$.ajax({
			  url:  '/createStory',
			  type: 'POST',
			  dataType: 'json',
			  data: data
			});
		$('#myModal').modal('hide');
	}
	function saveTask(){
		var storyID = $("#storyIDforTasks")[0].innerText;
		var taskTitle = $("#taskTitle").val();
		var taskDesc = $("#taskDesc").val();
		var priority = $("#priority").val();
		
		var data = {storyID: storyID, taskTitle: taskTitle, taskDesc: taskDesc, priority:priority};
		$.ajax({
			  url:  '/createTask',
			  type: 'POST',
			  dataType: 'json',
			  data: data
			});
		$('#newTaskDialog').modal('hide');
	}
	
	function saveUser(){
		var username = $("#userName").val();
		var password = $("#password").val();
		userData.username = username;
		userData.password = password;
		$.ajax({
			  url:  '/login',
			  type: 'POST',
			  dataType: 'json',
			  data: userData
			});
		$("#userInfoDialog").modal("hide");
	}
	function assignToMe(){
		var taskId = $(this).data("taskid");
		$.ajax({
			  url:  '/assignTask',
			  type: 'POST',
			  dataType: 'json',
			  data: {username: userData.username,taskId: taskId }
		});
	
	}
	function unassignTask(){
		var taskId = $(this).data("taskid");
		$.ajax({
			  url:  '/unassignTask',
			  type: 'POST',
			  dataType: 'json',
			  data: {username: userData.username,taskId: taskId }
		});
	}
	
	$.reloadSection = function (id) {
	  var q = window.location.pathname + (window.location.search || "") + " " + id;
	  $(id).load(q, function () {
		$(".assigntome").on("click", assignToMe);
		$(".unassign").on("click", unassignTask);
		$("#welcomeTag")[0].innerText = "Welcome " + userData.username + "!";
	  });
	};
	
	$("#saveStory").on("click", saveStory);
	$("#saveTask").on("click", saveTask);
	$(".assigntome").on("click", assignToMe);
		$(".unassign").on("click", unassignTask);
	$(document).on("click","#newTaskBtns",setStoryID);
	$("#saveUserBtn").on("click", saveUser);
}

$(document).on("ready", init);