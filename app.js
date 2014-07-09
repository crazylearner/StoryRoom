var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io").listen(http);
var _ = require("underscore");
var passport = require('passport');
var Local = LocalStrategy = require('passport-local').Strategy;

//app.set("ipaddr", "10.192.69.195"); - Commented out since deploying on heroku does not need this. 
app.set("port", "5000");
app.set("views", __dirname + "/views");
app.set("view engine", "jade");

app.use(express.static("public", __dirname + "/public"));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'ilovescotchscotchyscotchscotch' }));
app.use(passport.initialize());
app.use(passport.session());

var userData = [{username: 'user1', password: 'user1'},
					{username: 'user2', password: 'user2'},
					{username: 'user3', password: 'user3'}];
					
passport.use(new LocalStrategy(
  function(username, password, done) {
    if(_.findWhere(userData, {username: username, password: password}) != undefined)
		done(null,{username: username, password: password});
	else
		done(null,false);
  }
));
passport.serializeUser(function(user, done) {
  done(null, user);
});
 
passport.deserializeUser(function(user, done) {
  done(null, user);
});

	
					
var stories = [ {
					title: "Create a team task app",
					id: "1",
					description: "This is my test story", 
					taskList: [
						{ taskid: "11",
						  taskTitle: "Create ui",
						  status: "Created",
						  ownedBy:"sow",
						  priority: 3						  
						}, 
						{ taskid: "12",
						  taskTitle: "Create Server",
						  status: "Created",
						  ownedBy:"sow"	,
						  priority: 3	 }
					]	  
				},
				{
					title: "Create a team task app",
					id: "2",
					description: "This is my test story", 
					taskList: [
						{ taskid: "21",
						  taskTitle: "Create ui",
						  status: "Created",
						  ownedBy:"sow"	,
						  priority: 3
   					    }, 
						{ taskid: "22",
						  taskTitle: "Create Server",
						  status: "Created",
						  ownedBy:"sow",
						  priority: 3		 }
					]	  
				}
			  ];
			  
app.get("/", function(request, response) {
	var isAuth;
	var user;
	if(request.isAuthenticated()){
		isAuth = true;
		user = (request.user != undefined)? request.user.username: undefined;
	}else
		isAuth = false;
	response.render("index", {stories: stories });
});
app.get("/isAuthentic", function(request, response) {
	var isAuth;
	var user;
	if(request.isAuthenticated()){
		isAuth = true;
		user = (request.user != undefined)? request.user.username: undefined;
	}else
		isAuth = false;
	response.send(200, {isAuth: isAuth, user: user });
});
app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureFlash: true })
);
app.post("/createStory", function(request, response) {
console.log(request.body);
	var title = request.body.title;
	var description = request.body.description;
	var id = "" +(stories.length + 1);
	
	var story = {title: title, description: description, id: id, taskList: []};
	stories.push({title: title, description: description, id: id, taskList: []});
	console.log(stories);
	io.sockets.emit("newStoryAdded",story);
	//response.render("index", {stories: stories });
	response.send(200, "New story added successfully");
	
});

app.post("/createTask", function(request, response) {
	var title = request.body.taskTitle;
	var description = request.body.taskDesc;
	var priority = request.body.priority;
	var storyId = request.body.storyID;
	//console.log("Before adding" + stories[2].id);
	console.log("Before adding" + storyId);
	var story = _.findWhere(stories, {id: storyId});
	console.log("Before adding" + story);
	var taskId = storyId + (story.taskList.length+1);
	
	var task = {taskid: taskId,
				taskTitle: title,
				taskDesc: description,
				status: "Created",
				ownedBy:"unassigned",
				priority: priority};
	story.taskList.push({taskid: taskId,
				taskTitle: title,
				taskDesc: description,
				status: "Created",
				ownedBy:"unassigned",
				priority: priority});
	console.log(story);
	
	io.sockets.emit("newTaskAdded",{refreshDomID: "collapsible"+storyId});
	//response.render("index", {stories: stories });
	response.send(200, "New story added successfully");
	
});
app.post("/assignTask", function(request,response){
	var user = request.body.username;
	var taskId = request.body.taskId;
	
	//var story = _.findWhere(stories, {taskList: [{taskid: taskId}});
	console.log(request.isAuthenticated());
	var task;
	_.each(stories, function(story) {
		//console.log(taskId);
		var task1 = _.findWhere(story.taskList, {taskid: taskId});
		//console.log(task1);
		if(task1 != undefined)
			task = task1;
	});
	console.log(task);
	task.ownedBy = user;
	io.sockets.emit("taskAssignmentChanged",{});
	//response.render("index", {stories: stories });
	response.send(200, "Task assigned successfully");
});
app.post("/unassignTask", function(request,response){
	var user = 'unassigned';
	var taskId = request.body.taskId;
	
	//var story = _.findWhere(stories, {taskList: [{taskid: taskId}});
	console.log(request.body);
	var task;
	_.each(stories, function(story) {
		//console.log(taskId);
		var task1 = _.findWhere(story.taskList, {taskid: taskId});
		//console.log(task1);
		if(task1 != undefined)
			task = task1;
	});
	console.log(task);
	task.ownedBy = user;
	io.sockets.emit("taskAssignmentChanged",{});
	//response.render("index", {stories: stories });
	response.send(200, "Task unassigned successfully");
});


io.on("connect", function(socket){
	console.log(socket.handshake.sessionID);
});

io.on("disconnect", function(){
	setTimeout(function () {
         console.log()
    }, 30000);
});


//while deplying on heroku, it uses its own port number, hence taking from process global data. 
http.listen(process.env.PORT || app.get("port"));
			  