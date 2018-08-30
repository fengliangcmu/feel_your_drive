angular.module('CarDashboard').factory('Config', [function() {

    return {

        host : 'localhost', //mqtt service address
        port : 61614,
        topic : 'feng/location',        // topic to subscribe to
        topic_car_info: 'feng/obd',
        topic_harsh_deceleration: 'feng/hash_deceleration',
        topic_harsh_acceleration: 'feng/hash_acceleration',
        useTLS: false,
        username: null,
        password: null,
        cleansession: true
    };
}]);