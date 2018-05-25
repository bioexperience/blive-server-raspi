try {
  var express  = require('express');
  var app  = express();
  var session = require('express-session');
  var request = require('request');
 
  const appPath = './' ;
  /* JsonDB */
  var JsonDB = require('node-json-db');

  var requestLoop = setInterval(function(){
        var fs = require('fs');
        var config = JSON.parse(fs.readFileSync(appPath + 'config.json', 'utf8'));
        console.log("http://119.235.252.13:777/load/jsonForRaspberry/" + config.raspberryId);
        request({
            url: "http://119.235.252.13:777/load/jsonForRaspberry/" + config.raspberryId,
            method: "GET",
        async: true,
        },function(error, response, body){
            if(!error && response.statusCode == 200){
              dbRaspi = JSON.stringify(readJson(body));
              dbCloud = body;
              if (dbRaspi == dbCloud) {
                  console.log('no update');
              }
              else {
                  console.log('any update');
                  parseJsonCloud = JSON.parse(dbCloud);
                  parseJsonRaspi = JSON.parse(dbRaspi);
                  zoneDevicesCloud = parseJsonCloud.zone;
                  zoneDevicesRaspi = parseJsonRaspi.zone;
                  for (var x in zoneDevicesCloud) {
                    try{
                      if (zoneDevicesCloud[x].status != zoneDevicesRaspi[x].status){
                          if (zoneDevicesCloud[x].status_from == "away") {
                              command = "";
                              switch(zoneDevicesCloud[x].status) {
                                case "on":
                                    switch(zoneDevicesCloud[x].sort){
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
                                    ipAddress = parseJsonCloud.controller[zoneDevicesCloud[x].controllerName].ip;
                                    url = "http://" + ipAddress + "/" + zoneDevicesCloud[x].command + "/?value=" + command;
                                    request({
                                      url: url,
                                      method: "GET",
                                      async: true,
                                      }, function (error, response, body){
                                        // response
                                    });
                                    console.log("Eksekusi: " + url);
                                break;
                                case "off":
                                    switch(zoneDevicesCloud[x].sort){
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
                                    ipAddress = parseJsonCloud.controller[zoneDevicesCloud[x].controllerName].ip;
                                    url = "http://" + ipAddress + "/" + zoneDevicesCloud[x].command + "/?value=" + command;
                                    request({
                                      url: url,
                                      method: "GET",
                                      async: true,
                                      }, function (error, response, body){
                                        // response
                                    });
                                    console.log("Eksekusi: " + url);
                                break;
                              }
                          }
                      }
                    }
                    catch(e){
                      console.log("Error: " + e);
                    }
                  }
                  writeJson(parseJsonCloud);
              }
            }
            else{
                console.log('error: ' + error);
            }

            function readJson(body = ''){
              var fs = require('fs');
              var jsonDb = fs.readFileSync(appPath + 'jsonDb.json', "utf8");
              if (jsonDb == "" || jsonDb == null || jsonDb == "{}"){
                  writeJson(JSON.parse(body));
              }
              return JSON.parse(jsonDb);
            }

            function writeJson(content) {
              var fs = require('fs');
              try{
                fs.writeFileSync(appPath + 'jsonDb.json', JSON.stringify(content));
              }
              catch(e){
                console.log('error: ' + e);
              }
            }
        });
    }, 1000);
  app.listen(9191, function() {
    console.log('server has been start with port: 9191');
  });
} catch(e) {
  console.log('error: ' + e);
}
 
