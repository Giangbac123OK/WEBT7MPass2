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
        .when("/Size", {
            templateUrl: "./Views/Size.html",
            controller: 'QuanLyThuocTinhController'
        })
        .when("/Mau", {
            templateUrl: "./Views/Mau.html",
            controller: 'QuanLyThuocTinhController'
        })
        .when("/ChatLieu", {
            templateUrl: "./Views/ChatLieu.html",
            controller: 'QuanLyThuocTinhController'
        })
        .when("/thuongHieu", {
            templateUrl: "./Views/thuongHieu.html",
            controller: 'QuanLyThuocTinhController'
        })
        .when("/addSanPham", {
            templateUrl: "./Views/addSanPham.html",
            controller: "QuanLySanPhamController"
        })
        .when("/sanpham", {
            templateUrl: "./Views/quanLySanPham.html",
            controller: "QuanLySanPhamController"
        })
        .when("/Rank", {
            templateUrl: "./Views/Rank.html",
            
        })
        .when("/thongtinAdmin", {
            templateUrl: "./Views/ThongtinAdmin.html",
            
        })
        .when("/Vocher", {
            templateUrl: "./Views/VocherAdmin.html",
            
        })
        .otherwise("/")
});
