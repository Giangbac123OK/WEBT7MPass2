// Thêm file này vào thư mục Controller của bạn


app.controller("SearchController", ($scope, $http, $location, $timeout, $sce) => {
  // Khởi tạo biến
  $scope.searchTerm = ""
  $scope.suggestions = []
  $scope.showSuggestions = false
  $scope.loading = false

  // Biến debounce cho tìm kiếm gợi ý
  var debounceTimer

  // Hàm lấy gợi ý tìm kiếm
  $scope.getSuggestions = () => {
    if ($scope.searchTerm.length < 2) {
      $scope.suggestions = []
      $scope.showSuggestions = false
      return
    }

    // Xóa timer cũ
    if (debounceTimer) {
      $timeout.cancel(debounceTimer)
    }

    // Tạo timer mới
    debounceTimer = $timeout(() => {
      $scope.loading = true

      // Trong môi trường thực tế, gọi API để lấy gợi ý
      // $http.get('https://localhost:7196/api/search/suggestions?term=' + encodeURIComponent($scope.searchTerm))
      //     .then(function(response) {
      //         $scope.suggestions = response.data;
      //         $scope.showSuggestions = $scope.suggestions.length > 0;
      //     })
      //     .catch(function(error) {
      //         console.error('Lỗi khi lấy gợi ý tìm kiếm:', error);
      //     })
      //     .finally(function() {
      //         $scope.loading = false;
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
        $scope.suggestions = allSuggestions
          .filter((sugg) => sugg.toLowerCase().includes($scope.searchTerm.toLowerCase()))
          .slice(0, 6) // Giới hạn 6 gợi ý

        $scope.showSuggestions = $scope.suggestions.length > 0
        $scope.loading = false
      }, 300)
    }, 300)
  }

  // Hàm highlight từ khóa trong gợi ý
  $scope.highlightText = (text) => {
    if (!$scope.searchTerm) return text

    var searchTermEscaped = $scope.searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    var regex = new RegExp("(" + searchTermEscaped + ")", "gi")

    return $sce.trustAsHtml(text.replace(regex, '<span class="highlight">$1</span>'))
  }

  // Hàm chọn gợi ý
  $scope.selectSuggestion = (suggestion) => {
    $scope.searchTerm = suggestion
    $scope.showSuggestions = false
    $scope.search()
  }

  // Hàm tìm kiếm
  $scope.search = () => {
    if (!$scope.searchTerm || $scope.searchTerm.trim() === "") return

    // Chuyển hướng đến trang kết quả tìm kiếm với tham số query
    $location.path("/tim-kiem").search({ q: $scope.searchTerm })
  }

  // Xử lý sự kiện click ra ngoài để ẩn gợi ý
  document.addEventListener("click", (e) => {
    var searchContainer = document.querySelector(".search-container")
    if (searchContainer && !searchContainer.contains(e.target)) {
      $scope.$apply(() => {
        $scope.showSuggestions = false
      })
    }
  })
})

