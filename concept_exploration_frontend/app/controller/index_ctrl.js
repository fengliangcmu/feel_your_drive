angular.module('CarDashboard').controller('index_ctrl', ['$scope', '$location', '$rootScope', 'Config', '$http', '$timeout', '$window',
  function($scope, $location, $rootScope, Config, $http, $timeout, $window) {

    //###############
    // debug info panel
    //###############
    $scope.isDebugInfoShown = false;

    //###############
    // MTQQ stuff
    //###############

    var mqtt;
    var reconnectTimeout = 2000;

    function MQTTconnect() {
      if (typeof Config.path === "undefined") {
        Config.path = '/mqtt';
      }
      mqtt = new Paho.MQTT.Client(
        Config.host,
        Config.port,
        Config.path,
        "web_" + parseInt(Math.random() * 100, 10)
      );
      var options = {
        timeout: 3,
        useSSL: Config.useTLS,
        cleanSession: Config.cleansession,
        onSuccess: onConnect,
        onFailure: function(message) {
          $('#status').val("Connection failed: " + message.errorMessage + "Retrying");
          setTimeout(MQTTconnect, reconnectTimeout);
        }
      };

      mqtt.onConnectionLost = onConnectionLost;
      mqtt.onMessageArrived = onMessageArrived;

      if (Config.username != null) {
        options.userName = Config.username;
        options.password = Config.password;
      }
      console.log("Host=" + Config.host + ", port=" + Config.port + ", path=" + Config.path + " TLS = " + Config.useTLS + " username=" + Config.username + " password=" + Config.password);
      mqtt.connect(options);
    }

    function onConnect() {
      $('#status').val('Connected to ' + Config.host + ':' + Config.port + Config.path);
      // Connection succeeded; subscribe to our topic
      mqtt.subscribe(Config.topic, {
        qos: 0
      });
      mqtt.subscribe(Config.topic_car_info, {
        qos: 0
      });
      mqtt.subscribe(Config.topic_harsh_deceleration, {
        qos: 0
      });
      mqtt.subscribe(Config.topic_harsh_acceleration, {
        qos: 0
      });

      $('#topic').val(Config.topic + ' & ' + Config.topic_car_info + ' & ' + Config.topic_harsh_deceleration + ' & ' + Config.topic_harsh_acceleration);
    }

    function onConnectionLost(response) {
      setTimeout(MQTTconnect, reconnectTimeout);
      $('#status').val("connection lost: " + responseObject.errorMessage + ". Reconnecting");
    }

    function onMessageArrived(message) {
      var topic = message.destinationName;
      var payload = message.payloadString;
      $('#ws').prepend('<li>' + topic + ' = ' + payload + '</li>');
      var resArr = payload.split(",");


      if (topic === 'feng/location') {
        var coordinate = {
          lat: Number(resArr[1]),
          lng: Number(resArr[2])
        };
        renderMap(coordinate);
      }

      if (topic === 'feng/obd') {
        renderCarDashboard(resArr);
      }

      if (topic === 'feng/hash_deceleration' || topic === 'feng/hash_acceleration') {
        renderTableInfo(resArr, topic);
      }

    }

    MQTTconnect();


    //###############
    // Google Map Stuff
    //###############

    $scope.mapCoordinates = [];

    function renderMap(newCoordinate) {
      var mapOptions = {
        zoom: 18,
        //center: new google.maps.LatLng(37.395782, -122.070710),
        center: new google.maps.LatLng(newCoordinate.lat, newCoordinate.lng),
        mapTypeId: google.maps.MapTypeId.ROADMAP
          // ROADMAP (normal, default 2D map)
          // SATELLITE (photographic map)
          // HYBRID (photographic map + roads and city names)
          // TERRAIN (map with mountains, rivers, etc.)
      };

      if (!$scope.map) {
        $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
      }

      $scope.mapCoordinates.push(newCoordinate);

      var carPath = new google.maps.Polyline({
        path: $scope.mapCoordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 4
      });

      carPath.setMap($scope.map);

      var image = {
        url: 'img/car_nav.png',
        scaledSize: new google.maps.Size(32, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(16, 16)
      };

      if ($scope.carMarker) {
        $scope.carMarker.setMap(null);
      }
      $scope.carMarker = new google.maps.Marker({
        position: newCoordinate,
        map: $scope.map,
        icon: image
      });

      //check if car is still in the boundries
      if(!$scope.map.getBounds().contains($scope.carMarker.getPosition())){
        $scope.map.setCenter(newCoordinate);
      }

    }


    //###############
    // Car Dashboard
    //###############
    $scope.ENGINE_RPM = 0;
    $scope.FUEL_LEVEL = 0;
    $scope.ENGINE_COOLANT_TEMP = 0;
    $scope.SPEED = 0;

    var myChart = echarts.init(document.getElementById('dash_board'));
    renderCarDashboard();

    function renderCarDashboard(data) {
      //data manipulation
      // speed     6    0km/h
      // ENGINE_COOLANT_TEMP   0C
      // ENGIN_RPM    -1RPM
      // FUEL_LEVEL   0.0%
      if (data) {
        var dataDesc = data[2];
        var txt = data[5];
        var value = 0;
        if (dataDesc.indexOf('ENGINE_RPM') >= 0) {
          value = txt.substring(0, txt.length - 3);
          $scope.ENGINE_RPM = Number(value) / 1000;
          console.log("####OBD ENGINE_RPM:" + value + "   " + $scope.ENGINE_RPM);
        }
        if (dataDesc.indexOf('FUEL_LEVEL') >= 0) {

          value = txt.substring(0, txt.length - 1);
          $scope.FUEL_LEVEL = Number(value) / 100;

          if(value < 20){
            showAssistantInfo(value);
          }

          console.log("####OBD FUEL_LEVEL:" + value + "   " + $scope.FUEL_LEVEL);
        }
        if (dataDesc.indexOf('ENGINE_COOLANT_TEMP') >= 0) {

          value = txt.substring(0, txt.length - 1);
          $scope.ENGINE_COOLANT_TEMP = value;
          console.log("####OBD ENGINE_COOLANT_TEMP:" + value + "   " + $scope.ENGINE_COOLANT_TEMP);
        }
        if (dataDesc.indexOf('SPEED') >= 0) {

          value = txt.substring(0, txt.length - 4);
          $scope.SPEED = Math.round(Number(value) * 0.621);
          console.log("####OBD SPEED:" + value + "   " + $scope.SPEED);
        }

      }

      // $scope.ENGINE_RPM = Math.random()*5;
      // $scope.FUEL_LEVEL = Math.random();
      // $scope.ENGINE_COOLANT_TEMP = Math.random();
      // $scope.SPEED = Math.random()*100;

      var option = {
        tooltip: {
          formatter: "{a} <br/>{c} {b}"
        },
        toolbox: {
          show: false,
          feature: {
            mark: {
              show: true
            },
            restore: {
              show: true
            },
            saveAsImage: {
              show: true
            }
          }
        },
        series: [{
          name: 'Speed',
          type: 'gauge',
          z: 3,
          min: 0,
          max: 160,
          splitNumber: 8,
          radius: '95%',
          axisLine: { 
            lineStyle: { 
              width: 10
            }
          },
          axisTick: { 
            length: 15, 
            lineStyle: { 
              color: 'auto'
            }
          },
          splitLine: { 
            length: 20, 
            lineStyle: { 
              color: 'auto'
            }
          },
          title: {
            textStyle: { 
              fontWeight: 'bolder',
              fontSize: 15,
              fontStyle: 'italic'
            }
          },
          detail: {
            textStyle: { 
              fontWeight: 'bolder'
            }
          },
          data: [{
            value: $scope.SPEED,
            name: 'MPH'
          }]
        }, {
          name: 'RPM',
          type: 'gauge',
          center: ['25%', '55%'], 
          radius: '80%',
          min: 0,
          max: 7,
          endAngle: 45,
          splitNumber: 7,
          axisLine: { 
            lineStyle: { 
              width: 8
            }
          },
          axisTick: { 
            length: 12, 
            lineStyle: { 
              color: 'auto'
            }
          },
          splitLine: { 
            length: 20, 
            lineStyle: { 
              color: 'auto'
            }
          },
          pointer: {
            width: 5
          },
          title: {
            offsetCenter: [0, '-30%'], 
            textStyle: {
              fontWeight: 'bolder',
              fontSize: 10,
              fontStyle: 'italic'
            }
          },
          detail: {
            textStyle: {
              fontWeight: 'bolder'
            }
          },
          data: [{
            value: $scope.ENGINE_RPM,
            name: 'x1000 r/min'
          }]
        }, {
          name: 'Gas',
          type: 'gauge',
          center: ['75%', '52%'],
          radius: '75%',
          min: 0,
          max: 1,
          startAngle: 135,
          endAngle: 45,
          splitNumber: 2,
          axisLine: { 
            lineStyle: {
              width: 8,
              color: [[0.2, '#C23531'],[0.8, '#63869E'],[1, '#91C7AE']], 
            }
          },
          axisTick: {
            splitNumber: 5,
            length: 10,
            lineStyle: {
              color: 'auto'
            }
          },
          axisLabel: {
            formatter: function(v) {
              switch (v + '') {
                case '0':
                  return 'E';
                case '0.5':
                  return 'Gas';
                case '1':
                  return 'F';
              }
            }
          },
          splitLine: {
            length: 15, 
            lineStyle: {
              color: 'auto'
            }
          },
          pointer: {
            width: 2
          },
          title: {
            show: false
          },
          detail: {
            show: false
          },
          data: [{
            value: $scope.FUEL_LEVEL,
            name: 'gas'
          }]
        }, {
          name: 'Water',
          type: 'gauge',
          center: ['75%', '52%'],
          radius: '75%',
          min: 0,
          max: 100,
          startAngle: 315,
          endAngle: 225,
          splitNumber: 2,
          axisLine: { 
            lineStyle: { 
              width: 8
            }
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            formatter: function(v) {
              switch (v + '') {
                case '0':
                  return 'L';
                case '50':
                  return 'Water';
                case '100':
                  return 'H';
              }
            }
          },
          splitLine: {
            length: 15, 
            lineStyle: { 
              color: 'auto'
            }
          },
          pointer: {
            width: 2
          },
          title: {
            show: false
          },
          detail: {
            show: false
          },
          data: [{
            value: $scope.ENGINE_COOLANT_TEMP,
            name: '℃ water temp'
          }]
        }]
      };

      myChart.setOption(option);
    }

    //###############
    // Table Info
    //###############
    $scope.tableInfo = [];

    function renderTableInfo(data, topic) {
      if (data) {
        var len = $scope.tableInfo.length;
        if (len > 10) {
          $scope.tableInfo.shift();
        }

        var action = '';
        if (topic === 'feng/hash_deceleration') {
          action = 'deceleration';
        }
        if (topic === 'feng/hash_acceleration') {
          action = 'acceleration';
        }

        var timestamp = data[1];

        var actionItem = {
          time: new Date(parseFloat(timestamp)).toLocaleString(),
          action: action,
          location: $scope.mapCoordinates[$scope.mapCoordinates.length - 1]
        };
        $scope.tableInfo.push(actionItem);
        $scope.$apply();
      }
    }

    //###############
    // assistant stuff
    //###############

    $scope.assistantTable = [];
    //   var tmpItem = {
    //     name: 'Low Fuel',
    //     solution: [
    //       'gas station1',
    //       'gas station2',
    //       'gas station3',
    //     ]
    //   };
    // $scope.assistantTable.push(tmpItem);

    function showAssistantInfo(info) {

      if($scope.mapCoordinates.length <= 0){
        return;
      }

      $scope.assistantTable = [];
      var txt = info + '% fuel left! Find a nearby gas station!';
      var assistantItem = {
        name: 'Low Fuel',
        solution: [txt]
      };
      $scope.assistantTable.push(assistantItem);
      $scope.$apply();
      // var request = {
      //   location: $scope.mapCoordinates[$scope.mapCoordinates.length - 1], //current center
      //   radius: '2000',
      //   types: ['gas_station']
      // };

      // var service = new google.maps.places.PlacesService($scope.map);
      // service.nearbySearch(request, function(results, status) {
      //   if (status === google.maps.places.PlacesServiceStatus.OK) {
      //     for (var i = 0; i < results.length; i++) {
      //       var place = results[i];
      //       assistantItem.solution.push(place);
      //       //createMarker(results[i]);
      //     }

      //     $scope.assistantTable.push(assistantItem);
      //   }
      // });

    }

  }
]);