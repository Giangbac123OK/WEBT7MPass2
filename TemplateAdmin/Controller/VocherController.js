const vouchers = [
    {
        id: 1,
        mota: "Giảm giá mùa hè",
        donvi: 0, // 0: percentage, 1: fixed amount
        soluong: 100,
        giatri: 10, // 10% or 10,000 VND depending on donvi
        ngaybatdau: "2025-06-01",
        ngayketthuc: "2025-06-30",
        trangthai: 1, // 0: pending, 1: ready, 2: active, 3: used, 4: deleted
        ranks: ["Silver", "Gold", "Platinum"]
    },
    {
        id: 2,
        mota: "Khuyến mãi tháng 7",
        donvi: 0,
        soluong: 50,
        giatri: 15,
        ngaybatdau: "2025-07-01",
        ngayketthuc: "2025-07-15",
        trangthai: 0,
        ranks: ["Gold", "Platinum"]
    },
    {
        id: 3,
        mota: "Giảm giá cố định",
        donvi: 1,
        soluong: 30,
        giatri: 50000,
        ngaybatdau: "2025-05-15",
        ngayketthuc: "2025-05-30",
        trangthai: 2,
        ranks: ["Platinum", "Diamond"]
    },
    {
        id: 4,
        mota: "Ưu đãi thành viên mới",
        donvi: 0,
        soluong: 200,
        giatri: 5,
        ngaybatdau: "2025-04-01",
        ngayketthuc: "2025-12-31",
        trangthai: 2,
        ranks: ["Bronze", "Silver"]
    },
    {
        id: 5,
        mota: "Khuyến mãi đặc biệt",
        donvi: 1,
        soluong: 10,
        giatri: 100000,
        ngaybatdau: "2025-08-01",
        ngayketthuc: "2025-08-05",
        trangthai: 0,
        ranks: ["Diamond"]
    }
];

// Format tiền tệ VND
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Format ngày
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN').format(date);
}

// Lấy text giảm giá
function getDiscountText(donvi, giatri) {
    return donvi == 0 ? `${giatri}%` : formatCurrency(giatri);
}

// Lấy trạng thái text
function getStatusText(status) {
    switch(parseInt(status)) {
        case 0: return "Đang chuẩn bị";
        case 1: return "Sẵn sàng";
        case 2: return "Đang hoạt động";
        case 3: return "Đã sử dụng";
        case 4: return "Đã xóa";
        default: return "Không xác định";
    }
}

// Lấy badge class cho trạng thái
function getStatusBadgeClass(status) {
    switch(parseInt(status)) {
        case 0: return "bg-secondary";
        case 1: return "bg-info";
        case 2: return "bg-success";
        case 3: return "bg-warning";
        case 4: return "bg-danger";
        default: return "bg-secondary";
    }
}

// Lấy badge class cho rank
function getRankBadgeClass(rankName) {
    switch(rankName) {
        case "Bronze": return "badge-bronze";
        case "Silver": return "badge-silver";
        case "Gold": return "badge-gold";
        case "Platinum": return "badge-platinum";
        case "Diamond": return "badge-diamond";
        default: return "bg-secondary";
    }
}

// Hiển thị danh sách voucher
function displayVouchers(vouchersData) {
    const tableBody = document.getElementById('voucherTableBody');
    tableBody.innerHTML = '';
    
    vouchersData.forEach(voucher => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${voucher.id}</td>
            <td>${voucher.mota || '-'}</td>
            <td>${getDiscountText(voucher.donvi, voucher.giatri)}</td>
            <td>${voucher.soluong}</td>
            <td>
                <div class="small">
                    <div><i class="bi bi-calendar-event me-1"></i> Từ: ${formatDate(voucher.ngaybatdau)}</div>
                    <div><i class="bi bi-calendar-event me-1"></i> Đến: ${formatDate(voucher.ngayketthuc)}</div>
                </div>
            </td>
            <td>
                <span class="badge ${getStatusBadgeClass(voucher.trangthai)}">
                    ${getStatusText(voucher.trangthai)}
                </span>
            </td>
            <td>
                <div class="d-flex flex-wrap gap-1">
                    ${voucher.ranks.map(rank => `
                        <span class="badge ${getRankBadgeClass(rank)}">${rank}</span>
                    `).join('')}
                </div>
            </td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-1 edit-btn" data-id="${voucher.id}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${voucher.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    document.getElementById('totalVouchers').textContent = vouchersData.length;
    
    // Thêm event listeners cho các nút
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const voucherId = this.getAttribute('data-id');
            openEditModal(voucherId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const voucherId = this.getAttribute('data-id');
            openDeleteModal(voucherId);
        });
    });
}

// Mở modal sửa
function openEditModal(voucherId) {
    const voucher = vouchers.find(v => v.id == voucherId);
    if (voucher) {
        document.getElementById('editVoucherId').value = voucher.id;
        document.getElementById('editMota').value = voucher.mota || '';
        document.getElementById('editDonvi').value = voucher.donvi;
        document.getElementById('editGiatri').value = voucher.giatri;
        document.getElementById('editSoluong').value = voucher.soluong;
        document.getElementById('editNgaybatdau').value = formatDateForInput(voucher.ngaybatdau);
        document.getElementById('editNgayketthuc').value = formatDateForInput(voucher.ngayketthuc);
        document.getElementById('editTrangthai').value = voucher.trangthai;
        
        // Reset checkboxes
        document.querySelectorAll('.edit-rank-checkbox').forEach(checkbox => {
            checkbox.checked = voucher.ranks.includes(checkbox.value);
        });
        
        const editModal = new bootstrap.Modal(document.getElementById('editVoucherModal'));
        editModal.show();
    }
}

// Format date for input
function formatDateForInput(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Mở modal xóa
function openDeleteModal(voucherId) {
    document.getElementById('deleteVoucherId').value = voucherId;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteVoucherModal'));
    deleteModal.show();
}

// Lấy ranks đã chọn
function getSelectedRanks(selector) {
    const selectedRanks = [];
    document.querySelectorAll(selector).forEach(checkbox => {
        if (checkbox.checked) {
            selectedRanks.push(checkbox.value);
        }
    });
    return selectedRanks;
}

// Khi trang đã tải xong
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo datepicker
    $('.datepicker').datepicker({
        format: 'dd/mm/yyyy',
        language: 'vi',
        autoclose: true,
        todayHighlight: true
    });
    
    // Hiển thị danh sách voucher ban đầu
    displayVouchers(vouchers);
    
    // Xử lý lọc theo trạng thái
    document.getElementById('statusFilter').addEventListener('change', filterVouchers);
    document.getElementById('typeFilter').addEventListener('change', filterVouchers);
    document.getElementById('rankFilter').addEventListener('change', filterVouchers);
    
    function filterVouchers() {
        const statusValue = document.getElementById('statusFilter').value;
        const typeValue = document.getElementById('typeFilter').value;
        const rankValue = document.getElementById('rankFilter').value;
        
        let filteredVouchers = vouchers;
        
        if (statusValue !== 'all') {
            filteredVouchers = filteredVouchers.filter(voucher => voucher.trangthai == statusValue);
        }
        
        if (typeValue !== 'all') {
            filteredVouchers = filteredVouchers.filter(voucher => voucher.donvi == typeValue);
        }
        
        if (rankValue !== 'all') {
            filteredVouchers = filteredVouchers.filter(voucher => voucher.ranks.includes(rankValue));
        }
        
        displayVouchers(filteredVouchers);
    }
    
    // Xử lý thêm voucher mới
    document.getElementById('saveVoucherBtn').addEventListener('click', function() {
        const mota = document.getElementById('mota').value;
        const donvi = document.getElementById('donvi').value;
        const giatri = document.getElementById('giatri').value;
        const soluong = document.getElementById('soluong').value;
        const ngaybatdau = document.getElementById('ngaybatdau').value;
        const ngayketthuc = document.getElementById('ngayketthuc').value;
        const trangthai = document.getElementById('trangthai').value;
        const selectedRanks = getSelectedRanks('.rank-checkbox');
        
        if (!giatri || !soluong || !ngaybatdau || !ngayketthuc || selectedRanks.length === 0) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc và chọn ít nhất một Rank');
            return;
        }
        
        // Chuyển đổi định dạng ngày
        const parseDateFromInput = (dateString) => {
            const parts = dateString.split('/');
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        };
        
        // Tạo đối tượng voucher mới
        const newVoucher = {
            id: vouchers.length + 1, // Trong thực tế, ID sẽ được tạo bởi server
            mota: mota,
            donvi: parseInt(donvi),
            giatri: parseFloat(giatri),
            soluong: parseInt(soluong),
            ngaybatdau: parseDateFromInput(ngaybatdau),
            ngayketthuc: parseDateFromInput(ngayketthuc),
            trangthai: parseInt(trangthai),
            ranks: selectedRanks
        };
        
        // API call để thêm voucher mới
        // fetch('/api/vouchers', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(newVoucher),
        // })
        // .then(response => response.json())
        // .then(data => {
        //     vouchers.push(data);
        //     displayVouchers(vouchers);
        //     const modal = bootstrap.Modal.getInstance(document.getElementById('addVoucherModal'));
        //     modal.hide();
        //     document.getElementById('addVoucherForm').reset();
        // })
        // .catch(error => {
        //     console.error('Error:', error);
        //     alert('Đã xảy ra lỗi khi thêm voucher mới');
        // });
        
        // Mô phỏng thêm voucher mới (xóa khi triển khai API thực tế)
        vouchers.push(newVoucher);
        displayVouchers(vouchers);
        const modal = bootstrap.Modal.getInstance(document.getElementById('addVoucherModal'));
        modal.hide();
        document.getElementById('addVoucherForm').reset();
    });
    
    // Xử lý cập nhật voucher
    document.getElementById('updateVoucherBtn').addEventListener('click', function() {
        const voucherId = document.getElementById('editVoucherId').value;
        const mota = document.getElementById('editMota').value;
        const donvi = document.getElementById('editDonvi').value;
        const giatri = document.getElementById('editGiatri').value;
        const soluong = document.getElementById('editSoluong').value;
        const ngaybatdau = document.getElementById('editNgaybatdau').value;
        const ngayketthuc = document.getElementById('editNgayketthuc').value;
        const trangthai = document.getElementById('editTrangthai').value;
        const selectedRanks = getSelectedRanks('.edit-rank-checkbox');
        
        if (!giatri || !soluong || !ngaybatdau || !ngayketthuc || selectedRanks.length === 0) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc và chọn ít nhất một Rank');
            return;
        }
        
        // Chuyển đổi định dạng ngày
        const parseDateFromInput = (dateString) => {
            const parts = dateString.split('/');
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        };
        
        // Tạo đối tượng voucher cập nhật
        const updatedVoucher = {
            id: parseInt(voucherId),
            mota: mota,
            donvi: parseInt(donvi),
            giatri: parseFloat(giatri),
            soluong: parseInt(soluong),
            ngaybatdau: parseDateFromInput(ngaybatdau),
            ngayketthuc: parseDateFromInput(ngayketthuc),
            trangthai: parseInt(trangthai),
            ranks: selectedRanks
        };
        
        // API call để cập nhật voucher
        // fetch(`/api/vouchers/${voucherId}`, {
        //     method: 'PUT',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(updatedVoucher),
        // })
        // .then(response => response.json())
        // .then(data => {
        //     const index = vouchers.findIndex(v => v.id == voucherId);
        //     if (index !== -1) {
        //         vouchers[index] = { ...vouchers[index], ...updatedVoucher };
        //     }
        //     displayVouchers(vouchers);
        //     const modal = bootstrap.Modal.getInstance(document.getElementById('editVoucherModal'));
        //     modal.hide();
        // })
        // .catch(error => {
        //     console.error('Error:', error);
        //     alert('Đã xảy ra lỗi khi cập nhật voucher');
        // });
        
        // Mô phỏng cập nhật voucher (xóa khi triển khai API thực tế)
        const index = vouchers.findIndex(v => v.id == voucherId);
        if (index !== -1) {
            vouchers[index] = updatedVoucher;
        }
        displayVouchers(vouchers);
        const modal = bootstrap.Modal.getInstance(document.getElementById('editVoucherModal'));
        modal.hide();
    });
    
    // Xử lý xóa voucher
    document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
        const voucherId = document.getElementById('deleteVoucherId').value;
        
        // API call để xóa voucher
        // fetch(`/api/vouchers/${voucherId}`, {
        //     method: 'DELETE',
        // })
        // .then(response => {
        //     if (response.ok) {
        //         const index = vouchers.findIndex(v => v.id == voucherId);
        //         if (index !== -1) {
        //             vouchers.splice(index, 1);
        //         }
        //         displayVouchers(vouchers);
        //         const modal = bootstrap.Modal.getInstance(document.getElementById('deleteVoucherModal'));
        //         modal.hide();
        //     } else {
        //         throw new Error('Không thể xóa voucher');
        //     }
        // })
        // .catch(error => {
        //     console.error('Error:', error);
        //     alert('Đã xảy ra lỗi khi xóa voucher');
        // });
        
        // Mô phỏng xóa voucher (xóa khi triển khai API thực tế)
        const index = vouchers.findIndex(v => v.id == voucherId);
        if (index !== -1) {
            // Thay vì xóa hoàn toàn, chỉ đánh dấu là đã xóa
            vouchers[index].trangthai = 4;
        }
        displayVouchers(vouchers);
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteVoucherModal'));
        modal.hide();
    });
});