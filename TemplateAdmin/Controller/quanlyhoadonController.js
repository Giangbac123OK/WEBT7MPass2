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
        $scope.loadInvoices();
        intervalId;
    };

    // Hàm tải danh sách hóa đơn từ API
    $scope.loadInvoices = function () {
        $scope.loading = true;

        // Tạo promise để lấy tất cả hóa đơn, khách hàng và phương thức thanh toán
        var promises = {
            invoices: $http.get('https://localhost:7196/api/Hoadons'),
            customers: $http.get('https://localhost:7196/api/Khachhangs'),
            paymentMethods: $http.get('https://localhost:7196/api/Phuongthucthanhtoans')
        };

        $q.all(promises).then(function (responses) {
            // Lưu tất cả khách hàng vào cache
            responses.customers.data.forEach(function (customer) {
                $scope.customers[customer.id] = customer;
            });

            // Lưu tất cả phương thức thanh toán vào cache
            responses.paymentMethods.data.forEach(function (method) {
                $scope.paymentMethods[method.id] = method;
            });

            // Xử lý dữ liệu hóa đơn - Lọc chỉ lấy trạng thái 1-4
            $scope.invoices = responses.invoices.data.filter(function (invoice) {
                return invoice.trangthai >= 0 && invoice.trangthai <= 4;
            });

            // Gán thông tin khách hàng và phương thức thanh toán vào từng hóa đơn
            $scope.invoices.forEach(function (invoice) {
                // Gán tên khách hàng
                if (invoice.idkh) {
                    var customer = $scope.customers[invoice.idkh];
                    invoice.tenkhachhang = customer ? customer.ten : 'Khách vãng lai';
                } else {
                    invoice.tenkhachhang = 'Khách vãng lai';
                }

                // Gán tên phương thức thanh toán
                if (invoice.idpttt) {
                    var paymentMethod = $scope.paymentMethods[invoice.idpttt];
                    invoice.tenpttt = paymentMethod ? paymentMethod.tenpttt : 'Không xác định';
                } else {
                    invoice.tenpttt = 'Không xác định';
                }
            });

            $scope.filterInvoices($scope.currentFilter);
            $scope.calculateCounts();
            $scope.loading = false;
        }).catch(function (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            $scope.loading = false;
        });
    };

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

    $scope.retryLoadDetail = function () {
        if ($scope.selectedInvoice) {
            $scope.viewInvoiceDetail($scope.selectedInvoice);
        }
    };

    // Hàm cập nhật trạng thái hóa đơn
    $scope.updateInvoicestatus = function (invoiceId, newStatus) {
        const userInfoString = localStorage.getItem("userInfo");
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

        $http.put(`https://localhost:7196/api/Hoadons/trangthaiNV/${invoiceId}?trangthai=${newStatus}&idnv=${userInfo.id}`)
            .then(function (response) {
                // Kiểm tra status code 200 (thành công)
                if (response.status === 200) {
                    // Cập nhật trạng thái trong danh sách
                    var invoice = $scope.invoices.find(i => i.id === invoiceId);
                    if (invoice) {
                        invoice.trangthai = newStatus;
                        invoice.trangthaiStr = $scope.getStatusString(newStatus);
                    }

                    // Cập nhật trạng thái trong chi tiết nếu đang mở
                    if ($scope.selectedInvoice && $scope.selectedInvoice.id === invoiceId) {
                        $scope.selectedInvoice.trangthai = newStatus;
                        $scope.selectedInvoice.trangthaiStr = $scope.getStatusString(newStatus);
                    }

                    // Cập nhật lại thống kê
                    $scope.calculateCounts();

                    // Hiển thị thông báo thành công
                    if (newStatus == 3) {
                        alert(statusMessage);
                    } else {
                        alert(statusMessage + ' thành công!');
                    }
                } else {
                    alert('Cập nhật trạng thái không thành công. Vui lòng thử lại.');
                }
            })
            .catch(function (error) {
                console.error('Lỗi khi cập nhật trạng thái:', error);

                // Hiển thị thông báo lỗi chi tiết nếu có
                var errorMsg = error.data && error.data.message
                    ? error.data.message
                    : 'Có lỗi xảy ra khi ' + statusMessage.toLowerCase() + '!';
                alert(errorMsg);
            });
    };

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
    function loadUnreadOrders() {
        $http.get('https://localhost:7196/api/Hoadons/unread-orders')
            .then(function (response) {
                $scope.unreadOrders = response.data;
                $scope.unreadNotifications = $scope.unreadOrders.length;
            });
        console.log("load thàng công", $scope.unreadOrders)
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


    // Khi modal được mở
    $('#notificationModal').on('shown.bs.modal', function () {
        $scope.$apply(function () {
            $scope.selectedTab = 'unread';
            loadUnreadOrders();
        });
    });

    const intervalId = setInterval(loadUnreadOrders, 3000);

    // Khởi tạo ứng dụng
    $scope.init();
});
