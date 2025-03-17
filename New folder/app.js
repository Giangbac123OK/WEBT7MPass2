const app = angular.module("myApp",['ngRoute']);
//ifanfgf
app.config(function($routeProvider){
    $routeProvider
        .when("/",{
            templateUrl: "./Views/home.html",
            controller :'homeController'
        })
        .when("/login", {
            templateUrl: "./Views/login.html",
            controller: "./Controller/LoginController.js"
          })
          .when("/dangky", {
            templateUrl: "./Views/dangky.html",
            controller: "./Controller/dangkyController.js"
          })
          .when("/Sanpham", {
            templateUrl: "./Views/Sanpham.html",
            controller: "./Controller/SanphamController.js"
          })
          .when("/sale", {
            templateUrl: "./Views/sale.html"
          })
          .when("/diachi", {
            templateUrl: "./Views/diachi.html"
          })
          .when("/voucher", {
            templateUrl: "./Views/voucher.html"
          })
          .when("/doimatkhau", {
            templateUrl: "./Views/doimatkhau.html"
          })
          .when("/thongtintaikhoan", {
            templateUrl: "./Views/thongtintaikhoan.html"
          })
          .when("/donhangcuaban", {
            templateUrl: "./Views/donhangcuaban.html",
            controller: 'donhangcuabanController'
          })
          .when("/giohang", {
            templateUrl: "./Views/giohang.html"
          })
          .when("/trahang", {
            templateUrl: "./Views/trahang.html"
          })
          .when("/hoadn", {
            templateUrl: "./Views/hoadon.html"
          })
          .when("/doidiem", {
            templateUrl: "./Views/doidiem.html"
          })
          .when("/gioithieu", {
            templateUrl: "./Views/gioithieu.html"
          })
          .when("/SanpDetail", {
            templateUrl: "./Views/SanphamDetail.html"
          })
          
          .otherwise("/")
})