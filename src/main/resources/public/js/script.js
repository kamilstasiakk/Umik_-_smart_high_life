var app = angular.module("smartHome", [ "ngRoute", "ngTable" ]);
app
		.config(function($routeProvider, $httpProvider) {
			$routeProvider.when("/", {
				templateUrl : "home.html",
				controller : "homeCtrl"
			}).when("/devices", {
				templateUrl : "devices.html",
				controller : "devicesCtrl"
			}).when("/contact", {
				templateUrl : "contact.html",
				controller : "contactCtrl"
			}).when("/parentalControl", {
				templateUrl : "parentalControl.html",
				controller : "parentalCtrl"
			}).when("/login", {
				templateUrl : "login.html",
				controller : "loginCtrl"
			}).when("/register", {
				templateUrl : "register.html",
				controller : "registerCtrl"
			});

			$httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
		});

app.controller("homeCtrl", function($window) {
	var self = this;
	self.username = $window.localStorage.getItem("username");
	
});

app.controller("devicesCtrl", function($scope, $http, NgTableParams) {
	
	///////////////
	
	$scope.test = function(){
		console.log("TEST");
		
//		$http.get('URL', {}).success(function(data) {
//			
//		}).error(function(data) {
//		});
	};
	
	////////////////////
	$scope.types = ["Sensor", "Active device"];
	
	$scope.addDevice = function(){
		$scope.deviceModal = true;
	};
	
	$scope.cancel = function(){
		$scope.deviceModal = true;
	};
	
	$scope.submitResource = function(){
		var resource = {
				name:$scope.name,
				resourceType:$scope.resourceType,
				localization:$scope.localization,
				description:$scope.description
		}
	}
	
	$http.get('/resources/').success(function(data) {
		$scope.data = data;
		$scope.tableParams = new NgTableParams({}, {
			dataset : data
		});
	}).error(function(data) {
		$scope.error = true;
	});

});

app.controller("contactCtrl", function($scope, $http) {

});

app.controller("parentalCtrl", function($scope, $http) {

});

app.controller("registerCtrl", function($scope, $http, $location) {
	
//	$scope.user = {};
//	$scope.user.first_name = "";
//	$scope.user.last_name = "";
//	$scope.user.email = "";
//	$scope.user.username = "";
//	$scope.user.password = "";
//	$scope.user.confirm_password = "";

	$scope.register = function() {
		var user = { 
				first_name:$scope.first_name,
				last_name:$scope.last_name,
				email:$scope.email,
				username:$scope.username,
				password:$scope.password,
				confirm_password: $scope.confirm_password
		}
		
		$scope.error1 = false;
		$scope.error2 = false;
		$scope.error3 = false;
		
		if (user.first_name == "" || user.last_name == ""
				|| user.email == "" || user.username == ""
				|| user.password == ""
				|| user.confirm_password == "") {

			$scope.error2 = true;
		}
		

		if (!($scope.error2)) {
			if (user.password != user.confirm_password) {
				$scope.error3 = true;
			}else{
			$http.post('register-post', angular.toJson(user), {
				headers : {
					"content-type" : "application/json",
					'Accept' : 'application/json'
				}
			}).success(function() {
				console.log("Success register");
				$location.path("/login")
			}).error(function(response) {
				if(response.status == "PASSWORD_NOT_MATCH")
					$scope.error3 = true;
				else
					$scope.error1 = true;
			});
			}
		}
		$scope.first_name = "";
		$scope.last_name = "";
		$scope.email = "";
		$scope.username = "";
		$scope.password = "";
		$scope.confirm_password = "";
		$scope.confirm_password = "";
	}
});

app.controller('loginCtrl', function($rootScope, $scope, $http, $location,
		$window) {

	var authenticate = function(credentials, callback) {

		var headers = credentials ? {
			authorization : "Basic "
					+ btoa(credentials.username + ":" + credentials.password)
		} : {};

		$http.get('user', {
			headers : headers
		}).success(function(data) {
			if (data.name) {
				console.log("Success authentication");
				$window.localStorage.setItem("username", credentials.username);
				$rootScope.authenticated = true;
			} else {
				console.log("Authentication failed");
				$rootScope.authenticated = false;
				$scope.credentials.username = "";
				$scope.credentials.password = "";
			}
			callback && callback();
		}).error(function() {
			$rootScope.authenticated = false;
			$scope.credentials.username = "";
			$scope.credentials.password = "";
			callback && callback();
		});
	}

	$scope.login = function() {
		$http.post('login-post', $scope.credentials, {
			headers : {
				"content-type" : "application/json",
				'Accept' : 'application/json'
			}
		}).success(function(data) {
			authenticate($scope.credentials, function() {
				if ($rootScope.authenticated) {
					$location.path("/");
					$scope.error = false;
				} else {
					$scope.credentials.username = "";
					$scope.credentials.password = "";
					$rootScope.authenticated = false;
					$scope.error2 = true;
				}
			});
		}).error(function(data) {
			$scope.error = true;
			$rootScope.authenticated = false;
		})
	};

	$rootScope.logout = function() {
		console.log("Logout action");
		$http.post('logout', {}).success(function() {
			$rootScope.authenticated = false;
			$window.location.reload();
			$location.path("/");
		}).error(function(data) {
			$rootScope.authenticated = false;
		});
	};

});
