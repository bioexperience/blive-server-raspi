var express	= require('express');
var app	= express();
var session = require('express-session');
var request = require('request');
var fs = require('fs');
/* JsonDB */
var JsonDB = require('node-json-db');
const appPath = '/home/pi/blive-server-raspi/';

// show device list for mobile apps
app.get('/load/allData/:rpiId', function(req, res) {
	// dbRaspberryToLoad = loadJsonDb();
	let rawdata = fs.readFileSync( appPath + 'jsonDb.json');
	var dbRaspberryToLoad = JSON.parse(rawdata);
	var deviceList = [];
	var dataZone = dbRaspberryToLoad.zone;
	var jsonData = {};
	for (x in dataZone) {
		
		try {
			roomName = dbRaspberryToLoad.room[dataZone[x].roomName].name;
			ipAddress = dbRaspberryToLoad.getData("/controller/" + dataZone[x].controllerName).ip;

			dataZone[x].zoneId		= x;
			dataZone[x].ipAddress   = ipAddress;
			dataZone[x].roomName = roomName;
			
			delete dataZone[x].controllerName;
			delete dataZone[x].command;
						
			deviceList.push(dataZone[x]);
		} catch(error) {
			console.log('error: ' + error);
		}
	}
	jsonData.devices = deviceList;
	// console.log(jsonData);
	
	res.send(jsonData);
});



// // execute command in device
app.get('/execute/:rpiId/:zoneId/:commandVal', function(req, res) {
	try {
			jsonDb = loadJsonDb();	
			zoneId = req.params.zoneId;
			commandVal = req.params.commandVal;
			userId = req.params.rpiId;
			getDevice = getDeviceDetail(jsonDb, zoneId);
			// device without rf
			if (getDevice.rf == 'false') {
				filterDevices(getDevice, zoneId, jsonDb, commandVal);
				// set to home
				jsonDb.push("/zone/" + zoneId, {status_from : "home"}, false);
				// generate url
				var url = 'http://' 
							+ getDevice.ipAddress 
							+ '/' 
							+ getDevice.command 
							+ '/?value=' 
							+ commandVal;
				// get data from json db 
				objCoba 	 = jsonDb.getData('/');
				myJSONObject = {'foo' : JSON.stringify(objCoba)};
				// send to cloud server
				sendToCloud(myJSONObject, userId);
				// Control device
				controlDevice(url);
				// send to cloud new status

			}
			// device with rf 
			else {
				command = getDevice.command;
				command = command.split(',');
				command = command[commandVal];
				if (commandVal == 0) { jsonDb.push("/zone/" + zoneId, {status : "off"}, false); }
				if (commandVal == 1) { jsonDb.push("/zone/" + zoneId, {status : "on"}, false); }
				var fsFrValue = require('fs');
				var frValue = fsFrValue.createWriteStream('frValue.txt', {flags: 'w'});
				frValue.write(command);

				res.send('RF!');
			}
			res.send(url);

	} catch (e) {
		res.send('error occured: ' + e);
	}

});

function loadJsonDb(){
	//The First argument is filename
	//The second argument is used to tell the DB to save after each push 
	//If you put false, you'll have to call the save() method. 
	//The third argument is to ask JsonDB to save the database in an human readable format. (default false)
    jsonDb = new JsonDB('/home/pi/blive-server-raspi/jsonDb', true, false);

    return jsonDb;
}

function controlDevice(url) {
	var callback = "";
	request({
		url: url,
		method: "GET",
		async: true,
		}, function (error, response, body){
			if (error == null) {
				// responseBody = body.split(" ");
				// callback = responseBody[1];
				console.log("url: " + url + " Response Code: " + response.statusCode);
				// // console.log(urlnya + ' ' + callback.toLowerCase());
				// updateStatus 	= new JsonDB('jsonDb', true, false);
				// switch(callback.toLowerCase()){
				// 	case "on":
				// 		updateStatus.push("/zone/" + zoneId, {status : callback.toLowerCase()}, false); 
				// 	break;
				// 	case "off":
				// 		updateStatus.push("/zone/" + zoneId, {status : callback.toLowerCase()}, false); 
				// 	break;
				// response.send("success");
				// }
				
				//res.send(callback.toLowerCase());
				// callback = "success";
			}
			else {
				console.log(error);
				// response.send("error");
				// callback = "error";
			}
	});
	// TODO: return status of devices using callback variable
	
	return callback;
}

function sendToCloud(data, userId){
	request({
		url: "http://119.235.252.13:777/saveFromRaspberry/" + userId,
		method: "POST",
		json: true,   // <--Very important!!!
		body: data,
		async: true,
	}, function (error, response, body){
		// console.log('');
		// response.send('sukses');
	});
}

function filterDevices(getDevice, zoneId, jsonDb, commandVal){
	
	switch (getDevice.sort) {
		case 'ac' :
			// 1 = ON, 5 = OFF
			switch(commandVal) {
				case '5':
					jsonDb.push("/zone/" + zoneId, {status : "off"}, false); 
				break;
				case '1':
					jsonDb.push("/zone/" + zoneId, {status : "on"}, false); 
				break;
				default:

				break;
			}
		break;
		case 'light' :
			switch(commandVal) {
				case '0':
					jsonDb.push("/zone/" + zoneId, {status : "off"}, false); 
				break;
				default:
					jsonDb.push("/zone/" + zoneId, {status : "on"}, false); 
				break;
			}
		break;
		case 'tv' :
			if (commandVal == 0) { 
				jsonDb.push("/zone/" + zoneId, {status : "off"}, false); 
			}
			else { 
				jsonDb.push("/zone/" + zoneId, {status : "on"}, false); 
			}
		break;
	}
}

function getDeviceDetail(jsonDb, zoneId) {
	var dataZone = jsonDb.getData("/zone");
	var ipAddress = jsonDb.getData("/controller/" + dataZone[zoneId].controllerName).ip;
	dataZone[zoneId].zoneId	= x;
	dataZone[zoneId].ipAddress = ipAddress;
	
	return dataZone[zoneId];
}

/* Listening Port */
app.listen(9090, function() {
	console.log('server has been start with port: 9090');
});

