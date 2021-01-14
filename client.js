//function to send the login information to the server
function login(){
	//grab the error tag to potentially update
	let error = document.getElementById("error");
	//ensure that it is empty for now
	error.innerHTML = "";
	//get the username and password from the textboxes
	let username = document.getElementById("username");
	let password = document.getElementById("password");
	//create an object to be sent to the server
	let loginInfo = {username: username.value, password: password.value};
	//
	let request = new XMLHttpRequest();
	//make an http request to the server
	request.onreadystatechange = function(){	
		if(this.readyState == 4 && this.status == 200){ //if its reggie
			//if it is successful, alert the user and output a confirmation message to console
			temp = this.responseText
			console.log(temp);
			alert("Successfully logged in!");
			//redirect to the user's profile 
			//the .replace is to remove the extra quotation marks
			window.location.replace("http://localhost:3000/users/"+this.responseText.replace(/[^a-zA-Z0-9 ]/g, ""));
		//if the login was unsuccesful update the error tag to display that the user made an error
		}else if (this.readyState == 4 && this.status == 401){
			temp = this.responseText;
			error.textContent = temp;
			error.style.color = "red";
		}
	}
	request.open("POST","http://localhost:3000/login",true);
	request.setRequestHeader('Content-type', 'application/json');
	request.send(JSON.stringify(loginInfo));
}
//function to send the register information to the server
function register(){
	//grab the username and password from the textboxes
	let username = document.getElementById("username");
	let password = document.getElementById("password");
	//create new object to send to server with request
	let registrationInfo = {username: username.value, password: password.value};
	let request = new XMLHttpRequest();
	request.onreadystatechange = function(){	
		if(this.readyState == 4 && this.status == 200){ //if its reggie
			//if it is successful, alert the user and output a confirmation message to console
			temp = this.responseText
			alert("Successfully Registered!");
			//redirect the user to their new profile
			window.location.replace("http://localhost:3000/users/"+this.responseText.replace(/[^a-zA-Z0-9 ]/g, ""));
		//if they chose a username that already exists let them know with the error tag
		}else if (this.readyState == 4 && this.status == 401){
			temp = this.responseText;
			error.textContent = temp;
			error.style.color = "red";
		}
	}
	request.open("POST","http://localhost:3000/register",true);
	request.setRequestHeader('Content-type', 'application/json');
	request.send(JSON.stringify(registrationInfo));
}
//function to save the current state of the user's privacy settings
function save(){
	//get the information from the pug file
	let username = document.getElementById("username").name;
	//get the radio button that is currently clicked
	let privacy = false;
	if (document.getElementById("on").checked){
		privacy = true;
	}
	//create new object to send to server
	let saveInfo = {privacyOn: privacy, name: username};
	let request = new XMLHttpRequest();
	request.onreadystatechange = function(){
		//if it is successful, alert the user
		if(this.readyState == 4 && this.status == 200){
			let temp = this.responseText;
			console.log(temp);
			alert("Saved!");
		}
	}
	request.open("POST","http://localhost:3000/save",true);
	request.setRequestHeader('Content-type', 'application/json');
	request.send(JSON.stringify(saveInfo));
}
