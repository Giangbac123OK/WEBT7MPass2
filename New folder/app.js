const app = angular.module("myApp",['ngRoute']);

app.config(function($routeProvider){
    $routeProvider
        .when('/',{
            templateUrl: '/WEBT7MPass2/New folder/Views/home.html'
        })
        .when("/login", {
            templateUrl: "./Views/login.html",
            controller: "LoginController"
          })
          .when("/dangky", {
            templateUrl: "./Views/dangky.html",
            controller: "dangkyController"
          })
        .when('/giang',{
             template: '<h1>Giang</h1>'
         })
        .otherwise('/')
})