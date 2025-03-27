app.controller('nhanvienController', function ($scope, $http, $location, $interval) {
    // Hàm lấy thứ trong tuần bằng tiếng Việt
    function getVietnameseDay(dayIndex) {
        const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
        return days[dayIndex];
    }

    // Hàm cập nhật thời gian
    function updateTime() {
        var now = new Date();
        var dayOfWeek = getVietnameseDay(now.getDay());
        var day = String(now.getDate()).padStart(2, '0');
        var month = String(now.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
        var year = now.getFullYear();
        var hours = String(now.getHours()).padStart(2, '0');
        var minutes = String(now.getMinutes()).padStart(2, '0');
        var seconds = String(now.getSeconds()).padStart(2, '0');

        $scope.time = `${dayOfWeek}, ${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
    }

    // Cập nhật mỗi giây
    $interval(updateTime, 1000);

    // Chạy ngay khi trang tải
    updateTime();
    $http.get("https://localhost:7196/api/Nhanviens")
        .then(function(response) {
            $scope.listNhanVien = response.data;
            console.log($scope.listNhanVien);
        })
        .catch(function(error) {
            console.error(error);
        });
    
});
