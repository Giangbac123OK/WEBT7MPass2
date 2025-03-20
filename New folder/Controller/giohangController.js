app.controller("GiohangCtrl", function ($document, $rootScope, $scope, $compile, $location, $timeout) {
    const apiUrls = {
        gioHang: "https://localhost:7196/api/Giohang/giohangkhachhang",
        gioHangChiTiet: "https://localhost:7196/api/Giohangchitiet/giohangchitietbygiohang",
        sanPhamChiTiet: "https://localhost:7196/api/Sanphamchitiets",
        sanPham: "https://localhost:7196/api/Sanphams",
        Size: "https://localhost:7196/api/size",
        Chatlieu: "https://localhost:7196/api/ChatLieu",
        Mau: "https://localhost:7196/api/color",
        saleChiTiet: "https://localhost:7196/api/Salechitiet/SanPhamCT",
        giohangchitietbyspctandgh: "https://localhost:7196/api/Giohangchitiet/idghctbygiohangangspct"
    };

    // Hàm lấy thông tin khách hàng từ localStorage
    function GetByidKH() {
        const userInfoString = localStorage.getItem("userInfo");
    
        if (userInfoString === null) {
            $location.path(`/login`);
            return null; // Ngăn chặn việc tiếp tục chạy code
        }
    
        try {
            const userInfo = JSON.parse(userInfoString);
            return userInfo?.id || null;
        } catch (error) {
            console.error("Lỗi khi phân tích dữ liệu userInfo:", error);
            return null;
        }
    }
    

    // Hàm lấy id giỏ hàng
    async function fetchGioHangId(idkh) {
        try {
            const response = await fetch(`${apiUrls.gioHang}/${idkh}`);
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy id giỏ hàng:", error);
            return null;
        }
    }

    // Hàm lấy danh sách chi tiết giỏ hàng
    async function fetchGioHangChiTiet(gioHangId) {
        try {
            const response = await fetch(`${apiUrls.gioHangChiTiet}/${gioHangId}`);
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy danh sách chi tiết giỏ hàng:", error);
            return [];
        }
    }

    // Hàm gọi API để lấy sản phẩm chi tiết theo idspct
    async function fetchSanPhamChitiet(sanPhamCTId) {
        try {
            // Kiểm tra nếu idspct có giá trị hợp lệ
            if (!sanPhamCTId) {
                console.error("idspct không hợp lệ");
                return null;
            }

            // Gọi API với idspct
            const response = await fetch(`${apiUrls.sanPhamChiTiet}/${sanPhamCTId}`);

            if (!response.ok) {
                throw new Error(`Lỗi API: ${response.status}`);
            }

            const data = await response.json();

            // Nếu API trả về một đối tượng, chuyển đổi nó thành mảng
            return Array.isArray(data) ? data : [data];
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm chi tiết:", error);
            return null; // Trả về null nếu có lỗi
        }
    }

    // Hàm lấy danh sách Size
    async function fetchSizes(idsize) {
        try {
            const response = await fetch(apiUrls.Size);
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy danh sách Size:", error);
            return [];
        }
    }

    // Hàm lấy danh sách Chất liệu
    async function fetchChatLieu(idchatlieu) {
        try {
            const response = await fetch(apiUrls.Chatlieu);
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy danh sách Chất liệu:", error);
            return [];
        }
    }

    // Hàm lấy danh sách Màu sắc
    async function fetchMauSac(idcolor) {
        try {
            const response = await fetch(apiUrls.Mau);
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy danh sách Màu sắc:", error);
            return [];
        }
    }
    
    async function layTenSanPham(id) {
        try {
            const response = await fetch(`${apiUrls.sanPham}/${id}`); 
            if (!response.ok) throw new Error("Lỗi khi lấy dữ liệu sản phẩm!");
            
            const data = await response.json();
            return data.tenSanpham;
        } catch (error) {
            console.error("Lỗi lấy sản phẩm:", error);
            return "N/A"; // Tránh lỗi nếu API thất bại
        }
    }

    async function renderGioHang() {
        const idkh = GetByidKH();
        if (!idkh) return;
    
        const idgh = await fetchGioHangId(idkh);
        if (!idgh) return;
    
        const gioHangChiTiet = await fetchGioHangChiTiet(idgh.id);
        if (!gioHangChiTiet) return;
    
        let danhSachSanPham = [];
    
        for (const item of gioHangChiTiet) {
            const sanPhamChiTiet = await fetchSanPhamChitiet(item.idspct);
            if (!sanPhamChiTiet) continue;
    
            sanPhamChiTiet.soluonggiohang = item.soluong;
            sanPhamChiTiet.idgh = item.id;
    
            // Lấy thông tin size, chất liệu, màu
            sanPhamChiTiet.size = await fetchSizes(sanPhamChiTiet.sizeId);
            sanPhamChiTiet.chatLieu = await fetchChatLieu(sanPhamChiTiet.chatLieuId);
            sanPhamChiTiet.mau = await fetchMauSac(sanPhamChiTiet.mauId);
    
            danhSachSanPham.push(sanPhamChiTiet);
        }
    
        hienThiGioHang(danhSachSanPham);
    }
       
    async function hienThiGioHang(sanPhamChitiets) {
        const tbody = document.querySelector("tbody");
        tbody.innerHTML = ""; // Xóa nội dung cũ
    
        console.log(sanPhamChitiets);
    
        let tongTien = 0;
    
        for (const sp of sanPhamChitiets) {
            for (const data of sp) {
                let tenSanPham = "N/A";
                let anhSanPham = data.urlHinhanh || "";
                let mau = "N/A";
                let size = "N/A";
                let chatLieu = "N/A";
                let thanhTien = 0;
    
                // Lấy hình ảnh từ API
                try {
                    const response = await fetch(`${apiUrls.sanPhamChiTiet}/GetImageById/${data.id}`);
                    if (response.ok) {
                        const blob = await response.blob();
                        anhSanPham = URL.createObjectURL(blob); // Cập nhật ảnh lấy được
                    }
                } catch (error) {
                    console.error("Lỗi tải ảnh:", error);
                }
    
                // Lấy tên sản phẩm
                if (data.idsp) {
                    tenSanPham = await layTenSanPham(data.idsp);
                }
    
                // Lọc màu sắc theo idMau
                if (Array.isArray(sp.mau) && sp.mau.length > 0) {
                    const mauTimThay = sp.mau.find(m => m.id === data.idMau);
                    mau = mauTimThay ? mauTimThay.tenmau : "N/A";
                }
    
                // Lọc kích thước theo idSize
                if (Array.isArray(sp.size) && sp.size.length > 0) {
                    const sizeTimThay = sp.size.find(s => s.id === data.idSize);
                    size = sizeTimThay ? sizeTimThay.sosize : "N/A";
                }
    
                // Lọc chất liệu theo idChatLieu
                if (Array.isArray(sp.chatLieu) && sp.chatLieu.length > 0) {
                    const chatLieuTimThay = sp.chatLieu.find(cl => cl.id === data.idChatLieu);
                    chatLieu = chatLieuTimThay ? chatLieuTimThay.tenchatlieu : "N/A";
                }
    
                // Tính thành tiền
                if (data.giathoidiemhientai && data.soluonggiohang) {
                    thanhTien = data.giathoidiemhientai * data.soluonggiohang;
                }
    
                tongTien += thanhTien;
    
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td class="align-middle"><input type="checkbox"></td>
                    <td class="align-middle">
                        <img src="${anhSanPham}" alt="Ảnh sản phẩm" class="rounded" width="100px">
                    </td>
                    <td class="align-middle" style="width: 20%;"><strong>${tenSanPham}</strong></td>
                    <td class="align-middle">${mau}</td>
                    <td class="align-middle">${size}</td>
                    <td class="align-middle">${chatLieu}</td>
                    <td class="align-middle">${data.giathoidiemhientai.toLocaleString()}₫</td>
                    <td class="align-middle">
                        <div class="d-flex justify-content-center align-items-center">
                            <button type="button" class="btn btn-sm btn-outline-dark" onclick="capNhatSoLuong('${data.idgh}', -1)">-</button>
                            <span class="px-3">${sp.soluonggiohang || 0}</span>
                            <button type="button" class="btn btn-sm btn-outline-dark" onclick="capNhatSoLuong('${data.idgh}', 1)">+</button>
                        </div>
                    </td>
                    <td class="align-middle">${thanhTien.toLocaleString()}₫</td>
                    <td class="align-middle">
                        <a href="#" class="text-danger" onclick="xoaSanPham('${data.idgh}')"><i class="bi bi-trash3-fill"></i></a>
                    </td>
                `;
    
                tbody.appendChild(row);
            }
        }
    
        // Cập nhật tổng thanh toán
        document.getElementById("tongThanhToan").innerText = tongTien.toLocaleString() + "₫";
    }
        

    function capNhatSoLuong(idgh, thayDoi) {
        const sanPham = $scope.sanPhamChitiets.find(sp => sp.idgh === idgh);
        if (!sanPham) return;
    
        sanPham.soluonggiohang += thayDoi;
        if (sanPham.soluonggiohang < 1) sanPham.soluonggiohang = 1;
    
        hienThiGioHang($scope.sanPhamChitiets);
    }

    function xoaSanPham(idgh) {
        $scope.sanPhamChitiets = $scope.sanPhamChitiets.filter(sp => sp.idgh !== idgh);
        hienThiGioHang($scope.sanPhamChitiets);
    }    
        
    renderGioHang();
});