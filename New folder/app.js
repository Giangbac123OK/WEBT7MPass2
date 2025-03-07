const app = angular.module("myApp",['ngRoute']);

app.config(function($routeProvider){
    $routeProvider
        .when('/',{
            templateUrl: './Views/home.html'
        })
        .otherwise('/')
})