const app = angular.module("myApp",['ngRoute']);
//ifanfgf
app.config(function($routeProvider){
    $routeProvider
        .when('/',{
            templateUrl: './Views/home.html'
        })
        .when("/login", {
            templateUrl: "./Views/login.html",
            controller: "LoginController"
          })
          .when("/dangky", {
            templateUrl: "./Views/dangky.html",
            controller: "dangkyController"
          })
          .when("/Sanpham", {
            templateUrl: "./Views/Sanpham.html",
            controller: "SanphamController"
          })
          
          .when("/quenmatkhau", {
            templateUrl: "./Views/quenmatkhau.html"
          })
          .when("/thongtintaikhoan", {
            templateUrl: "./Views/thongtintaikhoan.html"
          })
          .when("/donhangcuaban", {
            templateUrl: "./Views/donhangcuaban.html"
          })
        .when('/giang',{
             template: '<h1>Giang</h1>'
         })
        .otherwise('/')
})