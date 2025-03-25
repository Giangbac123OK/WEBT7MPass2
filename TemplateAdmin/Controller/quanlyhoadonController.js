app.controller('quanlyhoadonController', function () {
    document.getElementById("notificationBtn").addEventListener("click", function() {
        const box = document.getElementById("notificationBox");
        box.style.display = box.style.display === "block" ? "none" : "block";
    });

    document.getElementById("closeNotification").addEventListener("click", function() {
        document.getElementById("notificationBox").style.display = "none";
    });
    
    // Đóng thông báo khi click bên ngoài
    document.addEventListener("click", function(event) {
        const notificationBtn = document.getElementById("notificationBtn");
        const notificationBox = document.getElementById("notificationBox");
        
        if (!notificationBtn.contains(event.target) && !notificationBox.contains(event.target)) {
            notificationBox.style.display = "none";
        }
    });
    
    // Xử lý khi modal chi tiết hiển thị
    var orderDetailModal = document.getElementById('orderDetailModal');
    orderDetailModal.addEventListener('show.bs.modal', function (event) {
        // Có thể thêm logic tải dữ liệu chi tiết đơn hàng ở đây
    });
})