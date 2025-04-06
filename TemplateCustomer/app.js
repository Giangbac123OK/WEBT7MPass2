const app = angular.module("myApp", ['ngRoute']);
//ifanfgf
app.config(function ($routeProvider) {
  $routeProvider
    .when("/", {
      templateUrl: "./Views/home.html",
      controller: 'homeController'
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
      templateUrl: "./Views/sale.html",
      controller: "SanPhamSaleController"
    })
    .when("/diachi", {
      templateUrl: "./Views/diachi.html",
      controller: 'diachiController'
    })
    .when("/voucher", {
      templateUrl: "./Views/voucher.html",
      controller: 'voucherController'
    })

    .when("/thongtintaikhoan", {
      templateUrl: "./Views/thongtintaikhoan.html",
      controller: 'thongtintaikhoanController'
    })
    .when("/donhangcuaban", {
      templateUrl: "./Views/donhangcuaban.html",
      controller: 'donhangcuabanController'
    })
    .when("/giohang", {
      templateUrl: "./Views/giohang.html",
      controller: "GiohangCtrl"
    })
    .when("/trahang", {
      templateUrl: "./Views/trahang.html",
      controller: "trahangCtrl"
    })
    .when("/hoadon/:id", {
      templateUrl: "./Views/hoadon.html",
      controller: 'hoadonCtr'
    })
    .when("/hoadongiohang/:id", {
      templateUrl: "./Views/hoadongiohang.html",
      controller: 'hoadongiohangCtr'
    })
    .when("/doidiem", {
      templateUrl: "./Views/doidiem.html"
    })
    .when("/gioithieu", {
      templateUrl: "./Views/gioithieu.html"
    })
    .when("/SanpDetail/:id", {
      templateUrl: "./Views/SanphamDetail.html",
      controller: "SanphamDetail"
    })
    .when('/doimatkhau', {
      templateUrl: './Views/resetpassword.html',
      controller: 'PasswordResetController'
    })
    .when('/quenmatkhau', {
      templateUrl: './Views/quenmatkhau.html',
      controller: 'quenmatkhauController'
    })
    .when('/trahang/:id', {
      templateUrl: './Views/trahang.html',
      controller: 'trahangController'

    })
    .when('/doimatkhau22', {
      templateUrl: './Views/doimatkhau22.html',
      controller: 'doimatkhau2'
    })
    .when('/timkiem/:search', {
      templateUrl: './Views/timkiem.html',
      controller: 'timkiemController'
    })
    .otherwise("/")
})


app.controller('mainController', function ($scope, $location) {
 
  

  $scope.btntimkiem = function () {
    if ($scope.search && $scope.search.trim() !== '') {
      $location.path('/timkiem/' + $scope.search);
      $scope.search = '';
    } else {
      Swal.fire({
        title: 'Thông báo',
        text: 'Vui lòng nhập từ khóa để tìm kiếm!',//ss
        icon: 'info',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
        background: '#fff',
        color: '#333',
        customClass: {
            popup: 'custom-popup',
        }
    });
    }
    $http.get()
  };
  
});
app.service('ThuongHieuService', function($http) {
  const apiUrl = 'https://localhost:7196/api/Thuonghieu'; // Thay URL API của bạn

  // Hàm lấy danh sách thương hiệu
  this.getAllThuongHieu = function() {
      return $http.get(apiUrl);
  };
});


// Run block để khởi tạo ứng dụng
app.run(function ($rootScope, $location, $http) {
  $rootScope.showAccountInfo = false;
  // Kiểm tra trạng thái đăng nhập từ localStorage
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    $rootScope.isLoggedIn = true;
    $rootScope.userInfo = JSON.parse(userInfo);
  } else {
    $rootScope.isLoggedIn = false;
    $rootScope.userInfo = null;
  }
  // Hàm lấy số lượng sản phẩm trong giỏ hàng


  // Kiểm tra trạng thái khách hàng mỗi khi chuyển trang
  $rootScope.$on('$routeChangeStart', function (event, next, current) {
    const idkh = GetByidKH();


    if ($rootScope.isLoggedIn) {
      // Gọi API để kiểm tra trạng thái của khách hàng
      $http.get(`https://localhost:7196/api/Khachhangs/${idkh}`)
        .then(function (response) {
          if (response.data.trangthai === "Tài khoản bị khoá") {
            // Nếu trạng thái là 1, gọi hàm đăng xuất
            $rootScope.dangxuat();
            Swal.fire({
              icon: 'error',               // Chọn icon là lỗi (error)
              title: 'Lỗi',                // Tiêu đề thông báo
              text: 'Tài khoản của bạn đã bị khoá',  // Nội dung thông báo
              confirmButtonText: 'Đóng'    // Văn bản cho nút xác nhận
            });
          }
        })
        .catch(function (error) {
          console.error("Lỗi khi gọi API kiểm tra trạng thái:", error);
        });
    }
  });

  // Hàm đăng xuất
  $rootScope.dangxuat = function () {
    $rootScope.isLoggedIn = false;
    $rootScope.userInfo = null;
    localStorage.removeItem('userInfo');
    $location.path('/login');
  };

  //aa
  // Hàm lấy thông tin khách hàng từ localStorage
  function GetByidKH() {
    // Lấy dữ liệu từ localStorage
    const userInfoString = localStorage.getItem("userInfo");
    let userId = 0; // Giá trị mặc định nếu không có thông tin khách hàng

    // Kiểm tra nếu dữ liệu tồn tại
    if (userInfoString) {
      try {
        // Chuyển đổi chuỗi JSON thành đối tượng
        const userInfo = JSON.parse(userInfoString);

        // Kiểm tra và lấy giá trị id từ userInfo
        userId = userInfo?.id || 0;
      } catch (error) {
        console.error("Lỗi khi phân tích dữ liệu userInfo:", error);
      }
    } else {
      console.warn("Dữ liệu userInfo không tồn tại trong localStorage.");
    }

    return userId;
  }

  // Hàm đăng xuất
  $rootScope.dangxuat = function () {
    $rootScope.isLoggedIn = false;
    $rootScope.userInfo = null;
    localStorage.removeItem('userInfo');
    console.log("Đăng xuất thành công");
    $location.path('/login');
  };

  // Gắn một listener để theo dõi tất cả các lỗi toàn cục
  $rootScope.$on('$error', function (event, error) {
    console.error('Lỗi toàn cục:', error);

  });

  
  
});
