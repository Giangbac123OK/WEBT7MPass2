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
            controller: "LoginController"
          })
          .when("/dangky", {
            templateUrl: "./Views/dangky.html",
            controller: "dangkyController"
          })
          .when("/Sanpham", {
            templateUrl: "./Views/Sanpham.html",
            controller: "Sanpham"
          })
          .when("/sale", {
            templateUrl: "./Views/sale.html"
          })
          .when("/diachi", {
            templateUrl: "./Views/diachi.html",
            controller: 'diachiController'
          })
          .when("/voucher", {
            templateUrl: "./Views/voucher.html"
          })
          .when("/doimatkhau", {
            templateUrl: "./Views/doimatkhau.html"
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
            templateUrl: "./Views/SanphamDetail.html",
            controller: "SanphamDetail"
          })
          
          .otherwise("/")
})





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
  
  // Kiểm tra trạng thái khách hàng mỗi khi chuyển trang
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      const idkh = GetByidKH();
      if ($rootScope.isLoggedIn) {
          // Gọi API để kiểm tra trạng thái của khách hàng
          $http.get(`https://localhost:7196/api/Khachhangs/${idkh}`)  
              .then(function(response) {
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
              .catch(function(error) {
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
