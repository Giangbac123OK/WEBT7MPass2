app.controller('thongtintaikhoanController', function ($http, $scope) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    console.log(userInfo);
    let idkh = userInfo.id;
    const apiUrl = "https://localhost:7196/api/Khachhangs/";

    // Lấy dữ liệu từ API
    $http.get(apiUrl + idkh)
        .then(function (response) {
            $scope.dataTttk = response.data;
            console.log("Dữ liệu tài khoản:", $scope.dataTttk);

            // Lưu avatar ban đầu để so sánh sau này
            $scope.originalAvatar = $scope.dataTttk.avatar;

            // Kiểm tra và xử lý ngày sinh
            if ($scope.dataTttk.ngaysinh) {
                let dateObj = new Date($scope.dataTttk.ngaysinh);
                $scope.dataTttk.ngaysinh = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
            }
        })
        .catch(function (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
            Swal.fire("Lỗi!", "Không thể lấy thông tin tài khoản. Vui lòng thử lại!", "error");
        });

    // Hàm cập nhật thông tin
    $scope.btnLuu = async function () {
        try {
            // Nếu có ảnh mới thì upload trước
            if (hasNewImage && croppedImageFile) {
                const formData = new FormData();
                formData.append("image", croppedImageFile);
                
                // Nếu có ảnh cũ thì thêm vào formData để xóa
                if ($scope.originalAvatar) {
                    formData.append("oldFileName", $scope.originalAvatar);
                }

                const uploadResult = await uploadImage(formData);
                if (uploadResult.success) {
                    $scope.dataTttk.avatar = uploadResult.fileName; // Chỉ lưu tên file
                    hasNewImage = false;
                } else {
                    throw new Error(uploadResult.message || "Lỗi khi upload ảnh");
                }
            }
            
            const date = new Date($scope.dataTttk.ngaysinh);
            const isoDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
            
            const data = {
                ten: $scope.dataTttk.ten,
                sdt: $scope.dataTttk.sdt,
                ngaysinh: date,
                email: $scope.dataTttk.email,
                gioitinh: $scope.dataTttk.gioitinh,
                avatar: $scope.dataTttk.avatar || $scope.originalAvatar // Giữ avatar cũ nếu không có mới
            };

            console.log("Dữ liệu gửi lên API:", data);
            
            $http.put(apiUrl + idkh, data)
                .then(function (response) {
                    Swal.fire("Đã sửa!", "Dữ liệu của bạn đã được cập nhật.", "success")
                        .then(() => {
                            location.reload();
                            window.scrollTo(0, 0);
                        });
                })
                .catch(function (error) {
                    console.error("Lỗi khi cập nhật dữ liệu:", error);
                    Swal.fire("Lỗi!", "Không thể cập nhật thông tin. Vui lòng thử lại!", "error");
                });
        } catch (error) {
            console.error("Lỗi:", error);
            Swal.fire("Lỗi!", error.message, "error");
        }
    };

    // Hàm upload ảnh
    async function uploadImage(formData) {
        try {
            const response = await fetch('https://localhost:7196/api/Khachhangs/avatar', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            if (response.ok) {
                console.log("Upload thành công:", result);
                return result;
            } else {
                throw new Error(result.message || "Lỗi khi upload ảnh");
            }
        } catch (error) {
            console.error("Lỗi:", error);
            throw error;
        }
    }

    // Các phần khác giữ nguyên...
    const imageInput = document.getElementById("imageInput");
    const previewImage = document.getElementById("previewImage");
    const btnSelectImage = document.getElementById("btnSelectImage");
    const btnCropConfirm = document.getElementById("btnCropConfirm");
    const cropModal = new bootstrap.Modal(document.getElementById("cropModal"));
    const cropperImage = document.getElementById("cropperImage");

    let cropper; // Đối tượng cropper
    let croppedImageFile = null; // Lưu trữ file ảnh đã cắt
    let hasNewImage = false; // Cờ kiểm tra có ảnh mới hay không

    // Khi nhấn "Chọn ảnh"
    btnSelectImage.addEventListener("click", function () {
        imageInput.click();
    });

    // Khi chọn ảnh từ input
    imageInput.addEventListener("change", function (event) {
        const file = event.target.files[0];

        if (file) {
            // Kiểm tra dung lượng và định dạng ảnh
            if (file.size > 10 * 1024 * 1024) {
                alert("File quá lớn! Vui lòng chọn ảnh nhỏ hơn 10MB.");
                return;
            }
            if (!['image/png', 'image/jpeg'].includes(file.type)) {
                alert("Chỉ hỗ trợ định dạng PNG hoặc JPEG.");
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                cropperImage.src = e.target.result;

                // Khi ảnh load xong, mở modal crop
                cropModal.show();

                // Chờ modal mở xong rồi mới khởi tạo cropper
                setTimeout(() => {
                    if (cropper) {
                        cropper.destroy();
                    }
                    cropper = new Cropper(cropperImage, {
                        aspectRatio: 1, // Cắt theo tỷ lệ 1:1 (hình tròn)
                        viewMode: 1, // Chế độ tối ưu không gian làm việc
                        dragMode: 'move', // Cho phép kéo thả ảnh
                        autoCropArea: 1, // Cắt full ảnh theo vùng hiển thị
                        movable: true, // Cho phép di chuyển ảnh
                        zoomable: true, // Cho phép zoom
                        rotatable: true, // Cho phép xoay ảnh
                        scalable: true // Cho phép lật ảnh
                    });
                }, 500);
            };
            reader.readAsDataURL(file);
        }
    });

    // Khi nhấn "Xác nhận" trong modal
    btnCropConfirm.addEventListener("click", function () {
        if (cropper) {
            const croppedCanvas = cropper.getCroppedCanvas({
                width: 200,
                height: 200
            });

            // Lấy ảnh đã cắt và hiển thị lên avatar
            const croppedImageDataUrl = croppedCanvas.toDataURL("image/png");
            previewImage.src = croppedImageDataUrl;

            // Chuyển base64 thành Blob
            const blob = dataURLtoBlob(croppedImageDataUrl);

            // Tạo tên file ngẫu nhiên với đuôi .png
            const fileName = generateRandomFileName() + '.png';
            console.log("Tên ảnh mới:", fileName);

            // Tạo File object từ Blob
            croppedImageFile = new File([blob], fileName, { type: 'image/png' });
            hasNewImage = true; // Đánh dấu có ảnh mới

            // Đóng modal sau khi xác nhận
            cropModal.hide();
        }
    });

    // Hàm chuyển đổi Data URL sang Blob
    function dataURLtoBlob(dataURL) {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new Blob([u8arr], { type: mime });
    }

    // Hàm tạo tên file ngẫu nhiên
    function generateRandomFileName() {
        const timestamp = new Date().getTime();
        const randomString = Math.random().toString(36).substring(2, 8);
        return `img_${timestamp}_${randomString}`;
    }
});