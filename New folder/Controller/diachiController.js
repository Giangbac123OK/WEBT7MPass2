app.controller('diachiController', function($scope, $http) {
    $scope.dataDiachi = [];

    // Danh sách tỉnh/thành
    $scope.tinhList = [];
    $scope.quanList = [];
    $scope.phuongList = [];
    $scope.edit = { thanhpho: '', quanhuyen: '', phuongxa: '' };
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    console.log(userInfo);
    let idkh = userInfo.id;
    // Load danh sách tỉnh/thành
    $http.get('https://esgoo.net/api-tinhthanh/1/0.htm')
        .then(function(response) {
            if (response.data.error === 0) {
                $scope.tinhList = response.data.data;
            }
        })
        .catch(function(error) {
            console.error('Lỗi khi tải danh sách tỉnh/thành:', error);
        });

    // Load quận/huyện theo tỉnh/thành
    $scope.loadQuanHuyen = function(thanhpho, callback) {
        if (!thanhpho) {
            $scope.quanList = [];
            return;
        }
        $http.get(`https://esgoo.net/api-tinhthanh/2/${thanhpho}.htm`)
            .then(function(response) {
                if (response.data.error === 0) {
                    $scope.quanList = response.data.data;
                }
                if (callback) callback();
            })
            .catch(function(error) {
                console.error('Lỗi khi tải danh sách quận/huyện:', error);
            });
    };

    // Load phường/xã theo quận/huyện
    $scope.loadPhuongXa = function(quanhuyen, callback) {
        if (!quanhuyen) {
            $scope.phuongList = [];
            return;
        }
        $http.get(`https://esgoo.net/api-tinhthanh/3/${quanhuyen}.htm`)
            .then(function(response) {
                if (response.data.error === 0) {
                    $scope.phuongList = response.data.data;
                }
                if (callback) callback();
            })
            .catch(function(error) {
                console.error('Lỗi khi tải danh sách phường/xã:', error);
            });
    };
    // Load địa chỉ của khách hàng
    function loadDiaChi() {
        $http.get("https://localhost:7196/api/Diachi/khachhang/"+idkh)
            .then(function(response) {
                $scope.dataDiachi = response.data;
            })
            .catch(function(error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
            });
    }
    loadDiaChi();
    
});
