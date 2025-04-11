app.controller('quanlyhoadonController', function ($scope, $http, $q, $timeout) {
    // Biến quản lý trạng thái
    $scope.loading = true;
    $scope.showNotifications = false;
    $scope.selectedTab = 'unread';
    $scope.unreadOrders = [];
    $scope.readOrders = [];
    $scope.oldOrders = [];
    $scope.unreadNotifications = 0;
    $scope.notifications = [];
    $scope.invoices = [];
    $scope.filteredInvoices = [];
    $scope.selectedInvoice = null;
    $scope.dataspct = null;
    $scope.currentFilter = 'all';
    $scope.customers = {}; // Cache thông tin khách hàng
    $scope.paymentMethods = {}; // Cache phương thức thanh toán

    // Phân trang
    $scope.currentPage = 1;
    $scope.itemsPerPage = 10;
    $scope.totalPages = 1;
    $scope.pages = [];

    // Thống kê số lượng theo trạng thái
    $scope.counts = {
        all: 0,
        pending: 0,
        confirmed: 0,
        shipping: 0,
        success: 0,
        failed: 0,
    };

    // Hàm khởi tạo
    $scope.init = function () {
        setInterval(loadUnreadOrders, 3000);
        $scope.loadInvoices();
    };

    const apiKey = "7b4f1e5c-0700-11f0-94b6-be01e07a48b5";
    const apiProvince = "https://online-gateway.ghn.vn/shiip/public-api/master-data/province";
    const apiDistrict = "https://online-gateway.ghn.vn/shiip/public-api/master-data/district";
    const apiWard = "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward";

    // Hàm tải danh sách hóa đơn từ API
    $scope.loadInvoices = function () {
        $scope.loading = true;
    
        var promises = {
            invoices: $http.get('https://localhost:7196/api/Hoadons'),
            customers: $http.get('https://localhost:7196/api/Khachhangs'),
            paymentMethods: $http.get('https://localhost:7196/api/Phuongthucthanhtoans')
        };
    
        $q.all(promises).then(async function (responses) {
            // Cache khách hàng
            responses.customers.data.forEach(function (customer) {
                $scope.customers[customer.id] = customer;
            });
    
            // Cache phương thức thanh toán
            responses.paymentMethods.data.forEach(function (method) {
                $scope.paymentMethods[method.id] = method;
            });
    
            const allInvoices = responses.invoices.data
                .filter(invoice => invoice.trangthai >= 0 && invoice.trangthai <= 4)
                .sort((a, b) => b.id - a.id); // Sắp xếp id giảm dần
                    
            // Duyệt từng hóa đơn để xử lý địa chỉ và gán tên khách hàng, phương thức
            for (const invoice of allInvoices) {
                // Gán tên khách hàng
                invoice.tenkhachhang = invoice.idkh && $scope.customers[invoice.idkh]
                    ? $scope.customers[invoice.idkh].ten
                    : 'Khách vãng lai';
    
                // Gán tên phương thức thanh toán
                invoice.tenpttt = invoice.idpttt && $scope.paymentMethods[invoice.idpttt]
                    ? $scope.paymentMethods[invoice.idpttt].tenpttt
                    : 'Không xác định';
    
                // Xử lý địa chỉ ship
                if (invoice.diachiship) {
                    const parts = invoice.diachiship.split(' - ');
                    if (parts.length === 4) {
                        const [diachicuthe, phuongxaIdStr, quanhuyenIdStr, thanhphoIdStr] = parts;
                        const idphuongxa = parseInt(phuongxaIdStr);
                        const idquanhuyen = parseInt(quanhuyenIdStr);
                        const idthanhpho = parseInt(thanhphoIdStr);
    
                        // Lưu lại các id địa chỉ
                        invoice.idphuongxa = idphuongxa;
                        invoice.idquanhuyen = idquanhuyen;
                        invoice.idthanhpho = idthanhpho;
                        invoice.diachicuthe = diachicuthe;
    
                        // Gọi API lấy tên địa chỉ
                        const [phuongxa, quanhuyen, thanhpho] = await Promise.all([
                            getWardName(idquanhuyen, idphuongxa),
                            getDistrictName(idthanhpho, idquanhuyen),
                            getProvinceName(idthanhpho)
                        ]);
    
                        invoice.diachiship_display = `${diachicuthe || ''} - ${phuongxa} - ${quanhuyen} - ${thanhpho}`;
                    } else {
                        invoice.diachiship_display = "Địa chỉ không hợp lệ";
                    }
                } else {
                    invoice.diachiship_display = "Không có địa chỉ";
                }
            }
    
            $scope.invoices = allInvoices;
            $scope.filterInvoices($scope.currentFilter);
            $scope.calculateCounts();
            $scope.loading = false;
            $scope.$apply(); // Cập nhật lại view do có await
        }).catch(function (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            $scope.loading = false;
        });
    };

    // Hàm lấy tên tỉnh/thành phố
    async function getProvinceName(id) {
        try {
            const response = await fetch(apiProvince, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Token": apiKey // 🔹 Thêm Token vào headers
                },
                body: JSON.stringify({}) // Thêm body nếu cần
            });

            const data = await response.json();
            if (data.code === 200) {
                const province = data.data.find(p => p.ProvinceID == id);
                return province ? province.NameExtension[1] : "Không xác định";
            }
        } catch (error) {
            console.error("Lỗi lấy tỉnh/thành phố:", error);
        }
        return "Không xác định";
    }

    // Hàm lấy tên quận/huyện
    async function getDistrictName(province_id, district_id) {
        try {
            const response = await fetch(apiDistrict, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Token": apiKey
                },
                body: JSON.stringify({ province_id: Number(province_id) }) // Sửa lại biến truyền đúng
            });

            const data = await response.json();
            if (data.code === 200) {
                const district = data.data.find(d => d.DistrictID == district_id);
                return district ? district.DistrictName : "Không xác định";
            }
        } catch (error) {
            console.error("Lỗi lấy quận/huyện:", error);
        }
        return "Không xác định";
    }

    // Hàm lấy tên phường/xã
    async function getWardName(district_id, ward_id) {
        try {
            const response = await fetch(apiWard, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Token": apiKey
                },
                body: JSON.stringify({ district_id: Number(district_id) }) // Sửa lại biến truyền đúng
            });

            const data = await response.json();
            if (data.code === 200) {
                const ward = data.data.find(w => w.WardCode == ward_id);
                return ward ? ward.WardName : "Không xác định";
            }
        } catch (error) {
            console.error("Lỗi lấy phường/xã:", error);
        }
        return "Không xác định";
    };

    async function getAvailableServices(fromDistrictID, toDistrictID) {
        const apiURL = "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services";

        const headers = {
            "Token": apiKey, // Thay bằng Token GHN của bạn
            "Content-Type": "application/json"
        };

        const params = {
            shop_id: 3846066,
            from_district: fromDistrictID,
            to_district: toDistrictID
        };

        try {
            const response = await axios.post(apiURL, params, { headers });

            if (response.data.code === 200 && response.data.data.length > 0) {
                console.log("Danh sách gói dịch vụ:", response.data.data);
                return response.data.data; // Trả về danh sách gói dịch vụ hợp lệ
            } else {
                console.error("Lỗi API hoặc không có gói dịch vụ khả dụng:", response.data.message);
                return null;
            }
        } catch (error) {
            console.error("Lỗi gọi API:", error.response?.data || error.message);
            return null;
        }
    }

    async function taoDiaChiGiaoHang(id, idnv) {
        const shopId = 3846066;
        const apiToken = apiKey;
        let selectedService = null;
    
        const invoice = $scope.filteredInvoices.find(inv => inv.id === id);
        if (!invoice) {
            console.error("Không tìm thấy đơn hàng với id:", id);
            return null;
        }
    
        const toDistrictID = invoice.idquanhuyen;
        const toWardCode = invoice.idphuongxa;
    
        const fromDistrictID = 3440;
        const fromWardCode = "13006";
    
        try {
            const services = await getAvailableServices(fromDistrictID, toDistrictID);
            if (!services || services.length === 0) {
                console.error("Không có gói dịch vụ khả dụng.");
                alert("Không tìm thấy dịch vụ giao hàng phù hợp.");
                return null;
            }
    
            selectedService = services[0];
    
            const leadtimeResponse = await axios.post(
                "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/leadtime",
                {
                    from_district_id: fromDistrictID,
                    from_ward_code: String(fromWardCode),
                    to_district_id: toDistrictID,
                    to_ward_code: String(toWardCode),
                    service_id: selectedService.service_id
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Token": apiToken,
                        "ShopId": shopId
                    }
                }
            );
    
            if (leadtimeResponse.data.code === 200) {
                const expectedDeliveryTime = leadtimeResponse.data.data.leadtime;
                const readableDate = new Date(expectedDeliveryTime * 1000).toISOString().slice(0, 19);
    
                // 👉 Gửi cập nhật trạng thái và ngày giao hàng
                $http.put(`https://localhost:7196/api/Hoadons/trangthaiNV1/${id}?trangthai=2&idnv=${idnv}&ngaygiaohang=${encodeURIComponent(readableDate)}`)
                    .then(res => {
                        var invoiceItem = $scope.invoices.find(i => i.id === id);
                        if (invoiceItem) {
                            invoiceItem.trangthai = 2;
                            invoiceItem.trangthaiStr = $scope.getStatusString(2);
                            invoiceItem.ngaygiaothucte = readableDate;
                        }

                        var filteredItem = $scope.filteredInvoices.find(i => i.id === id);
                        if (filteredItem) {
                            filteredItem.trangthai = 2;
                            filteredItem.trangthaiStr = $scope.getStatusString(2);
                            filteredItem.ngaygiaothucte = readableDate;
                        }

                        if ($scope.selectedInvoice && $scope.selectedInvoice.id === id) {
                            $scope.selectedInvoice.trangthai = 2;
                            $scope.selectedInvoice.trangthaiStr = $scope.getStatusString(2);
                            $scope.selectedInvoice.ngaygiaothucte = readableDate;
                        }

                        $scope.calculateCounts();
                        alert("Chuyển sang trạng thái vận chuyển thành công!");
                    })
                    .catch(err => {
                        console.error("Lỗi khi cập nhật trạng thái:", err);
                        alert("Cập nhật ngày giao hàng thất bại!");
                    });
    
            } else {
                console.error("Lỗi khi lấy leadtime:", leadtimeResponse.data.message);
                alert("Không thể lấy thời gian giao hàng dự kiến.");
                return null;
            }
    
        } catch (error) {
            console.error("Lỗi trong quá trình tạo địa chỉ giao hàng:", error.response?.data || error.message);
            alert("Có lỗi xảy ra trong quá trình tạo địa chỉ giao hàng.");
            return null;
        }
    }         

    // Hàm tính toán số lượng hóa đơn theo trạng thái
    $scope.calculateCounts = function () {
        $scope.counts = {
            all: $scope.invoices.length,
            pending: $scope.invoices.filter(i => i.trangthai === 0).length,
            confirmed: $scope.invoices.filter(i => i.trangthai === 1).length,
            shipping: $scope.invoices.filter(i => i.trangthai === 2).length,
            success: $scope.invoices.filter(i => i.trangthai === 3).length,
            failed: $scope.invoices.filter(i => i.trangthai === 4).length,
        };
    };

    // Hàm lọc hóa đơn theo trạng thái
    $scope.filterInvoices = function (status) {
        $scope.currentFilter = status;
        $scope.currentPage = 1;

        if (status === 'all') {
            $scope.filteredInvoices = $scope.invoices;
            console.log("data hoá đơn:",$scope.filteredInvoices);
        } else {
            $scope.filteredInvoices = $scope.invoices.filter(function (invoice) {
                return invoice.trangthai === status;
            });
        }

        $scope.updatePagination();
    };

    // Hàm cập nhật phân trang
    $scope.updatePagination = function () {
        $scope.totalPages = Math.ceil($scope.filteredInvoices.length / $scope.itemsPerPage);
        $scope.pages = [];

        for (var i = 1; i <= $scope.totalPages; i++) {
            $scope.pages.push(i);
        }

        // Nếu không có trang nào, thêm trang 1
        if ($scope.totalPages === 0) {
            $scope.totalPages = 1;
            $scope.pages.push(1);
        }
    };

    // Hàm chuyển trang
    $scope.changePage = function (page) {
        if (page >= 1 && page <= $scope.totalPages) {
            $scope.currentPage = page;
        }
    };

    // Thêm hàm này vào controller của bạn
    $scope.modalInstance = null;

    $scope.openOrderDetail = function(order) {
        // Khởi tạo modal nếu chưa có
        const modalElement = document.getElementById('orderDetailModal1');
        $scope.modalInstance = new bootstrap.Modal(modalElement);
        
        // Xử lý dữ liệu
        $scope.viewInvoiceDetail(order);

        if ($scope.selectedTab === 'unread') {
            $scope.markSingleAsRead(order.id, event || {stopPropagation: angular.noop});
        }
        
        // Mở modal
        $scope.modalInstance.show();
    };

    $scope.closeModal = function() {
        if ($scope.modalInstance) {
            $scope.modalInstance.hide();
        } else {
            // Fallback nếu không có modalInstance
            const modalElement = document.getElementById('orderDetailModal1');
            const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
            modalInstance.hide();
        }
        
        // Reset một số trạng thái nếu cần
        $scope.detailLoading = false;
        $scope.detailError = false;
    };

    // Trong controller
    $scope.$on('$destroy', function() {
        // Đóng modal khi component bị hủy
        $scope.closeModal();
        $scope.modalInstance = null;
    });

    $scope.viewInvoiceDetail = function (invoice) {
        $scope.detailLoading = true;
        $scope.detailError = false;

        const foundInvoice = $scope.filteredInvoices.find(inv => inv.id === invoice.id);
    
        if (!foundInvoice) {
            console.error('Không tìm thấy hóa đơn với ID:', invoice);
            $scope.detailError = true;
            $scope.detailLoading = false;
            return;
        }

        // ✅ Format ngày giao hàng thực tế
        foundInvoice.ngaygiaothucte = formatNgayGiaoThucTe(foundInvoice.ngaygiaothucte);

        // Tạo object mới để trigger binding
        $scope.selectedInvoice = angular.copy(foundInvoice);
        $scope.selectedInvoice.chitiethoadon = [];

        $http.get(`https://localhost:7196/api/Hoadonchitiets/Hoa-don-chi-tiet-Theo-Ma-HD-${invoice.id}`)
            .then(function (response) {
                if (!response.data) throw new Error('Dữ liệu trống');

                // Tạo mảng mới để trigger binding
                var newDetails = response.data.map(item => ({
                    id: item.id,
                    idhd: item.idhd,
                    tensanpham: item.tensp || 'Không rõ',
                    anh: item.urlHinhanh ? `https://localhost:7196/picture/${item.urlHinhanh}` : 'https://i.pinimg.com/236x/1a/c8/1a/1ac81aed196c0ca212e6f307b9bdabfa.jpg',
                    dongia: parseFloat(item.giasp) || 0,
                    soluong: parseInt(item.soluong) || 0,
                    mau: item.mau || '-',
                    size: item.size || '-',
                    chatlieu: item.chatlieu || '-',
                    tong: (parseFloat(item.giasp) || 0) * (parseInt(item.soluong) || 0)
                }));

                // Gán bằng angular.copy để trigger binding
                $scope.selectedInvoice.chitiethoadon = angular.copy(newDetails);
                $scope.dataspct = angular.copy(newDetails);
            })
            .catch(error => {
                console.error('Lỗi tải chi tiết:', error);
                $scope.detailError = true;
                $scope.selectedInvoice.chitiethoadon = [];
            })
            .finally(() => {
                $scope.detailLoading = false;
                if (!$scope.$$phase) $scope.$applyAsync();
            });
    };

    // Hàm định dạng ngày nếu chưa được format
    function formatNgayGiaoThucTe(input) {
        if (typeof input !== 'string' || input.includes('/')) {
            return input; // Đã format rồi hoặc không hợp lệ → giữ nguyên
        }

        const date = new Date(input);
        if (isNaN(date.getTime())) return 'Không có dữ liệu';

        return ('0' + date.getDate()).slice(-2) + '/' +
            ('0' + (date.getMonth() + 1)).slice(-2) + '/' +
            date.getFullYear() + ' ' +
            ('0' + date.getHours()).slice(-2) + ':' +
            ('0' + date.getMinutes()).slice(-2);
    }

    $scope.retryLoadDetail = function () {
        if ($scope.selectedInvoice) {
            $scope.viewInvoiceDetail($scope.selectedInvoice);
        }
    };

    $scope.updateInvoicestatus = function (invoiceId, newStatus) {
        const userInfoString = localStorage.getItem("userInfo1");
        const userInfo = JSON.parse(userInfoString);
        var statusMessage = "";
        switch (newStatus) {
            case 1: statusMessage = "Xác nhận đơn hàng"; break;
            case 2: statusMessage = "Chuyển sang trạng thái vận chuyển"; break;
            case 3: statusMessage = "Xác nhận đơn hàng thành công"; break;
            case 4: statusMessage = "Hủy đơn hàng"; break;
            case 5: statusMessage = "Đánh dấu đơn hàng trả hàng"; break;
        }

        if (!confirm('Bạn có chắc chắn muốn ' + statusMessage.toLowerCase() + '?')) {
            return;
        }

        // Nếu là trạng thái chuyển vận
        if (newStatus == 2) {
            return taoDiaChiGiaoHang(invoiceId, userInfo.id);
        }

        if (newStatus == 3) {
            const vietnamDateString = getVietnamTimeString();
        
            return $http.put(`https://localhost:7196/api/Hoadons/trangthaiNV1/${invoiceId}?trangthai=${newStatus}&idnv=${userInfo.id}&ngaygiaohang=${encodeURIComponent(vietnamDateString)}`)
                .then(function (response) {
                    if (response.status === 200) {
                        updateLocalInvoice(invoiceId, newStatus, vietnamDateString);
                        alert(statusMessage + ' thành công!');
                    } else {
                        alert('Cập nhật trạng thái không thành công. Vui lòng thử lại.');
                    }
                })
                .catch(function (error) {
                    console.error('Lỗi khi cập nhật trạng thái:', error);
                    var errorMsg = error.data && error.data.message
                        ? error.data.message
                        : 'Có lỗi xảy ra khi ' + statusMessage.toLowerCase() + '!';
                    alert(errorMsg);
                });
        }
        
    
        // Các trạng thái còn lại
        $http.put(`https://localhost:7196/api/Hoadons/trangthaiNV/${invoiceId}?trangthai=${newStatus}&idnv=${userInfo.id}`)
            .then(function (response) {
                if (response.status === 200) {
                    updateLocalInvoice(invoiceId, newStatus);
                    alert(statusMessage + (newStatus == 3 ? '' : ' thành công!'));
                } else {
                    alert('Cập nhật trạng thái không thành công. Vui lòng thử lại.');
                }
            })
            .catch(function (error) {
                console.error('Lỗi khi cập nhật trạng thái:', error);
                var errorMsg = error.data && error.data.message
                    ? error.data.message
                    : 'Có lỗi xảy ra khi ' + statusMessage.toLowerCase() + '!';
                alert(errorMsg);
            });
    };    

    // Hàm lấy thời gian hiện tại theo giờ Việt Nam định dạng ISO (yyyy-MM-ddTHH:mm:ss)
    function getVietnamTimeString() {
        const now = new Date();
    
        // Tạo đối tượng ngày theo giờ Việt Nam
        const vietnamTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    
        // Format yyyy-MM-ddTHH:mm:ss
        const year = vietnamTime.getFullYear();
        const month = String(vietnamTime.getMonth() + 1).padStart(2, '0');
        const day = String(vietnamTime.getDate()).padStart(2, '0');
        const hours = String(vietnamTime.getHours()).padStart(2, '0');
        const minutes = String(vietnamTime.getMinutes()).padStart(2, '0');
        const seconds = String(vietnamTime.getSeconds()).padStart(2, '0');
    
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }    
   

    function updateLocalInvoice(invoiceId, newStatus, ngaygiaohang = null) {
        const newStatusStr = $scope.getStatusString(newStatus);
    
        var invoice = $scope.invoices.find(i => i.id === invoiceId);
        if (invoice) {
            invoice.trangthai = newStatus;
            invoice.trangthaiStr = newStatusStr;
            if (ngaygiaohang) invoice.ngaygiaothucte = ngaygiaohang;
        }
    
        var filteredInvoice = $scope.filteredInvoices.find(i => i.id === invoiceId);
        if (filteredInvoice) {
            filteredInvoice.trangthai = newStatus;
            filteredInvoice.trangthaiStr = newStatusStr;
            if (ngaygiaohang) filteredInvoice.ngaygiaothucte = ngaygiaohang;
        }
    
        if ($scope.selectedInvoice && $scope.selectedInvoice.id === invoiceId) {
            $scope.selectedInvoice.trangthai = newStatus;
            $scope.selectedInvoice.trangthaiStr = newStatusStr;
            if (ngaygiaohang) $scope.selectedInvoice.ngaygiaothucte = ngaygiaohang;
        }
    
        $scope.calculateCounts();
    }    

    // Hàm chuyển đổi mã trạng thái thành chuỗi
    $scope.getStatusString = function (status) {
        switch (status) {
            case 0: return 'Chờ xác nhận';
            case 1: return 'Đơn hàng đã được xác nhận';
            case 2: return 'Đơn hàng đang được giao';
            case 3: return 'Đơn hàng thành công';
            case 4: return 'Đơn hàng đã huỷ';
            default: return 'Không xác định';
        }
    };

    $scope.selectTab = function (tabName) {
        $scope.selectedTab = tabName;
        loadTabData(tabName);
    };

    function loadTabData(tabName) {
        switch (tabName) {
            case 'unread':
                loadUnreadOrders();
                break;
            case 'read':
                loadReadOrders();
                break;
            case 'old':
                loadOldOrders();
                break;
        }
    }

    // Hàm tải đơn chưa đọc
    let previousUnreadCount = 0; // lưu số lượng cũ

    function loadUnreadOrders() {
        $http.get('https://localhost:7196/api/Hoadons/unread-orders')
            .then(function (response) {
                const currentUnreadOrders = response.data;
                const currentCount = currentUnreadOrders.length;

                // Nếu số lượng đơn chưa đọc tăng lên thì gọi loadInvoices
                if (currentCount > previousUnreadCount) {
                    $scope.loadInvoices();
                }

                // Cập nhật scope và lưu lại số lượng mới
                $scope.unreadOrders = currentUnreadOrders;
                $scope.unreadNotifications = currentCount;
                previousUnreadCount = currentCount;

                console.log("load thành công", currentUnreadOrders);
            })
            .catch(function (error) {
                console.error("Lỗi khi tải đơn chưa đọc:", error);
            });
    }


    // Hàm tải đơn đã đọc
    function loadReadOrders() {
        $http.get('https://localhost:7196/api/Hoadons/read-orders')
            .then(function (response) {
                $scope.readOrders = response.data;
            });
    }

    // Hàm tải đơn cũ
    function loadOldOrders() {
        $http.get('https://localhost:7196/api/Hoadons/old-orders')
            .then(function (response) {
                $scope.oldOrders = response.data;
            });
    }

    $scope.getUnreadOrderIds = function () {
        return $scope.unreadOrders.map(function (o) {
            return o.id;
        });
    };

    // Hàm đánh dấu đã đọc cho 1 đơn hàng
    $scope.markSingleAsRead = function (orderId, event) {
        // Ngăn sự kiện click lan ra phần tử cha
        event.stopPropagation();

        $http.post('https://localhost:7196/api/Hoadons/mark-as-read', [orderId])
            .then(function () {
                var index = $scope.unreadOrders.findIndex(o => o.id === orderId);
                if (index !== -1) {
                    var order = $scope.unreadOrders[index];
                    $scope.unreadOrders.splice(index, 1);
                    $scope.readOrders.unshift(order);
                    $scope.unreadNotifications = $scope.unreadOrders.length;
                }
            });
    };

    // Hàm đánh dấu đã đọc nhiều đơn
    $scope.markAsRead = function (orderIds) {
        $http.post('https://localhost:7196/api/Hoadons/mark-as-read', orderIds)
            .then(function () {
                if (Array.isArray(orderIds)) {
                    orderIds.forEach(function (id) {
                        var index = $scope.unreadOrders.findIndex(o => o.id === id);
                        if (index !== -1) {
                            var order = $scope.unreadOrders[index];
                            $scope.unreadOrders.splice(index, 1);
                            $scope.readOrders.unshift(order);
                        }
                    });
                    $scope.unreadNotifications = $scope.unreadOrders.length;
                }
            });
    };


    $scope.loadUnreadOrdersAndShowModal = function () {
        // Luôn đặt lại tab về 'unread' trước khi mở modal
        $scope.selectedTab = 'unread';
    
        $http.get('https://localhost:7196/api/Hoadons/unread-orders')
            .then(function (response) {
                $scope.unreadOrders = response.data;
                $scope.unreadNotifications = $scope.unreadOrders.length;
    
                // Mở modal
                $('#notificationModal').modal('show');
            }).catch(function (error) {
                console.error("Lỗi khi tải đơn chưa đọc:", error);
            });
    };    
    
    // Khởi tạo ứng dụng
    $scope.init();
});
