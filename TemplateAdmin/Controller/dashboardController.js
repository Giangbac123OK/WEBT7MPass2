app.controller("dashboardController", function($scope, $rootScope, $timeout) {
    // Dữ liệu thống kê cũ
    $scope.stats = {
        totalEmployees: 25,
        totalProducts: 120,
        totalOrders: 305,
        totalRevenue: 15000000
    };

    // Danh sách đơn hàng demo
    $scope.recentOrders = [
        { orderId: "#001", customer: "Nguyễn Văn A", total: 500000, status: "Đã thanh toán" },
        { orderId: "#002", customer: "Trần Thị B", total: 750000, status: "Chờ xác nhận" },
        { orderId: "#003", customer: "Lê Văn C", total: 320000, status: "Đã thanh toán" },
        { orderId: "#004", customer: "Phạm Văn D", total: 1200000, status: "Đang giao" }
    ];

    // Ví dụ 1: Dữ liệu cho biểu đồ "Line" - Doanh thu 7 ngày
    let revenueLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    let revenueData = [1.2, 1.0, 1.8, 2.1, 2.5, 2.0, 2.2]; // Triệu đồng

    // Ví dụ 2: Dữ liệu cho biểu đồ "Bar" - Lượng sản phẩm bán ra 7 ngày
    let productLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    let productData = [10, 8, 12, 15, 20, 18, 22]; // Số sản phẩm bán ra

    // Dùng $timeout(,0) để Angular render xong HTML (canvas có sẵn)
    $timeout(function() {
        // ========== 1. BIỂU ĐỒ LINE ==========
        let ctxLine = document.getElementById('chartLine').getContext('2d');
        let myLineChart = new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: revenueLabels,
                datasets: [{
                    label: 'Doanh thu (Triệu VND)',
                    data: revenueData,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',  // màu nền dưới đường line
                    borderColor: 'rgba(54, 162, 235, 1)',       // màu đường line
                    borderWidth: 2,
                    fill: true, // có tô nền bên dưới line
                    tension: 0.1 // độ cong
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Triệu VND'
                        }
                    }
                }
            }
        });

        // ========== 2. BIỂU ĐỒ BAR ==========
        let ctxBar = document.getElementById('chartBar').getContext('2d');
        let myBarChart = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: productLabels,
                datasets: [{
                    label: 'Sản phẩm bán ra',
                    data: productData,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Số sản phẩm'
                        }
                    }
                }
            }
        });
    }, 0);
});
