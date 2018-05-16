import requests 
import time
import json
import traceback

t = '{}'
j = ''

while (True) :
    try :
        r = requests.get('http://119.235.252.13:777/load/jsonForRaspberry/9988776655')
        j = r.text
        if (t == j) :
            print ('no update')
        else :
            print ('any update')

            jsonCloud = json.loads(j)
            jsonRaspi = json.loads(t)
            
            try :
                for x in jsonCloud["zone"] :
                    if jsonCloud["zone"][x]["status"] != jsonRaspi["zone"][x]["status"] :
                        status = jsonCloud["zone"][x]["status"]
                        sort   = jsonCloud["zone"][x]["sort"]
                        command = ''
                        status_from = jsonCloud["zone"][x]["status_from"]
                        if status_from == "away" :
                            if status == 'on' :
                                if sort == 'light' :
                                    #if 'dim_level' in jsonCloud["zone"][x]:
                                    if 'dim_level' in jsonCloud["zone"][x] :
                                        command = jsonCloud["zone"][x]["dim_level"]
                                    else :
                                        command = '100'
                                    param = jsonCloud["zone"][x]["command"]
                                elif sort == 'ac' :
                                    command = '1'
                                    param = 'AC/' + jsonCloud["zone"][x]["command"]
                                ipAddress = jsonCloud["controller"][jsonCloud["zone"][x]["controllerName"]]["ip"]
                                url = 'http://' + ipAddress + '/' + param + '/?value=' + command
                                requests.get(url)
                                print 'eksekusi!'
                                print url
                            else :
                                if sort == 'light' :
                                    command = '0'
                                    param = jsonCloud["zone"][x]["command"]
                                elif sort == 'ac' :
                                    command = '5'
                                    param = 'AC/' + jsonCloud["zone"][x]["command"]
                                ipAddress = jsonCloud["controller"][jsonCloud["zone"][x]["controllerName"]]["ip"]
                                url = 'http://' + ipAddress + '/' + param + '/?value=' + command
                                requests.get(url)
                                print 'eksekusi!'
                                print url
                     
                        
            except Exception, e:
                print 'masuk sini ' + str(e)
            
            f = open('/home/pi/blive-server/fileJson.json','w')
            f.write(j)
            f.close()
            
            t = j
    except :
        print ('tidak ok')
    time.sleep(1)
