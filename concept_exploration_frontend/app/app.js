angular.module('CarDashboard', ['ngRoute',
        'ui.bootstrap',
        'routeStyles'
    ])
    .config(['$routeProvider', '$sceDelegateProvider',
        function($routeProvider, $sceDelegateProvider) {
            $routeProvider
                .when('/germany', {
                    templateUrl: 'app/pages/germany.html'
                    //controller: 'login_ctrl',
                    //css: "app/login.css",
                    //reloadOnSearch: false
                })
                .when('/unitedstates', {
                    templateUrl: 'app/pages/unitedstates.html'
                    //controller: 'dashboard_ctrl',
                    //reloadOnSearch: false // since we set the search string from the dashboard view, we have to avoid these unnecessery updates
                })
                .when('/china', {
                    templateUrl: 'app/pages/china.html'
                    //controller: 'parts_requested_ctrl'
                })
                .otherwise({
                    redirectTo: '/'
                });

            $sceDelegateProvider.resourceUrlWhitelist([
                // Allow same origin resource loads.
                'self',
                // Allow loading from our assets domain.  Notice the difference between * and **.
                'https://en.wikipedia.org/wiki/China',
                'https://en.wikipedia.org/wiki/United_States',
                'https://en.wikipedia.org/wiki/Germany'

            ]);
        }
    ])
    ;