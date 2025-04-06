const ranks = [
    {
        id: 1,
        tenrank: "Bronze",
        minMoney: 0,
        maxMoney: 1000000,
        trangthai: 1,
        khachhangs: 24,
        vouchers: 2
    },
    {
        id: 2,
        tenrank: "Silver",
        minMoney: 1000000,
        maxMoney: 5000000,
        trangthai: 1,
        khachhangs: 56,
        vouchers: 3
    },
    {
        id: 3,
        tenrank: "Gold",
        minMoney: 5000000,
        maxMoney: 10000000,
        trangthai: 1,
        khachhangs: 32,
        vouchers: 5
    },
    {
        id: 4,
        tenrank: "Platinum",
        minMoney: 10000000,
        maxMoney: 20000000,
        trangthai: 1,
        khachhangs: 18,
        vouchers: 7
    },
    {
        id: 5,
        tenrank: "Diamond",
        minMoney: 20000000,
        maxMoney: 50000000,
        trangthai: 0,
        khachhangs: 5,
        vouchers: 0
    }
];

// Format tiền tệ VND
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Lấy trạng thái text
function getStatusText(status) {
    switch(parseInt(status)) {
        case 0: return "Không hoạt động";
        case 1: return "Hoạt động";
        case 2: return "Đã xóa";
        default: return "Không xác định";
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

// Hiển thị danh sách rank
function displayRanks(ranksData) {
    const tableBody = document.getElementById('rankTableBody');
    tableBody.innerHTML = '';
    
    ranksData.forEach(rank => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${rank.id}</td>
            <td><span class="badge ${getRankBadgeClass(rank.tenrank)}">${rank.tenrank}</span></td>
            <td>${formatCurrency(rank.minMoney)}</td>
            <td>${formatCurrency(rank.maxMoney)}</td>
            <td>
                <span class="badge ${rank.trangthai === 1 ? 'bg-success' : 'bg-secondary'}">
                    ${getStatusText(rank.trangthai)}
                </span>
            </td>
            <td>${rank.khachhangs}</td>
            <td>${rank.vouchers}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-1 edit-btn" data-id="${rank.id}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${rank.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    document.getElementById('totalRanks').textContent = ranksData.length;
    
    // Thêm event listeners cho các nút
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const rankId = this.getAttribute('data-id');
            openEditModal(rankId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const rankId = this.getAttribute('data-id');
            openDeleteModal(rankId);
        });
    });
}

// Mở modal sửa
function openEditModal(rankId) {
    const rank = ranks.find(r => r.id == rankId);
    if (rank) {
        document.getElementById('editRankId').value = rank.id;
        document.getElementById('editTenrank').value = rank.tenrank;
        document.getElementById('editMinMoney').value = rank.minMoney;
        document.getElementById('editMaxMoney').value = rank.maxMoney;
        document.getElementById('editTrangthai').value = rank.trangthai;
        
        const editModal = new bootstrap.Modal(document.getElementById('editRankModal'));
        editModal.show();
    }
}

// Mở modal xóa
function openDeleteModal(rankId) {
    document.getElementById('deleteRankId').value = rankId;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteRankModal'));
    deleteModal.show();
}

// Khi trang đã tải xong
document.addEventListener('DOMContentLoaded', function() {
    // Hiển thị danh sách rank ban đầu
    displayRanks(ranks);
    
    // Xử lý lọc theo trạng thái
    document.getElementById('statusFilter').addEventListener('change', function() {
        const statusValue = this.value;
        let filteredRanks = ranks;
        
        if (statusValue !== 'all') {
            filteredRanks = ranks.filter(rank => rank.trangthai == statusValue);
        }
        
        displayRanks(filteredRanks);
    });
    
    // Xử lý thêm rank mới
    document.getElementById('saveRankBtn').addEventListener('click', function() {
        const tenrank = document.getElementById('tenrank').value;
        const minMoney = document.getElementById('minMoney').value;
        const maxMoney = document.getElementById('maxMoney').value;
        const trangthai = document.getElementById('trangthai').value;
        
        if (!tenrank || !minMoney || !maxMoney) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }
        
        // Tạo đối tượng rank mới
        const newRank = {
            id: ranks.length + 1, // Trong thực tế, ID sẽ được tạo bởi server
            tenrank: tenrank,
            minMoney: parseFloat(minMoney),
            maxMoney: parseFloat(maxMoney),
            trangthai: parseInt(trangthai),
            khachhangs: 0,
            vouchers: 0
        };
        
        // API call để thêm rank mới
        // fetch('/api/ranks', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(newRank),
        // })
        // .then(response => response.json())
        // .then(data => {
        //     ranks.push(data);
        //     displayRanks(ranks);
        //     const modal = bootstrap.Modal.getInstance(document.getElementById('addRankModal'));
        //     modal.hide();
        //     document.getElementById('addRankForm').reset();
        // })
        // .catch(error => {
        //     console.error('Error:', error);
        //     alert('Đã xảy ra lỗi khi thêm rank mới');
        // });
        
        // Mô phỏng thêm rank mới (xóa khi triển khai API thực tế)
        ranks.push(newRank);
        displayRanks(ranks);
        const modal = bootstrap.Modal.getInstance(document.getElementById('addRankModal'));
        modal.hide();
        document.getElementById('addRankForm').reset();
    });
    
    // Xử lý cập nhật rank
    document.getElementById('updateRankBtn').addEventListener('click', function() {
        const rankId = document.getElementById('editRankId').value;
        const tenrank = document.getElementById('editTenrank').value;
        const minMoney = document.getElementById('editMinMoney').value;
        const maxMoney = document.getElementById('editMaxMoney').value;
        const trangthai = document.getElementById('editTrangthai').value;
        
        if (!tenrank || !minMoney || !maxMoney) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }
        
        // Tạo đối tượng rank cập nhật
        const updatedRank = {
            id: parseInt(rankId),
            tenrank: tenrank,
            minMoney: parseFloat(minMoney),
            maxMoney: parseFloat(maxMoney),
            trangthai: parseInt(trangthai)
        };
        
        // API call để cập nhật rank
        // fetch(`/api/ranks/${rankId}`, {
        //     method: 'PUT',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(updatedRank),
        // })
        // .then(response => response.json())
        // .then(data => {
        //     const index = ranks.findIndex(r => r.id == rankId);
        //     if (index !== -1) {
        //         ranks[index] = { ...ranks[index], ...updatedRank };
        //     }
        //     displayRanks(ranks);
        //     const modal = bootstrap.Modal.getInstance(document.getElementById('editRankModal'));
        //     modal.hide();
        // })
        // .catch(error => {
        //     console.error('Error:', error);
        //     alert('Đã xảy ra lỗi khi cập nhật rank');
        // });
        
        // Mô phỏng cập nhật rank (xóa khi triển khai API thực tế)
        const index = ranks.findIndex(r => r.id == rankId);
        if (index !== -1) {
            ranks[index] = { 
                ...ranks[index], 
                tenrank: tenrank,
                minMoney: parseFloat(minMoney),
                maxMoney: parseFloat(maxMoney),
                trangthai: parseInt(trangthai)
            };
        }
        displayRanks(ranks);
        const modal = bootstrap.Modal.getInstance(document.getElementById('editRankModal'));
        modal.hide();
    });
    
    // Xử lý xóa rank
    document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
        const rankId = document.getElementById('deleteRankId').value;
        
        // API call để xóa rank
        // fetch(`/api/ranks/${rankId}`, {
        //     method: 'DELETE',
        // })
        // .then(response => {
        //     if (response.ok) {
        //         const index = ranks.findIndex(r => r.id == rankId);
        //         if (index !== -1) {
        //             ranks.splice(index, 1);
        //         }
        //         displayRanks(ranks);
        //         const modal = bootstrap.Modal.getInstance(document.getElementById('deleteRankModal'));
        //         modal.hide();
        //     } else {
        //         throw new Error('Không thể xóa rank');
        //     }
        // })
        // .catch(error => {
        //     console.error('Error:', error);
        //     alert('Đã xảy ra lỗi khi xóa rank');
        // });
        
        // Mô phỏng xóa rank (xóa khi triển khai API thực tế)
        const index = ranks.findIndex(r => r.id == rankId);
        if (index !== -1) {
            // Thay vì xóa hoàn toàn, chỉ đánh dấu là đã xóa
            ranks[index].trangthai = 2;
        }
        displayRanks(ranks);
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteRankModal'));
        modal.hide();
    });
});
