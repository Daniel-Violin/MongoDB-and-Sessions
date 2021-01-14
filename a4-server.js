//Database variables
let mongo = require('mongodb');
let mongoClient = mongo.MongoClient;
let database;

const express = require('express');
const session = require('express-session')
const ObjectID = require('mongodb').ObjectID;
let app = express();
//object to be sent into my pug files
let pugInfo;
//creating the sessiondata collection
const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/a4',
  collection: 'sessiondata'
});
//we'll be using pug for this assignment
app.set("view engine", "pug");

app.use(session({ secret: 'some secret here', store: store }))
app.use(express.static(__dirname));
app.use(express.json());
//Get request to the home page
app.get('/', (req, res,next) => {
	if (req.session.loggedin === undefined){
		//start as logged out
		req.session.loggedin = false;
	}
	//render the index page with pugInfo
	pugInfo = {isLoggedIn: req.session.loggedin, name: req.session.username, id : req.session.currentID}
	res.render("pages/index", {pugInfo}); 
	});
//Get request to the login page
app.get('/login', (req, res,next) => {
	//render the login page with pugInfo
	pugInfo = {isLoggedIn: req.session.loggedin, name: req.session.username,id : req.session.currentID}
	res.render("pages/login",{pugInfo}); 
	});
//Get request to the register page
app.get('/register', (req,res,next)=>{
	if (req.session.loggedin === undefined){
		//start as logged out
		req.session.loggedin = false;
	}
	//render the register page with pugInfo
	pugInfo = {isLoggedIn: req.session.loggedin, name: req.session.username,id : req.session.currentID}
	res.render("pages/register", {pugInfo});
});
//Log the user out from the session
app.get('/logout', (req, res, next) => {
	req.session.loggedin = false;
	req.session.username = null;
	req.session.currentID = null;
	//render the index page with pugInfo
	pugInfo = {isLoggedIn: req.session.loggedin, name: req.session.username,id : req.session.currentID}
	res.render("pages/index", {pugInfo}); 
});
//get request to the users page 
app.get('/users', (req, res, next) => {
	
	//search for profiles that are not private
	if (req.query.name === undefined){
	database.collection("users").find({privacy : false }).toArray(function(err,result){
		if(err) throw err;
		//ensure logged in is not undefined
		if (req.session.loggedin === undefined){
			req.session.loggedin = false;
		}
		//render the users page with the array from the database search
		pugInfo = {isLoggedIn: req.session.loggedin, name: req.session.username, list: result,id : req.session.currentID};
		res.render("pages/users", {pugInfo}); 
	});
	//search for profiles that match the query string
	}else{
		database.collection("users").find({privacy : false }).toArray(function(err,result){
			if(err) throw err;
		
			//ensure logged in is not undefined
			if (req.session.loggedin === undefined){
				req.session.loggedin = false;
			}
			let privateAndQuery = [];
			//loop through array and compare the values while ignoring case (set them to lower)
			for (let i = 0; i < result.length;i++){
				let temp = result[i].username.toLowerCase();
				if (temp.includes(req.query.name.toLowerCase())){
					privateAndQuery.push(result[i]);
				}
			}
			//render the users page with pug info
			pugInfo = {isLoggedIn: req.session.loggedin, name: req.session.username, list: privateAndQuery,id : req.session.currentID};
			res.render("pages/users", {pugInfo}); 
		});
	}
});
//get request to the order food tab
app.get('/order', (req, res,next) => {
	pugInfo = {isLoggedIn: req.session.loggedin, name: req.session.username,id : req.session.currentID};
	if (req.session.loggedin == false){
		res.status(404).send("please login or register before attempting to place an order");
	}
	//render the orderform using puginfo
	res.render("pages/orderform", {pugInfo});
	});
//get request to a specific user id
app.get('/users/:uID', (req, res, next) =>{
	//get the uID from the url
	let id = req.params.uID;
	//search the database for a user with the same ID
	database.collection("users").findOne({_id : ObjectID(id)},function(err, result){
		if(err) throw err;
		//if the id exists, is privated and the current session username is not the username of the id then we send a 404 request
		if (result && (result.privacy && result.username !== req.session.username)){
			res.status(404).send("Cannot access a private profile");
		//otherwise render the profile
		}else{
			if (result !== null){
				//search for any orders that this account may have made
				database.collection("orders").find({customer : id}).toArray(function(err,result2){
					if (err) throw err
					if (result2){
						//a variable added to pugInfo to check if the privacy settings should be visible to the current session's user
						let edit = false;
						if (req.session.username === result.username){
							edit = true;
						};
						//render the profile using pug info
						pugInfo = {orders: result2, privacy: result.privacy, isLoggedIn: req.session.loggedin, name: req.session.username, name2: result.username, id : req.session.currentID, canEdit: edit};
						res.render("pages/profile", {pugInfo});
					}
				});
			}
		}
	});
});
//get request to a specific order summary page
app.get('/orders/:orderID', (req, res, next) =>{
	//get the id from the url
	let id = req.params.orderID;
	//find the order with the order with the id from the paramaters
	database.collection("orders").findOne({_id : ObjectID(id)},function(err, result){
		if (err) throw err;
		if (result){
			//search the users colelction for the user that placed the order
			database.collection("users").findOne({_id : ObjectID(result.customer)}, function(err2,result2){
				if (err2) throw err2;
				//if the user's profile is private and the session user is not the same then send a 404 request.
				if (result2 && (result2.privacy && result2.username !== req.session.username)){
					res.status(404).send("Cannot access orders of a private profile");
				//otherwise render the orderSummary page with pugInfo
				}else{
					if (result2 !== null){
						pugInfo = {id : req.session.currentID,name: req.session.username,isLoggedIn: req.session.loggedin, orderNum: id,resName: result.resName, placedBy: result2.username, subtotal: result.subtotal, tax:result.tax, delivery:result.fee, total:result.total, order:result.order};
						console.log(pugInfo);
						res.render("pages/orderSummary", {pugInfo});
					}
				}
			});
		}
	});
});
//post request to attempt to login to the database
app.post('/login', (req,res,next) => {
	//get the information sent from client
	let temp = req["body"];
	let username = temp["username"];
	let password = temp["password"];
	//search the database for the username
	database.collection("users").findOne({username: username}, function(err, result){
		if(err)throw err;
		
		//if the username exists
		if(result){
			//check if the passwords match
			if(result.password === password){
				//update the session information to say that that user is logged in
				req.session.loggedin = true;
				req.session.username = username;
				req.session.currentID = result._id
				//return an okay status and the currentID of the user so the client can redirect to the profile page
				res.status(200).send(req.session.currentID);
			//otherwise the password is incorrect, send a 401 error
			}else{
				res.status(401).send("Not authorized. Invalid password.");
			}
		//if the username doesnt exist send a 401 error
		}else{
			res.status(401).send("Not authorized. Invalid username.");
			return;
		}
		
	});
});
//post request to register a new user to the database
app.post('/register', (req,res,next) => {
	//get the information from the client
	let temp = req["body"];
	let username = temp["username"];
	let password = temp["password"];
	//search the database for the username they wish to register with
	database.collection("users").findOne({username: username}, function(err, result){
		if(err)throw err;
		
		//if that username is already in use, send a 401 request to the client
		if(result){
			res.status(401).send("Not authorized. Username already in use.");
		//if it isnt in use then allow them to register
		}else{
			//if the registration will be successful, update the session data and send 200
			//create a new user with all the necessary attributes
			let newUser = {username: username, password: password, privacy: false};
			//add that user to the users collection
			database.collection("users").insertOne(newUser, function(err, result) {
				if (err) throw err;
				//if successful then update the session data to log that new user in and return a 200 status
				if(result){
					req.session.loggedin = true
					req.session.username = username;
					req.session.currentID = result.insertedId;
					res.status(200).send(req.session.currentID);
				}
			});
			
		}
		
	});
});
//post request from orderform.js to save the order on the server
app.post('/orders', (req,res,next) => {
	//get the information from the client
	let temp = req["body"];
	//create an object to send to server
	let order = {customer : temp["username"], resID : temp["restaurantID"], resName : temp["restaurantName"], subtotal : temp["subtotal"].toFixed(2), total : temp["total"].toFixed(2), fee: temp["fee"].toFixed(2), tax: temp["tax"].toFixed(2), order: temp["order"] };
	//create a new collection if orders doesnt exist (this function does nothing if the collection already exists)
	database.createCollection("orders", function(err, result) {
		if (err) throw err;
		//insert the new order into the orders collection
		database.collection("orders").insertOne(order, function(err, result) {
			if (err) throw err;
			//send 200 when successful
			res.status(200).send("success!");
		});
		
	});
});
//post request from the client.js file to save the privacy settings of a profile
app.post('/save', (req,res,next) => {
	//get the information from the client
	let temp = req["body"];
	let privacy = temp["privacyOn"]
	let username = temp["name"]
	
	let info = { username: username };
	let newvalues = { $set: { privacy: privacy } };
	//update the privacy settings of the client with that username and save it in the database
	database.collection("users").updateOne(info, newvalues, function(err, result) {
		if (err) throw err;
		//send a 200 status
		res.status(200).send("Saved!");
	});
});
mongoClient.connect("mongodb://localhost:27017/", function(err, client) {
  if(err) throw err;

  //Get the a4 database
  database = client.db('a4'); 
  
  // Start server once Mongo is initialized
  app.listen(3000);
  console.log("Listening on port 3000");
});