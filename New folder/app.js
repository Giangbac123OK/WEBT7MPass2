const app = angular.module("myApp",['ngRoute']);

app.config(function($routeProvider){
    $routeProvider
        .when('/',{
            templateUrl: './Views/home.html'
        })
        .when('/giang',{
             template: '<h1>Giang</h1>'
         })
        .otherwise('/')
})