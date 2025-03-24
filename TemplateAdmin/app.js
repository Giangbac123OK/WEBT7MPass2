const app = angular.module("myApp",['ngRoute']);
//ifanfgf
app.config(function($routeProvider){
    $routeProvider
        .when("/",{
            templateUrl: "./Views/home.html"
        })
          .otherwise("/")
});
