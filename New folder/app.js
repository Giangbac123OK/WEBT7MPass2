const app = angular.module("myApp",['ngRoute']);
//ifanfgf
app.config(function($routeProvider){
    $routeProvider
        .when("/",{
            templateUrl: "./Views/home.html",
            controller :'homeController'
        })
        .when("/login", {
            templateUrl: "./Views/login.html"
          })
          .when("/dangky", {
            templateUrl: "./Views/dangky.html"
          })
          .when("/Sanpham", {
            templateUrl: "./Views/Sanpham.html"
          })
          .when("/sale", {
            templateUrl: "./Views/sale.html"
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
          .when("/giohang", {
            templateUrl: "./Views/giohang.html"
          })
          .otherwise("/")
})