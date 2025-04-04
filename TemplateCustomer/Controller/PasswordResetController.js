app.controller('PasswordResetController', function ($scope, $http, $rootScope, $location) {
   
    GetByidKH1();
    
    async function GetByidKH1() {
        try {
            // Kiểm tra và lấy thông tin user từ localStorage
            const userInfoString = localStorage.getItem("userInfo");
            if (!userInfoString) {
                console.error("Không tìm thấy thông tin user trong localStorage");
                return null;
            }
    
            const userInfo = JSON.parse(userInfoString);
            if (!userInfo || !userInfo.id) {
                console.error("Thông tin user không hợp lệ");
                return null;
            }
    
            // Lấy thông tin khách hàng từ API
            const infoResponse = await fetch(`https://localhost:7196/api/khachhangs/${userInfo.id}`);
            if (!infoResponse.ok) {
                throw new Error(`Lỗi khi lấy thông tin khách hàng: ${infoResponse.status}`);
            }
            const customerData = await infoResponse.json();
            
            if (!customerData) {
                throw new Error("Dữ liệu khách hàng trả về rỗng");
            }
    
            // Gán dữ liệu cho $scope
            $scope.dataTttk = customerData;
    
            // Kiểm tra và lấy thông tin rank nếu có idrank
            if (customerData.idrank) {
                const rankResponse = await fetch(`https://localhost:7196/api/Ranks/${customerData.idrank}`);
                if (!rankResponse.ok) {
                    console.error(`Lỗi khi lấy thông tin rank: ${rankResponse.status}`);
                    $scope.datarank = null; // Gán null nếu không lấy được rank
                } else {
                    const rankData = await rankResponse.json();
                    $scope.datarank = rankData;
                }
            } else {
                $scope.datarank = null;
            }
    
            // Kích hoạt $digest cycle để cập nhật view
            $scope.$apply();
            
            return customerData;
        } catch (error) {
            console.error("Lỗi trong hàm GetByidKH1:", error);
            
            // Xử lý lỗi cụ thể
            if (error instanceof SyntaxError) {
                console.error("Lỗi phân tích JSON từ localStorage");
            } else if (error.name === 'TypeError') {
                console.error("Lỗi kết nối hoặc API không phản hồi");
            }
            
            // Gán giá trị mặc định cho $scope nếu có lỗi
            $scope.dataTttk = null;
            $scope.datarank = null;
            $scope.$apply();
            
            return null;
        }
    }
    // Hàm để thay đổi tab
  
    // Lấy thông tin userInfo từ localStorage hoặc từ backend
    const userInfo = JSON.parse(localStorage.getItem('userInfo')); // Dữ liệu lưu trữ sau khi đăng nhập
    if (!userInfo) {
        console.error('Không tìm thấy thông tin người dùng.'); // Xử lý lỗi nếu cần
    }
   
    $scope.passwordData = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    };

    $scope.errorMessages = {};
    $scope.successMessage = '';
    $scope.generalErrorMessage = '';

    $scope.submitPasswordReset = function () {
        // Reset thông báo lỗi
        $scope.errorMessages = {};
        $scope.successMessage = '';
        $scope.generalErrorMessage = '';

        // Kiểm tra mật khẩu mới và xác nhận mật khẩu
        if ($scope.passwordData.newPassword !== $scope.passwordData.confirmPassword) {
            $scope.errorMessages.confirmPassword = 'Mật khẩu mới và xác nhận mật khẩu không khớp.';
            return;
        }
        if ($scope.passwordData.newPassword.length < 6) {
            $scope.errorMessages.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
            return;
        }
        if ($scope.passwordData.confirmPassword.length < 6) {
            $scope.errorMessages.confirmPassword = 'Xác nhận mật khẩu mới phải có ít nhất 6 ký tự.';
            return;
        }
        // Kiểm tra các trường
        if (!$scope.passwordData.oldPassword) {
            $scope.errorMessages.oldPassword = 'Vui lòng nhập mật khẩu cũ.';
        }
        if ($scope.passwordData.newPassword === $scope.passwordData.oldPassword) {
            $scope.errorMessages.newPassword = 'Mật khẩu mới không được trùng với mật khẩu cũ.';
            return;
        }
        if (!$scope.passwordData.newPassword) {
            $scope.errorMessages.newPassword = 'Vui lòng nhập mật khẩu mới.';
        }
        if (!$scope.passwordData.confirmPassword) {
            $scope.errorMessages.confirmPassword = 'Vui lòng xác nhận mật khẩu mới.';
        }

        if (Object.keys($scope.errorMessages).length > 0) {
            return;
        }

        // Tạo DTO từ thông tin đã có
        const changePasswordDto = {
            email: userInfo.email, // Lấy email từ userInfo
            oldPassword: $scope.passwordData.oldPassword,
            newPassword: $scope.passwordData.newPassword
        };

        console.log('Sending DTO:', changePasswordDto); // Log để kiểm tra dữ liệu

        // Gửi yêu cầu đổi mật khẩu tới backend
        $http.post('https://localhost:7196/api/Khachhangs/doimatkhau', changePasswordDto)
            .then(function (response) {
                Swal.fire("Đổi mật khẩu thành công", "Tài khoản sẽ được đăng xuất, vui lòng đăng nhật lại với mật khẩu mới.", "success"); 
                $rootScope.dangxuat();
            })
            .catch(function (error) {
                $scope.generalErrorMessage = error.data?.message || 'Đã xảy ra lỗi không xác định.';
            });
    };
    $http.get("https://localhost:7196/api/Khachhangs/" + userInfo.id)
        .then(function (response) {
            $scope.dataTttk = response.data;
            console.log("Dữ liệu tài khoản:", $scope.dataTttk);
        })
        .catch(function (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
            Swal.fire("Lỗi!", "Không thể lấy thông tin tài khoản. Vui lòng thử lại!", "error");
        });
});