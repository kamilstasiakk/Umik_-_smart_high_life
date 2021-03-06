var app = angular.module("smartHome", [ "ngRoute", "ngTable" ]);
app
		.config(function($routeProvider, $httpProvider) {
			$routeProvider.when("/", {
				templateUrl : "home.html",
				controller : "homeCtrl"
			}).when("/resources", {
				templateUrl : "resources.html",
				controller : "resourcesCtrl"
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

app.controller("resourcesCtrl", function($scope, $http, $window, NgTableParams, $location) {
	
	var init = function () {
		$http.get('/resources/'+$window.localStorage.getItem("username")).success(function(data) {
			$scope.data = data;
			console.log(data);
			$scope.tableParams = new NgTableParams({}, {
				dataset : data
			});
		}).error(function(data) {
			$scope.error = true;
		});
		};
		init();
	
	$scope.types = ["Sensor", "Active object"];
	
	$scope.addDevice = function(){
		$scope.deviceModal = true;
	};
	
	$scope.cancel = function(){
		$scope.deviceModal = true;
	};
	
	$scope.submitResource = function(){
		
		$scope.error1 = false;
		$scope.error2 = false;
		
		var resource = {
				serial_id:$scope.serial_id,
				name:$scope.name,
				resourceType:$scope.resourceType,
				localization:$scope.localization,
				description:$scope.description,
				username:$window.localStorage.getItem("username")
		}
		
		if(resource.serial_id == "" || resource.name == "" || resource.resourceType == "" || resource.localization == "" || resource.description == ""){
			$scope.error1 = true;
		}else{
			$http.post('add-resource', angular.toJson(resource), {
				headers : {
					"content-type" : "application/json",
					'Accept' : 'application/json'
				}
			}).success(function() {
				console.log("Resource added");
				init();
				$("[data-dismiss=modal]").trigger({ type: "click" });
			}).error(function(response) {
				$scope.error2 = true;
			});
		}
	}
	
	
	
	$scope.getValue = function( serial_id){
		console.log("Sending get value for" + localization);
		$http.get('/get-value/'+$window.localStorage.getItem("username")+'/'+ serial_id+'/').success(function(response) {
			$scope.valueFromResource = response.status;
		}).error(function(response) {
			$scope.valueFromResource = "Error getting data.";
		});
	}
	
	$scope.deleteResource = function(serial_id){
		$http.get('/delete-resource/'+$window.localStorage.getItem("username")+'/'+ serial_id+'/').success(function(response) {
			console.log(response.status);
			init();
		}).error(function(response) {
			console.log(response.status);
		});
	}
	
	$scope.postOnValue = function(serial_id){
		
		var valueToSend = {
				val:"ON/OFF"
		}
		
		console.log("Sending post value for" + localization);
		
        $http.get('/post-value/'+$window.localStorage.getItem("username")+'/'+ serial_id+'/'+"ON", {
			headers : {
				"content-type" : "application/json",
				'Accept' : 'application/json'
			}
		}).success(function() {
			console.log("Value send!");
		}).error(function(response) {
			console.log("Something wrong with sending");
		});
		
		
		}
	
$scope.postOffValue = function(serial_id){
		
		var valueToSend = {
				val:"ON/OFF"
		}
		
		console.log("Sending post value for" + localization);
		
        $http.get('/post-value/'+$window.localStorage.getItem("username")+'/'+ serial_id+'/'+"OFF", {
			headers : {
				"content-type" : "application/json",
				'Accept' : 'application/json'
			}
		}).success(function() {
			console.log("Value send!");
		}).error(function(response) {
			console.log("Something wrong with sending");
		});
		
		
		}
	
	$scope.checkIfPost = function(action){
		if(action === "GET/POST")
			return true;
		else
			return false;
	}
	
	$scope.synchronize = function(serial_id){
		 $http.get('/synchronize/'+$window.localStorage.getItem("username")+'/'+ serial_id, {
				headers : {
					"content-type" : "application/json",
					'Accept' : 'application/json'
				}
			}).success(function(response) {
				console.log(response.status);
			}).error(function(response) {
				console.log(response.status);
			});
	}

});

app.controller("contactCtrl", function($scope, $http) {

});

app.controller("parentalCtrl", function($scope, $http, $window, NgTableParams) {
	
	var init = function () {
		$http.get('/parentalPolicies/'+$window.localStorage.getItem("username")).success(function(data) {
			$scope.data = data;
			console.log(data);
			$scope.tableParams = new NgTableParams({}, {
				dataset : data
			});
		}).error(function(data) {
			$scope.error = true;
		});
		};
		init();
	
	$scope.types = ["turn off", "turn on"];
	$scope.numbers = ["ONCE","DAILY","WEEKLY","MONTHLY","YEARLY","EVERY MINUTE","EVERY SECOND","EVERY MILISECOND","HOURLY"];

	$scope.submitPolicy = function(){
		
	
	$scope.error1 = false;
	$scope.error2 = false;
	var index = $scope.numbers.indexOf($scope.repeatPatern);
	var policy = {
			description:$scope.description,
			resourceName:$scope.resourceName,
			action:$scope.action,
			startTime:$scope.startTime,
			endTime:$scope.endTime,
			repeatPatern:index,
			username:$window.localStorage.getItem("username")
	}
	
	if(policy.description == "" || policy.resourceName == "" || policy.action == "", policy.startTime == "", policy.endTime ==""  ){
		$scope.error1 = true;
	}else{
		$http.post('/parentalPolicy', angular.toJson(policy), {
			headers : {
				"content-type" : "application/json"

			}
		}).success(function(response) {
			console.log(response.status);
			$("[data-dismiss=modal]").trigger({ type: "click" });
		}).error(function(response) {
			$scope.error2 = true;
		});
	}

}
	
	$scope.deletePolicy = function(policy_id){
		$http.get('/delete-policy/'+$window.localStorage.getItem("username")+'/'+ policy_id+'/').success(function(response) {
			console.log(response.status);
			init();
		}).error(function(response) {
			console.log(response.status);
		});
	}	
	
});

app.controller("registerCtrl", function($scope, $http, $location) {

	
	$scope.getIp = function(){
		
		$http.get('/get-arduino-uno-address').success(function(response) {
			console.log(response.status);
			$scope.ip_address = response.status;
		}).error(function() {
			console.log("Error with getting ip address");
		});
		
	}

	$scope.register = function() {
		var user = { 
				first_name:$scope.first_name,
				last_name:$scope.last_name,
				email:$scope.email,
				username:$scope.username,
				password:$scope.password,
				confirm_password: $scope.confirm_password,
				ip_address: $scope.ip_address
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
