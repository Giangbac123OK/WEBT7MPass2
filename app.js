var app = angular.module("myApp", ["ngRoute"]);
app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        template: "<h3>Trang chủ</h3><p>Chào mừng bạn đến với trang chủ!</p>"
    })
    .otherwise({
        redirectTo: "/"
    });
});