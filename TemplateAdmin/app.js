const app = angular.module("myApp", ['ngRoute']);
//ifanfgf
app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "./Views/home.html"
        })
        .when("/dangnhap", {
            templateUrl: "./Views/dangnhap.html",
            controller: "dangnhapController"
        })
        .when("/quenmatkhau", {
            templateUrl: "./Views/quenmatkhau.html"
        })
        .when("/datlaimatkhau", {
            templateUrl: "./Views/datlaimatkhau.html"
        })
        .when("/doimatkhau", {
            templateUrl: "./Views/doimatkhau.html"
        })
        .when("/sale", {
            templateUrl: "./Views/sale.html",
            controller: "saleController"
        })
        .when("/quanlyhoadon", {
            templateUrl: "./Views/quanlyhoadon.html",
            controller: "quanlyhoadonController"
        })
        .when("/nhanvien", {
            templateUrl: "./Views/nhanvien.html",
            controller: 'nhanvienController'
        })
        .otherwise("/")
});
