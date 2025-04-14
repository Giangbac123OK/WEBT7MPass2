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
        .when("/trahang", {
            templateUrl: "./Views/trahang.html",
            controller: "trahangController"
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
        .when("/editSanPham/:id", {
            templateUrl: "./Views/editSanPham.html",
            controller: "QuanLySanPhamController"
        })
        .when("/sanpham", {
            templateUrl: "./Views/quanLySanPham.html",
            controller: "QuanLySanPhamController"
        })
        .when("/Rank", {
            templateUrl: "./Views/Rank.html",
            controller: 'RankController'
            
        })
        .when("/KhachHang", {
            templateUrl: "./Views/quanLyKhachHang.html",
            controller: 'quanLyKhachHangController'
        })
        .when("/addKhachHang", {
            templateUrl: "./Views/addKhachHang.html",
            controller: 'quanLyKhachHangController'
        })
        .when("/thongtinAdmin", {
            templateUrl: "./Views/ThongtinAdmin.html",
            
        })
        .when("/Vocher", {
            templateUrl: "./Views/VocherAdmin.html",
            
        })
        .otherwise("/")
});
app.run(function($rootScope, $location) {
    // Khôi phục thông tin user từ localStorage nếu có
    var storedUser = localStorage.getItem('userInfo1');
    if (storedUser) {
        $rootScope.userInfo = JSON.parse(storedUser);
        $rootScope.isLoggedIn = true;
    }

    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        var publicPages = ["/dangnhap", "/quenmatkhau", "/datlaimatkhau"];
        var path = $location.path();

        // Nếu đã đăng nhập rồi mà lại vào /dangnhap thì chuyển về trang chính
        if ($rootScope.userInfo && ["/dangnhap", "/quenmatkhau", "/datlaimatkhau"].includes(path)) {
            event.preventDefault();
            $location.path("/");
            return;
        }
        

        // Nếu chưa đăng nhập và truy cập trang yêu cầu đăng nhập → chuyển hướng
        var restrictedPage = publicPages.indexOf(path) === -1;
        if (restrictedPage && !$rootScope.userInfo) {
            event.preventDefault();
            $location.path("/dangnhap");
        }
    });

    // Hàm đăng xuất
    $rootScope.dangxuat = function () {
        $rootScope.isLoggedIn = false;
        $rootScope.userInfo = null;
        localStorage.removeItem('userInfo1');
        console.log("Đăng xuất thành công");
        $location.path('/dangnhap');
    };
});


