const app = angular.module("myApp",['ngRoute']);

app.config(function($routeProvider){
    $routeProvider
        .when('/',{
            templateUrl: '/WEBT7MPass2/New folder/Views/home.html'
        })
        .when('/giang',{
             template: '<h1>Giang</h1>'
         })
        .otherwise('/')
})