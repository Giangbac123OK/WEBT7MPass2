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
    .when("/tim-kiem", {
      templateUrl: "views/search-results.html",
      controller: "SearchResultsController",
    })
    .otherwise("/")
})
app.directive("searchBox", ($http, $location, $timeout, $sce) => ({
  restrict: "E",
  replace: true,
  template: `
            <div class="search-container w-100">
                <div class="input-group">
                    <input 
                        type="text" 
                        class="form-control" 
                        placeholder="Tìm kiếm giày..." 
                        ng-model="searchTerm" 
                        ng-change="getSuggestions()" 
                        ng-focus="showSuggestions = true"
                        autocomplete="off"
                    >
                    <button class="btn btn-outline-danger" type="button" ng-click="search()">
                        <i class="bi bi-search"></i>
                    </button>
                    
                    <!-- Loading spinner -->
                    <div class="search-spinner" ng-if="loading"></div>
                    
                    <!-- Search Suggestions -->
                    <div class="search-suggestions" ng-show="showSuggestions && suggestions.length > 0">
                        <div class="suggestion-item" ng-repeat="suggestion in suggestions" ng-click="selectSuggestion(suggestion)">
                            <i class="bi bi-search"></i>
                            <span ng-bind-html="highlightText(suggestion)"></span>
                        </div>
                    </div>
                </div>
            </div>
        `,
  link: (scope, element, attrs) => {
    // Khởi tạo biến
    scope.searchTerm = ""
    scope.suggestions = []
    scope.showSuggestions = false
    scope.loading = false

    // Biến debounce cho tìm kiếm gợi ý
    var debounceTimer

    // Hàm lấy gợi ý tìm kiếm
    scope.getSuggestions = () => {
      if (scope.searchTerm.length < 2) {
        scope.suggestions = []
        scope.showSuggestions = false
        return
      }

      // Xóa timer cũ
      if (debounceTimer) {
        $timeout.cancel(debounceTimer)
      }

      // Tạo timer mới
      debounceTimer = $timeout(() => {
        scope.loading = true

        // Trong môi trường thực tế, gọi API để lấy gợi ý
        // $http.get('https://localhost:7196/api/search/suggestions?term=' + encodeURIComponent(scope.searchTerm))
        //     .then(function(response) {
        //         scope.suggestions = response.data;
        //         scope.showSuggestions = scope.suggestions.length > 0;
        //     })
        //     .catch(function(error) {
        //         console.error('Lỗi khi lấy gợi ý tìm kiếm:', error);
        //     })
        //     .finally(function() {
        //         scope.loading = false;
        //     });

        // Dữ liệu mẫu cho gợi ý
        $timeout(() => {
          var allSuggestions = [
            "giày nike air force 1",
            "giày adidas superstar",
            "giày thể thao nam",
            "giày thể thao nữ",
            "giày chạy bộ",
            "giày đá bóng",
            "giày sneaker",
            "giày converse",
            "giày vans old skool",
            "giày puma",
            "giày new balance",
            "giày jordan",
            "giày balenciaga",
            "giày sandal",
            "giày cao gót",
            "giày lười nam",
            "giày tây",
            "giày boot",
            "giày đi mưa",
            "giày đi biển",
          ]

          // Lọc gợi ý phù hợp với từ khóa
          scope.suggestions = allSuggestions
            .filter((sugg) => sugg.toLowerCase().includes(scope.searchTerm.toLowerCase()))
            .slice(0, 6) // Giới hạn 6 gợi ý

          scope.showSuggestions = scope.suggestions.length > 0
          scope.loading = false
        }, 300)
      }, 300)
    }

    // Hàm highlight từ khóa trong gợi ý
    scope.highlightText = (text) => {
      if (!scope.searchTerm) return text

      var searchTermEscaped = scope.searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      var regex = new RegExp("(" + searchTermEscaped + ")", "gi")

      return $sce.trustAsHtml(text.replace(regex, '<span class="highlight">$1</span>'))
    }

    // Hàm chọn gợi ý
    scope.selectSuggestion = (suggestion) => {
      scope.searchTerm = suggestion
      scope.showSuggestions = false
      scope.search()
    }

    // Hàm tìm kiếm
    scope.search = () => {
      if (!scope.searchTerm || scope.searchTerm.trim() === "") return

      // Chuyển hướng đến trang kết quả tìm kiếm với tham số query
      $location.path("/tim-kiem").search({ q: scope.searchTerm })
    }

    // Xử lý sự kiện click ra ngoài để ẩn gợi ý
    document.addEventListener("click", (e) => {
      if (!element[0].contains(e.target)) {
        scope.$apply(() => {
          scope.showSuggestions = false
        })
      }
    })
  },
}))
app.filter("currency", () => (input, symbol, fractionSize) => {
  if (isNaN(input)) return input

  var formattedValue = input.toLocaleString("vi-VN")
  return formattedValue
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
