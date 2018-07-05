try {
  var express  = require('express');
  var app  = express();
  var session = require('express-session');
  var request = require('request');
 
  const appPath = '/home/pi/blive-server-raspi/' ;
  /* JsonDB */
  var JsonDB = require('node-json-db');

  var requestLoop = setInterval(function(){
        var fs = require('fs');
        var scheduleData = JSON.parse(fs.readFileSync(appPath + 'schedule.json', 'utf8'));
        var date = new Date;
        var minutes = date.getMinutes();
        var hour = date.getHours();
        var seconds = date.getSeconds();
        if (scheduleData.start <= hour + ":" + minutes && scheduleData.finish >= hour + ":" + minutes) {
            // var rawdata = fs.readFileSync( appPath + 'jsonDb.json');
            var dbRaspberryToLoad = loadJsonDb();
            if (scheduleData.start == hour + ":" + minutes){
                scheduleData.schedule.forEach(function(item) {
                  deviceId = item.split("_");
                  getDevice = getDeviceDetail(dbRaspberryToLoad, deviceId[2]);
                  if (seconds <= 15) {
                      value = getValueOn(getDevice.sort);
                      url = "http://" + getDevice.ipAddress + "/" + getDevice.command + "/?value=" + value;
                      controlDevice(url);
                      dbRaspberryToLoad.push("/zone/" + deviceId, {status : "on"}, false);
                  }
                });
            }
            if (scheduleData.finish == hour + ":" + minutes) {
                scheduleData.schedule.forEach(function(item) {
                  deviceId = item.split("_");
                  getDevice = getDeviceDetail(dbRaspberryToLoad, deviceId[2]);
                  if (seconds <= 15) {
                    value = getValueOff(getDevice.sort);
                    url = "http://" + getDevice.ipAddress + "/" + getDevice.command + "/?value=" + value;
                    controlDevice(url);
                    dbRaspberryToLoad.push("/zone/" + deviceId, {status : "off"}, false);  
                  }
                });
            }
        }
    }, 1000);

    function getValueOff(sort) {
        command = "";
        switch(sort){
          case "light":
            command = "0";
          break;
          case "ac":
            command = "5";
          break;
          case "tv":
            command = "1";
          break;
          case "fan":
            command = "0";
          break;
          case "sg":
            command = "0";
          break;
        }

        return command;
    }

    function getValueOn(sort) {
        command = "";
        switch(sort){
          case "light":
            command = "100";
          break;
          case "ac":
            command = "1";
          break;
          case "tv":
            command = "1";
          break;
          case "fan":
            command = "100";
          break;
          case "sg":
            command = "100";
          break;
        }

        return command;
    }

    function controlDevice(url) {
        var callback = "";
        request({
          url: url,
          method: "GET",
          async: true,
          }, function (error, response, body){
            if (error == null) {
              console.log("url: " + url + " Response Code: " + response.statusCode);
            }
            else {
              console.log(error);
            }
        });
        
        return callback;
    }

    function loadJsonDb(){
        jsonDb = new JsonDB(appPath + 'jsonDb', true, true);

        return jsonDb;
    }

    function getDeviceDetail(jsonDb, zoneId) {
      var dataZone = jsonDb.getData("/zone");
      var ipAddress = jsonDb.getData("/controller/" + dataZone[zoneId].controllerName).ip;
      dataZone[zoneId].zoneId = zoneId;
      dataZone[zoneId].ipAddress = ipAddress;
      
      return dataZone[zoneId];
    }

  app.listen(9292, function() {
    console.log('server has been start with port: 9292');
  });
} catch(e) {
  console.log('error: ' + e);
}
 
