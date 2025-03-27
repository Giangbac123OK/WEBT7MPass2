app.controller('diachiController', function ($scope, $http) {
    const apiKey = "7b4f1e5c-0700-11f0-94b6-be01e07a48b5";
    const apiProvince = "https://online-gateway.ghn.vn/shiip/public-api/master-data/province";
    const apiDistrict = "https://online-gateway.ghn.vn/shiip/public-api/master-data/district";
    const apiWard = "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward";
    const apiAddressList = "https://localhost:7196/api/Diachi";
    const idkh = GetByidKH();
    $scope.edit = [];

    const selectTinh = document.getElementById("selectTinh");
    const selectQuan = document.getElementById("selectQuan");
    const selectPhuong = document.getElementById("selectPhuong");
    const updateTinh = document.getElementById("updateTinh");
    const updateQuan = document.getElementById("updateQuan");
    const updatePhuong = document.getElementById("updatePhuong");

    let wardMap = {};
    let provinceMap = {};
    let districtMap = {};

    async function fetchProvinces() {
        try {
            const response = await fetch(apiProvince, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Token": apiKey
                }
            });
            const data = await response.json();
            if (data.code === 200) {
                data.data.forEach(province => {
                    provinceMap[province.ProvinceID] = province.NameExtension[1];
                });
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách tỉnh:", error);
        }
    }

    async function fetchDistricts() {
        try {
            const response = await fetch(apiDistrict, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Token": apiKey
                }
            });
            const data = await response.json();
            if (data.code === 200) {
                data.data.forEach(district => {
                    districtMap[district.DistrictID] = district.DistrictName;
                });
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách quận/huyện:", error);
        }
    }

    async function fetchWards(districtId) {
        if (!districtId) {
            console.warn("⚠ Không có Quận/Huyện được chọn!");
            return;
        }

        try {
            console.log("📡 Gửi yêu cầu lấy danh sách Phường/Xã cho Quận/Huyện ID:", districtId);

            const response = await fetch(apiWard, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Token": apiKey
                },
                body: JSON.stringify({ district_id: Number(districtId) })
            });

            const data = await response.json();
            console.log("📡 Phản hồi từ API Phường/Xã:", data);

            if (data.code === 200 && data.data.length > 0) {
                data.data.forEach(ward => {
                    wardMap[ward.WardCode] = ward.WardName;
                });
            } else {
                console.error("❌ API không trả về dữ liệu hợp lệ:", data);
            }
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách phường/xã:", error);
        }
    }

    async function loadAddressData() {
        await Promise.all([fetchProvinces(), fetchDistricts()]);

        fetch(`${apiAddressList}/khachhang/${idkh}`)
            .then(response => response.json())
            .then(async (data) => {
                // Lấy danh sách các quận/huyện cần fetch phường/xã
                const districtIds = [...new Set(data.map(address => address.quanhuyen))];

                // Chờ lấy tất cả danh sách phường/xã trước khi render
                await Promise.all(districtIds.map(id => fetchWards(id)));

                // Render danh sách sau khi có đủ dữ liệu
                renderAddressList(data);
            })
            .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
    }

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

    // Render danh sách địa chỉ ra giao diện (phiên bản mới)
    function renderAddressList(addresses) {
        const addressContainer = document.querySelector(".diachi-list");

        // Sắp xếp danh sách: Địa chỉ có trạng thái = 0 lên đầu
        addresses.sort((a, b) => parseInt(a.trangthai, 10) - parseInt(b.trangthai, 10));

        addressContainer.innerHTML = addresses.map(address => {
            const provinceName = provinceMap[address.thanhpho] || "Không xác định";
            const districtName = districtMap[address.quanhuyen] || "Không xác định";
            const wardName = wardMap[address.phuongxa] || "Không xác định";

            const isDefault = parseInt(address.trangthai, 10) === 0;
            const cardClass = isDefault ? "address-card address-card-default" : "address-card";

            return `
        <div class="col-md-6">
            <div class="${cardClass} p-4 mb-3 bg-white rounded-4 h-100">
                <div class="d-flex">
                    <div class="address-icon me-3">
                        <i class="bi bi-house"></i>
                    </div>
                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-start">
                            <h5 class="fw-bold mb-1">${address.tennguoinhan}</h5>
                            ${isDefault ? '<span class="badge bg-warning">Mặc định</span>' : ''}
                        </div>
                        <p class="text-muted mb-2"><i class="bi bi-telephone me-2"></i>${address.sdtnguoinhan}</p>
                        <p class="mb-3">
                            <i class="bi bi-geo-alt me-2"></i>
                            ${address.diachicuthe}, ${wardName}, ${districtName}, ${provinceName}
                        </p>
                        <div class="d-flex justify-content-end gap-2">
                            <button class="btn btn-outline-secondary btn-sm" data-bs-toggle="modal" 
                                data-bs-target="#EditAddressModal" onclick="loadEditAddress(${address.id})">
                                <i class="bi bi-pencil"></i> Sửa
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="deleteAddress(${address.id}, ${address.trangthai})">
                                <i class="bi bi-trash"></i> Xóa
                            </button>
                            ${!isDefault ? `
                            <button class="btn btn-primary btn-sm default-btn" data-id="${address.id}">
                                <i class="bi bi-check-circle"></i> Mặc định
                            </button>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        }).join("");

        // Thêm sự kiện cho nút đặt mặc định
        document.querySelectorAll(".default-btn").forEach(button => {
            button.addEventListener("click", function () {
                const idDiaChi = this.getAttribute("data-id");
                updateDefaultAddress(idDiaChi);
            });
        });
    }


    // 🏙️ Lấy danh sách Tỉnh/Thành phố
    function getProvinces() {
        fetch(apiProvince, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Token": apiKey
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.code === 200) {
                    selectTinh.innerHTML = `<option value="">Chọn Tỉnh Thành</option>`;
                    data.data.forEach(province => {
                        selectTinh.innerHTML += `<option value="${province.ProvinceID}">${province.NameExtension[1]}</option>`;
                    });
                }
            })
            .catch(error => console.error("Lỗi lấy danh sách tỉnh:", error));
    }

    // 🏢 Lấy danh sách Quận/Huyện theo Tỉnh đã chọn
    selectTinh.addEventListener("change", function () {
        const provinceId = this.value;

        // 🔹 Reset dữ liệu Quận & Phường khi chọn tỉnh mới
        selectQuan.innerHTML = `<option selected value="">Chọn Quận/Huyện</option>`;
        selectPhuong.innerHTML = `<option selected value="">Chọn Phường Xã</option>`;

        if (!provinceId) return; // ⛔ Nếu không có tỉnh thì không gửi request

        fetch(apiDistrict, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Token": apiKey
            },
            body: JSON.stringify({ province_id: Number(provinceId) }) // 🔹 Chuyển province_id về kiểu số
        })
            .then(response => response.json())
            .then(data => {
                if (data.code === 200) {
                    data.data.forEach(district => {
                        selectQuan.innerHTML += `<option value="${district.DistrictID}">${district.DistrictName}</option>`;
                    });
                } else {
                    console.error("❌ Lỗi từ API:", data);
                }
            })
            .catch(error => console.error("❌ Lỗi kết nối:", error));
    });

    // 🏠 Lấy danh sách Phường/Xã theo Quận/Huyện đã chọn
    selectQuan.addEventListener("change", function () {
        const districtId = this.value;
        if (!districtId) return;

        // 🔹 Reset dữ liệu Phường khi chọn Quận mới
        selectPhuong.innerHTML = `<option selected value="">Chọn Phường Xã</option>`;

        fetch(apiWard, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Token": apiKey
            },
            body: JSON.stringify({ district_id: Number(districtId) }) // 🔹 Chuyển về kiểu số
        })
            .then(response => response.json())
            .then(data => {
                if (data.code === 200) {
                    data.data.forEach(ward => {
                        selectPhuong.innerHTML += `<option value="${ward.WardCode}">${ward.WardName}</option>`;
                    });
                } else {
                    console.error("❌ Lỗi API:", data);
                }
            })
            .catch(error => console.error("❌ Lỗi kết nối:", error));
    });

    document.getElementById("btnSaveAddress").addEventListener("click", async () => {
        const ten = document.getElementById("tennguoinhan").value.trim();
        const sdt = document.getElementById("sdtnguoinhan").value.trim();
        const provinceElement = document.getElementById("selectTinh");
        const districtElement = document.getElementById("selectQuan");
        const wardElement = document.getElementById("selectPhuong");
        const diachicuthe = document.getElementById("detailInput").value.trim();
        const idkh = GetByidKH();

        const thanhphocheck = provinceElement.value;
        const quanhuyencheck = districtElement.value;
        const phuongxacheck = wardElement.value;

        if (!ten) {
            Swal.fire("Lỗi", "Tên người nhận không được để trống!", "error");
            return;
        }

        if (!sdt) {
            Swal.fire("Lỗi", "Số điện thoại không được để trống!", "error");
            return;
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(sdt)) {
            Swal.fire("Lỗi", "Số điện thoại phải gồm đúng 10 số và không chứa ký tự khác!", "error");
            return;
        }

        if (!thanhphocheck) {
            Swal.fire("Lỗi", "Vui lòng chọn tỉnh/thành phố!", "error");
            return;
        }

        if (!quanhuyencheck && !districtElement.disabled) {
            Swal.fire("Lỗi", "Vui lòng chọn quận/huyện!", "error");
            return;
        }

        if (!phuongxacheck && !wardElement.disabled) {
            Swal.fire("Lỗi", "Vui lòng chọn phường/xã!", "error");
            return;
        }

        if (!diachicuthe) {
            Swal.fire("Lỗi", "Địa chỉ cụ thể không được để trống!", "error");
            return;
        }

        if (!idkh) {
            Swal.fire("Lỗi", "Không tìm thấy ID khách hàng!", "error");
            return;
        }

        let addressList = [];
        try {
            const response = await fetch(`${apiAddressList}/khachhang/${idkh}`);
            if (!response.ok) {
                Swal.fire("Lỗi", "Không thể kiểm tra danh sách địa chỉ. Vui lòng thử lại sau!", "error");
                return;
            }

            addressList = await response.json();
            if (addressList.length >= 5) {
                Swal.fire("Lỗi", "Khách hàng này đã có quá 5 địa chỉ. Không thể thêm mới!", "error");
                return;
            }
        } catch (error) {
            console.error("Lỗi khi kiểm tra danh sách địa chỉ:", error);
            Swal.fire("Lỗi", "Đã xảy ra lỗi khi kiểm tra danh sách địa chỉ.", "error");
            return;
        }

        const newAddress = {
            id: 0,
            idkh: idkh,
            tennguoinhan: ten,
            sdtnguoinhan: sdt,
            thanhpho: thanhphocheck,
            quanhuyen: quanhuyencheck,
            phuongxa: phuongxacheck,
            diachicuthe: diachicuthe,
            trangthai: addressList.length === 0 ? "0" : "1"
        };

        try {
            await axios.post(apiAddressList, newAddress);
            Swal.fire("Thành công", "Địa chỉ mới đã được lưu.", "success")
                .then(() => location.reload());
        } catch (error) {
            Swal.fire("Lỗi", "Không thể lưu địa chỉ mới.", "error");
            console.error(error);
        }
    });


    function updateDefaultAddress(idDiaChi) {
        const idDiaChiInt = parseInt(idDiaChi, 10); // Chuyển thành số nguyên
        const idKhachHangInt = parseInt(idkh, 10); // Chuyển id khách hàng thành số nguyên

        Swal.fire({
            title: "Xác nhận cập nhật",
            text: "Bạn có chắc muốn đặt địa chỉ này làm mặc định không?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Có, cập nhật!",
            cancelButtonText: "Hủy"
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`https://localhost:7196/api/Diachi/update-default-address?idDiaChi=${idDiaChiInt}&idKhachHang=${idKhachHangInt}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error("Cập nhật địa chỉ mặc định thất bại!");
                        }
                        return response.json();
                    })
                    .then(data => {
                        Swal.fire({
                            title: "Thành công!",
                            text: "Địa chỉ mặc định đã được cập nhật!",
                            icon: "success",
                            confirmButtonText: "OK"
                        }).then(() => {
                            loadAddressData(); // Load lại danh sách địa chỉ sau khi cập nhật
                        });
                    })
                    .catch(error => {
                        console.error("Lỗi:", error);
                        Swal.fire("Lỗi", "Không thể cập nhật địa chỉ mặc định. Vui lòng thử lại!", "error");
                    });
            }
        });
    }

    // Hàm tải dữ liệu địa chỉ để chỉnh sửa
    window.loadEditAddress = async function (id) {
        try {
            const updatetennguoidung = document.getElementById("updatetennguoinhan");
            const updatesdtnguoidung = document.getElementById("updatesdtnguoinhan");
            const updatediachinguoidung = document.getElementById("updatedetailInput");
            const updateCondition = document.getElementById("updateCondition");
            const updateAddressId = document.getElementById("updateAddressId");

            const response = await fetch(`${apiAddressList}/${id}`);
            const data = await response.json();

            if (data) {
                $scope.$apply(() => {
                    $scope.edit = {
                        id: data.id,
                        diachi: data.diachicuthe,
                        thanhpho: data.thanhpho,
                        quanhuyen: data.quanhuyen,
                        phuongxa: data.phuongxa
                    };
                });

                console.log("data địa chỉ cập nhật", $scope.edit);

                // 🔹 Chuyển trạng thái thành số nguyên
                let trangthai = parseInt(data.trangthai, 10);

                // 🔹 Hiển thị dữ liệu trong input
                updateAddressId.value = data.id
                updateCondition.value = trangthai;
                updatetennguoidung.value = data.tennguoinhan;
                updatesdtnguoidung.value = data.sdtnguoinhan;
                updatediachinguoidung.value = data.diachicuthe;

                getProvincesupdate(data.thanhpho);
                getDistrictsUpdate(data.thanhpho, data.quanhuyen);
                getWardsUpdate(data.quanhuyen, data.phuongxa);
            }
        } catch (error) {
            console.error("❌ Lỗi khi tải địa chỉ:", error);
        }
    };


    // 🏙️ Lấy danh sách Tỉnh/Thành phố
    function getProvincesupdate(iddiachi) {
        fetch(apiProvince, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Token": apiKey
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.code === 200) {
                    let options = `<option value="">Chọn Tỉnh Thành</option>`;

                    // Kiểm tra nếu iddiachi tồn tại trong danh sách
                    let selectedProvince = data.data.find(province => province.ProvinceID == iddiachi);

                    // Nếu tìm thấy tỉnh có iddiachi, hiển thị nó đầu tiên
                    if (selectedProvince) {
                        options += `<option value="${selectedProvince.ProvinceID}" selected>${selectedProvince.NameExtension[1]}</option>`;
                    }

                    // Hiển thị các tỉnh còn lại (không trùng với iddiachi)
                    data.data.forEach(province => {
                        if (province.ProvinceID != iddiachi) {
                            options += `<option value="${province.ProvinceID}">${province.NameExtension[1]}</option>`;
                        }
                    });

                    // Gán vào phần tử HTML
                    updateTinh.innerHTML = options;
                }
            })
            .catch(error => console.error("Lỗi lấy danh sách tỉnh:", error));
    }

    function getDistrictsUpdate(idthanhpho, idquanhuyen) {
        fetch(apiDistrict, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Token": apiKey
            },
            body: JSON.stringify({ province_id: Number(idthanhpho) }) // 🔹 Chuyển province_id về kiểu số
        })
            .then(response => response.json())
            .then(data => {
                if (data.code === 200) {
                    let options = `<option value="">Chọn Quận/Huyện</option>`;

                    // 🔍 Tìm quận/huyện có idquanhuyen
                    let selectedDistrict = data.data.find(district => district.DistrictID == idquanhuyen);

                    // Nếu tìm thấy, thêm vào danh sách đầu tiên với trạng thái selected
                    if (selectedDistrict) {
                        options += `<option value="${selectedDistrict.DistrictID}" selected>${selectedDistrict.DistrictName}</option>`;
                    }

                    // Thêm các quận/huyện còn lại (loại bỏ idquanhuyen nếu đã chọn ở trên)
                    data.data.forEach(district => {
                        if (district.DistrictID != idquanhuyen) {
                            options += `<option value="${district.DistrictID}">${district.DistrictName}</option>`;
                        }
                    });

                    // Gán vào phần tử select
                    updateQuan.innerHTML = options;
                } else {
                    console.error("❌ Lỗi từ API:", data);
                }
            })
            .catch(error => console.error("❌ Lỗi kết nối:", error));
    }

    async function getWardsUpdate(idquanhuyen, idphuongxa) {
        try {
            const response = await fetch(apiWard, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Token": apiKey
                },
                body: JSON.stringify({ district_id: Number(idquanhuyen) }) // 🔹 Chuyển district_id về kiểu số
            });

            const data = await response.json();
            console.log("📡 Phản hồi từ API Phường/Xã:", data);

            if (data.code === 200 && data.data.length > 0) {
                let options = `<option value="">Chọn Phường/Xã</option>`;

                // 🔍 Tìm phường/xã có idphuongxa
                let selectedWard = data.data.find(ward => ward.WardCode == idphuongxa);

                // Nếu tìm thấy, thêm vào đầu danh sách với trạng thái selected
                if (selectedWard) {
                    options += `<option value="${selectedWard.WardCode}" selected>${selectedWard.WardName}</option>`;
                }

                // Thêm các phường/xã còn lại (loại bỏ idphuongxa nếu đã chọn ở trên)
                data.data.forEach(ward => {
                    if (ward.WardCode != idphuongxa) {
                        options += `<option value="${ward.WardCode}">${ward.WardName}</option>`;
                    }
                });

                // Gán vào phần tử select
                updatePhuong.innerHTML = options;
            } else {
                console.error("❌ API không trả về dữ liệu hợp lệ:", data);
            }
        } catch (error) {
            console.error("❌ Lỗi kết nối API:", error);
        }
    }

    // 🏢 Lấy danh sách Quận/Huyện theo Tỉnh đã chọn
    updateTinh.addEventListener("change", function () {
        const provinceId = this.value;

        // 🔹 Reset dữ liệu Quận & Phường khi chọn tỉnh mới
        updateQuan.innerHTML = `<option selected value="">Chọn Quận/Huyện</option>`;
        updatePhuong.innerHTML = `<option selected value="">Chọn Phường Xã</option>`;

        if (!provinceId) return; // ⛔ Nếu không có tỉnh thì không gửi request

        fetch(apiDistrict, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Token": apiKey
            },
            body: JSON.stringify({ province_id: Number(provinceId) }) // 🔹 Chuyển province_id về kiểu số
        })
            .then(response => response.json())
            .then(data => {
                if (data.code === 200) {
                    data.data.forEach(district => {
                        updateQuan.innerHTML += `<option value="${district.DistrictID}">${district.DistrictName}</option>`;
                    });
                } else {
                    console.error("❌ Lỗi từ API:", data);
                }
            })
            .catch(error => console.error("❌ Lỗi kết nối:", error));
    });

    // 🏠 Lấy danh sách Phường/Xã theo Quận/Huyện đã chọn
    updateQuan.addEventListener("change", function () {
        const districtId = this.value;
        if (!districtId) return;

        // 🔹 Reset dữ liệu Phường khi chọn Quận mới
        updatePhuong.innerHTML = `<option selected value="">Chọn Phường Xã</option>`;

        fetch(apiWard, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Token": apiKey
            },
            body: JSON.stringify({ district_id: Number(districtId) }) // 🔹 Chuyển về kiểu số
        })
            .then(response => response.json())
            .then(data => {
                if (data.code === 200) {
                    data.data.forEach(ward => {
                        updatePhuong.innerHTML += `<option value="${ward.WardCode}">${ward.WardName}</option>`;
                    });
                } else {
                    console.error("❌ Lỗi API:", data);
                }
            })
            .catch(error => console.error("❌ Lỗi kết nối:", error));
    });

    document.getElementById("updateForm").addEventListener("click", function (event) {
        const updatetennguoidung = document.getElementById("updatetennguoinhan").value.trim();
        const updatesdtnguoidung = document.getElementById("updatesdtnguoinhan").value.trim();
        const updatediachinguoidung = document.getElementById("updatedetailInput").value.trim();
        const updateCondition = document.getElementById("updateCondition").value;
        const updateAddressId = document.getElementById("updateAddressId").value;

        // Lấy giá trị tỉnh, quận, phường
        const updateTinh1 = document.getElementById("updateTinh")?.value || "";
        const updateQuan1 = document.getElementById("updateQuan")?.value || "";
        const updatePhuong1 = document.getElementById("updatePhuong")?.value || "";

        // 🚀 Kiểm tra dữ liệu nhập vào
        if (!updatetennguoidung) {
            Swal.fire({
                icon: "warning",
                title: "Lỗi!",
                text: "Tên người nhận không được để trống!",
                confirmButtonText: "OK"
            });
            return;
        }

        if (!updatesdtnguoidung) {
            Swal.fire({
                icon: "warning",
                title: "Lỗi!",
                text: "Số điện thoại không được để trống!",
                confirmButtonText: "OK"
            });
            return;
        }

        // Kiểm tra số điện thoại
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(updatesdtnguoidung)) {
            Swal.fire({
                icon: "error",
                title: "Lỗi!",
                text: "Số điện thoại phải gồm đúng 10 số và không chứa ký tự khác!",
                confirmButtonText: "OK"
            });
            return;
        }

        if (!updateTinh1) {
            Swal.fire({
                icon: "warning",
                title: "Lỗi!",
                text: "Vui lòng chọn tỉnh/thành phố!",
                confirmButtonText: "OK"
            });
            return;
        }

        if (!updateQuan1 && document.getElementById("updateQuan") && !document.getElementById("updateQuan").disabled) {
            Swal.fire({
                icon: "warning",
                title: "Lỗi!",
                text: "Vui lòng chọn quận/huyện!",
                confirmButtonText: "OK"
            });
            return;
        }

        if (!updatePhuong1 && document.getElementById("updatePhuong") && !document.getElementById("updatePhuong").disabled) {
            Swal.fire({
                icon: "warning",
                title: "Lỗi!",
                text: "Vui lòng chọn phường/xã!",
                confirmButtonText: "OK"
            });
            return;
        }

        if (!updatediachinguoidung) {
            Swal.fire({
                icon: "warning",
                title: "Lỗi!",
                text: "Địa chỉ cụ thể không được để trống!",
                confirmButtonText: "OK"
            });
            return;
        }

        const updatedData = {
            id: updateAddressId,
            idkh: idkh,
            tennguoinhan: updatetennguoidung,
            sdtnguoinhan: updatesdtnguoidung,
            thanhpho: updateTinh1,
            quanhuyen: updateQuan1,
            phuongxa: updatePhuong1,
            diachicuthe: updatediachinguoidung,
            trangthai: updateCondition
        };

        // 🔄 Gửi yêu cầu cập nhật
        $http.put(`${apiAddressList}/${updateAddressId}`, updatedData)
            .then(response => {
                Swal.fire({
                    icon: "success",
                    title: "Thành công!",
                    text: "Cập nhật địa chỉ thành công!",
                    confirmButtonText: "OK"
                }).then(() => {
                    $("#EditAddressModal").modal("hide"); // Ẩn modal sau khi cập nhật
                    loadAddressData(); // Load lại danh sách địa chỉ
                });
            })
            .catch(error => {
                console.error("❌ Lỗi khi cập nhật địa chỉ:", error);
                Swal.fire({
                    icon: "error",
                    title: "Lỗi!",
                    text: "Cập nhật thất bại, vui lòng thử lại.",
                    confirmButtonText: "OK"
                });
            });
    });

    // Hàm xóa địa chỉ
    window.deleteAddress = function (id, trangthai) {
        console.log("ID:", id, "Trạng thái:", trangthai); // ✅ Kiểm tra đầu vào

        if (trangthai == 0) {
            Swal.fire({
                icon: "warning",
                title: "Không thể xóa",
                text: "Địa chỉ hiện tại đang là địa chỉ mặc định, vui lòng thay đổi địa chỉ mặc định trước khi xóa.",
                confirmButtonText: "OK"
            });
            return;
        }

        Swal.fire({
            title: "Xác nhận xóa?",
            text: "Bạn có chắc muốn xóa địa chỉ này không?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy"
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${apiAddressList}/${id}`, {
                    method: "DELETE"
                })
                    .then(response => {
                        if (response.ok) {
                            Swal.fire({
                                icon: "success",
                                title: "Thành công",
                                text: "Xóa địa chỉ thành công!",
                                confirmButtonText: "OK"
                            }).then(() => {
                                location.reload(); // ✅ Reload sau khi xóa
                            });
                        } else {
                            Swal.fire({
                                icon: "error",
                                title: "Lỗi",
                                text: "Xóa thất bại, vui lòng thử lại.",
                                confirmButtonText: "OK"
                            });
                        }
                    })
                    .catch(error => {
                        console.error("❌ Lỗi khi xóa địa chỉ:", error);
                        Swal.fire({
                            icon: "error",
                            title: "Lỗi",
                            text: "Có lỗi xảy ra, vui lòng thử lại.",
                            confirmButtonText: "OK"
                        });
                    });
            }
        });
    };

    loadAddressData();
    // Gọi API lấy danh sách tỉnh khi trang load
    getProvinces();
    $http.get("https://localhost:7196/api/Khachhangs/" + idkh)
        .then(function (response) {
            $scope.dataTttk = response.data;
            console.log("Dữ liệu tài khoản:", $scope.dataTttk);
        })
        .catch(function (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
            Swal.fire("Lỗi!", "Không thể lấy thông tin tài khoản. Vui lòng thử lại!", "error");
        });
});
