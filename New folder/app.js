const app = angular.module("myApp", ['ngRoute']);

app.config(function($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "./Views/home.html",
            controller: 'homeController' // ✅ Chỉ dùng tên controller
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
            controller: "donhangcuabanController"
        })
        .when("/giohang", {
            templateUrl: "./Views/giohang.html"
        })
        .when("/trahang", {
            templateUrl: "./Views/trahang.html"
        })
        .when("/hoadon", {
            templateUrl: "./Views/hoadon.html"
        })
        .when("/gioithieu", {
            templateUrl: "./Views/gioithieu.html"
        })
        .when("/SanpDetail", {
            templateUrl: "./Views/SanphamDetail.html"
        })
        .otherwise("/");
});
