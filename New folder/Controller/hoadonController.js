app.controller("hoadonCtr", function ($document, $rootScope, $routeParams, $scope, $location, $timeout) {
    GetByidKH();
    $scope.selectedSPCTId = $routeParams.id;
    $scope.inputQuantity = $location.search().quantity;
    const priceElement = document.querySelector(".total-price");

    let danhSachSanPham = [];
    let sale = [];

    window.onload = function () {
        if ($scope.inputQuantity && priceElement) {
            updateTotalPrice();
        }
    };

    const apiSPCTUrl = "https://localhost:7196/api/Sanphamchitiets";
    const apiSPUrl = "https://localhost:7196/api/Sanphams";
    const discountApiUrl = "https://localhost:7196/api/Giamgia";
    const apiKHUrl = "https://localhost:7196/api/Khachhangs";
    const apiSize = "https://localhost:7196/api/size";
    const apiChatlieu = "https://localhost:7196/api/ChatLieu";
    const apiMau = "https://localhost:7196/api/color";
    const apiAddressList = "https://localhost:7196/api/Diachi";

    async function fetchSanPhamChitiet() {
        try {
            // Kiểm tra nếu selectedSPCTId có giá trị hợp lệ
            if (!$scope.selectedSPCTId) {
                console.error("idspct không hợp lệ");
                return null;
            }

            // Gọi API với idspct
            const response = await fetch(`${apiSPCTUrl}/${$scope.selectedSPCTId}`);

            if (!response.ok) {
                throw new Error(`Lỗi API: ${response.status}`);
            }

            const data = await response.json();

            // Nếu API trả về một đối tượng, chuyển đổi nó thành mảng
            $scope.sanPhamChiTiet = Array.isArray(data) ? data : [data];

            console.log("Dữ liệu sản phẩm chi tiết:", $scope.sanPhamChiTiet);
            $scope.$apply(); // Cập nhật lại giao diện
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm chi tiết:", error);
        }
        return $scope.sanPhamChiTiet;
    }

    async function fetchSanPhamById(idsp) {
        try {
            const response = await fetch(`${apiSPUrl}/${idsp}`);
            if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy thông tin sản phẩm:", error);
            return null;
        }
    }

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

    function updateTotalPrice(priceElement, priceOriginal, quantity) {
        const totalPrice = quantity * priceOriginal;
        priceElement.textContent = `${totalPrice.toLocaleString('vi-VN')} VNĐ`;
    }

    // Hàm lấy thông tin khách hàng từ API và cập nhật vào HTML
    async function fetchkhachangById() {
        // Lấy ID khách hàng
        const idkh = GetByidKH();
        if (!idkh) {
            console.warn("Không thể lấy ID khách hàng.");
            return;
        }

        try {
            // Gửi yêu cầu đến API với idkh
            const response = await fetch(`${apiKHUrl}/${idkh}`);

            // Kiểm tra nếu response không ok, vứt lỗi
            if (!response.ok) {
                throw new Error(`Lỗi API: ${response.status}`);
            }

            // Chuyển đổi dữ liệu JSON
            const khachHangData = await response.json();

            // Kiểm tra xem dữ liệu có hợp lệ hay không
            if (!khachHangData) {
                throw new Error("Dữ liệu khách hàng không hợp lệ.");
            }

            // Hiển thị dữ liệu vào HTML nếu các phần tử tồn tại
            if (document.getElementById("hovaten")) {
                document.getElementById("hovaten").innerText = khachHangData.ten || "Chưa cập nhật";
            }
            if (document.getElementById("sdt")) {
                document.getElementById("sdt").innerText = khachHangData.sdt || "Chưa cập nhật";
            }
            if (document.getElementById("diachi")) {
                document.getElementById("diachi").innerText = khachHangData.diachi || "Chưa cập nhật";
            }
            if (document.getElementById("diemsudung")) {
                // Lấy điểm sử dụng, đảm bảo giá trị không bị null
                const diemsudung = parseInt(khachHangData.diemsudung || "0", 10);
                document.getElementById("diemsudung").innerText = `${diemsudung.toLocaleString()} VNĐ`;

                // Xử lý trạng thái checkbox
                const diemsudungCheckbox = document.getElementById("diemsudungcheckbox");
                if (diemsudung === 0) {
                    diemsudungCheckbox.checked = false; // Bỏ chọn nếu chưa có điểm
                    diemsudungCheckbox.disabled = true; // Vô hiệu hóa checkbox
                    console.log("Điểm sử dụng = 0: Checkbox bị vô hiệu hóa.");
                } else {
                    diemsudungCheckbox.disabled = false; // Cho phép chọn nếu có điểm
                    console.log(`Điểm sử dụng = ${diemsudung}: Checkbox được bật.`);
                }
            }
            // Trả về dữ liệu khách hàng
            return khachHangData;

        } catch (error) {
            // Hiển thị thông báo lỗi khi có vấn đề xảy ra
            console.error("Lỗi khi lấy thông tin khách hàng:", error);
            alert("Có lỗi xảy ra khi tải thông tin khách hàng. Vui lòng thử lại.");
        }
    }

    async function fetchSaleChiTietBySPCTId(spctId) {
        try {
            if (!spctId) {
                console.error("ID sản phẩm chi tiết không hợp lệ");
                return null;
            }

            // Gọi API giảm giá chi tiết
            const response = await fetch(`https://localhost:7196/api/Salechitiets/SanPhamCT/${spctId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    return null; // Không tìm thấy, trả về null
                }
                throw new Error(`Lỗi API giảm giá: ${response.status}`);
            }

            return await response.json(); // Trả về dữ liệu JSON nếu thành công
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu giảm giá chi tiết:", error);
            return null; // Trả về null nếu có lỗi
        }
    }

    function calculateDiscountPrice(giaHienTai, giatrigiam, donVi) {
        if (donVi === 0) {
            return giaHienTai - giatrigiam; // Giảm giá theo giá trị trực tiếp
        } else if (donVi === 1) {
            return giaHienTai * (1 - giatrigiam / 100);
        }
        return giaHienTai; // Nếu không xác định, giữ nguyên giá
    }

    async function fetchSizes(idsize) {
        try {
            const response = await fetch(apiSize);
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy danh sách Size:", error);
            return [];
        }
    }

    // Hàm lấy danh sách Chất liệu
    async function fetchChatLieu(idchatlieu) {
        try {
            const response = await fetch(apiChatlieu);
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy danh sách Chất liệu:", error);
            return [];
        }
    }

    // Hàm lấy danh sách Màu sắc
    async function fetchMauSac(idcolor) {
        try {
            const response = await fetch(apiMau);
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy danh sách Màu sắc:", error);
            return [];
        }
    }

    function initializeTotalPrices() {
        const productItems = document.querySelectorAll(".product-item");
        productItems.forEach((productItem) => {
            const priceElement = productItem.querySelector(".total-price");
            const priceOriginal = parseInt(
                productItem.querySelector(".text-danger.fw-bold").textContent.replace(" VNĐ", "").replace(/\./g, "")
            );

            // Lấy số lượng từ danhSachSanPham
            const quantity = parseInt(productItem.querySelector(".quantity-display").textContent || 1);

            // Cập nhật tổng giá mặc định
            updateTotalPrice(priceElement, priceOriginal, quantity);
        });
    }
    function updateTotals() {
        const productItems = document.querySelectorAll(".product-item");
        const discountElement = document.querySelector("#soTienGiamGia");
        const totalProductElement = document.querySelector("#tongSanPham");
        const totalInvoiceElement = document.querySelector("#tongHoaDon");

        let totalProduct = 0;

        // Tính tổng giá trị sản phẩm
        productItems.forEach((item) => {
            const priceElement = item.querySelector(".total-price");
            if (priceElement) {
                const price = parseInt(priceElement.textContent.replace(" VNĐ", "").replace(/\./g, "")) || 0;
                totalProduct += price;
            }
        });

        // Lấy số tiền giảm giá và đảm bảo nó luôn là giá trị dương
        let discount = parseInt(discountElement.textContent.replace(/[VNĐ.\-]/g, "")) || 0;

        // Cập nhật giá trị
        totalProductElement.textContent = `${totalProduct.toLocaleString('vi-VN')} VNĐ`;

        // Nếu tổng hóa đơn nhỏ hơn 0, thì gán giá trị bằng 0
        const totalInvoiceValue = Math.max(0, totalProduct - discount);
        totalInvoiceElement.textContent = `${totalInvoiceValue.toLocaleString('vi-VN')} VNĐ`;
    }

    // Hàm render sản phẩm
    async function renderSanPham() {
        const sanPhamChitiets = await fetchSanPhamChitiet();
        const productList = document.querySelector(".product-list");
        $scope.quantity = $scope.inputQuantity;

        if (sanPhamChitiets.length === 0) {
            productList.innerHTML = "<p>Không có sản phẩm nào để hiển thị.</p>";
            return;
        }

        danhSachSanPham = []; // Reset lại danh sách sản phẩm mỗi lần render lại

        // Duyệt qua tất cả sản phẩm chi tiết (spct) để render thông tin sản phẩm
        for (const sanPham of sanPhamChitiets) {
            const { id, idsp, giathoidiemhientai } = sanPham;

            const sanPhamData = await fetchSanPhamById(idsp);
            if (!sanPhamData) continue;

            const saleChiTiet = await fetchSaleChiTietBySPCTId(id);
            let giaGiam = null; // Giá giảm mặc định là null

            if (saleChiTiet != null) {
                const { giatrigiam, donvi } = saleChiTiet;
                giaGiam = calculateDiscountPrice(giathoidiemhientai, giatrigiam, donvi);
                sale.push({
                    id: saleChiTiet.id,
                })
            }

            let mau = "N/A";
            let size = "N/A";
            let chatLieu = "N/A";
            let anhSanPham = "";
            const response = await fetch(`${apiSPCTUrl}/GetImageById/${sanPham.id}`);
            if (response.ok) {
                const blob = await response.blob();
                anhSanPham = URL.createObjectURL(blob);
            }

            sanPhamData.size = await fetchSizes(sanPham.idSize);
            sanPhamData.chatLieu = await fetchChatLieu(sanPham.idChatLieu);
            sanPhamData.mau = await fetchMauSac(sanPham.idMau);

            if (Array.isArray(sanPhamData.mau) && sanPhamData.mau.length > 0) {
                const mauTimThay = sanPhamData.mau.find(m => m.id === sanPham.idMau);
                mau = mauTimThay ? mauTimThay.tenmau : "N/A";
            }

            if (Array.isArray(sanPhamData.size) && sanPhamData.size.length > 0) {
                const sizeTimThay = sanPhamData.size.find(s => s.id === sanPham.idSize);
                size = sizeTimThay ? sizeTimThay.sosize : "N/A";
            }

            if (Array.isArray(sanPhamData.chatLieu) && sanPhamData.chatLieu.length > 0) {
                const chatLieuTimThay = sanPhamData.chatLieu.find(cl => cl.id === sanPham.idChatLieu);
                chatLieu = chatLieuTimThay ? chatLieuTimThay.tenchatlieu : "N/A";
            }

            let thuocTinhSelects = `
            <div class="badge bg-primary text-white text-center d-inline-block me-2" style="pointer-events: none;">${mau}</div>
            <div class="badge bg-primary text-white text-center d-inline-block me-2" style="pointer-events: none;">${size}</div>
            <div class="badge bg-primary text-white text-center d-inline-block me-2" style="pointer-events: none;">${chatLieu}</div>
        `;

            danhSachSanPham.push({
                id: id,
                idsp: idsp,
                tensp: sanPhamData.tenSanpham,
                giathoidiemhientai: giathoidiemhientai,
                soluong: $scope.quantity,
                giamgia: giaGiam || 0,
            });

            // Tạo HTML
            const productItem = document.createElement("div");
            productItem.className = "product-item d-flex align-items-center py-2 border-bottom";

            const giaHienThi = giaGiam
                ? `<span class="text-muted text-decoration-line-through">${Number(giathoidiemhientai).toLocaleString('vi-VN')} VNĐ</span>
                   <span class="text-danger fw-bold ms-2">${Number(giaGiam).toLocaleString('vi-VN')} VNĐ</span>`
                : `<span class="text-danger fw-bold">${Number(giathoidiemhientai).toLocaleString('vi-VN')} VNĐ</span>`;

            productItem.innerHTML = `
            <div class="d-flex align-items-center" style="width: 50%;">
                <img src="${anhSanPham}" alt="Product Image" style="width: 80px; height: auto;">
                <div class="ms-3" style="flex: 1;">
                    <p class="mb-1 fw-bold">${sanPhamData.tenSanpham}</p>
                    <span class="text-muted">Phân Loại Hàng:</span>
                    ${thuocTinhSelects}
                </div>
            </div>
            <div class="d-flex justify-content-between align-items-center" style="width: 50%;">
                <div class="text-center" style="width: 50%; display: ruby;">
                    ${giaHienThi}
                </div>
                <div class="d-flex justify-content-center align-items-center" style="width: 15%;">
                    <span class="text-black fw-bold quantity-display">${$scope.quantity}</span>
                </div>
                <div class="text-center text-danger fw-bold total-price" style="width: 35%;"></div>
            </div>
            `;
            productList.appendChild(productItem);
        }

        initializeTotalPrices();
        updateTotals();
    }

    const loadAddressesByIdKH = async () => {
        const idKH = GetByidKH(); // Hàm logic lấy idKH
        const addressSelect = document.getElementById("addressSelect");

        // Kiểm tra `idKH`
        if (!idKH) {
            addressSelect.innerHTML = '<option disabled selected value="">Không tìm thấy mã khách hàng</option>';
            addressSelect.disabled = true;
            return; // Ngưng thực hiện nếu không có `idKH`
        }

        // Gọi API lấy danh sách địa chỉ
        const response = await fetch(`${apiAddressList}/khachhang/${idKH}`);

        // Kiểm tra xem API có trả về dữ liệu không
        if (!response.ok) {
            throw new Error("Không thể lấy dữ liệu từ server.");
        }

        const data = await response.json(); // Chuyển dữ liệu sang JSON

        // Kiểm tra dữ liệu trả về có hợp lệ không
        if (!data || data.length === 0) {
            // Không có địa chỉ nào
            addressSelect.innerHTML = '<option disabled selected value="">Tài khoản này chưa có địa chỉ, vui lòng thêm địa chỉ</option>';
            addressSelect.disabled = true; // Dropdown không tương tác
        } else {
            // Có danh sách địa chỉ
            addressSelect.innerHTML = '<option disabled selected value="" required>Chọn địa chỉ...</option>';
            data.forEach(address => {
                addressSelect.innerHTML += `<option value="${address.id}">${address.tennguoinhan} - ${address.sdtnguoinhan}, ${address.diachicuthe} - ${address.phuongxa} - ${address.quanhuyen} - ${address.thanhpho}</option>`;
            });
            addressSelect.disabled = false; // Dropdown hoạt động
        }
    };

    document.getElementById("btnSaveAddress").addEventListener("click", async function () {
        var addressSelect = document.getElementById("addressSelect");
        var selectedAddressId = addressSelect.value; // Lấy id của địa chỉ đã chọn

        // Kiểm tra xem người dùng có chọn địa chỉ không
        if (!selectedAddressId) {
            Swal.fire("Lỗi", "Vui lòng chọn một địa chỉ", "error");
            return;
        }

        // Lấy thông tin địa chỉ chi tiết từ API hoặc mảng địa chỉ
        try {
            const response = await axios.get(`${apiAddressList}/${selectedAddressId}`);

            if (response && response.data) {
                // Tạo địa chỉ mới từ thông tin chi tiết của địa chỉ
                var newAddress = response.data.diachicuthe + ", " +
                    response.data.phuongxa + ", " +
                    response.data.quanhuyen + ", " +
                    response.data.thanhpho;

                // Cập nhật thông tin địa chỉ vào phần tử có id "diachi"
                document.getElementById("diachi").textContent = newAddress;
                document.getElementById("sdt").textContent = response.data.sdtnguoinhan;
                document.getElementById("hovaten").textContent = response.data.tennguoinhan;

                // Xóa phần tử "Mặc định" nếu có
                var defaultBadge = document.querySelector(".badge.bg-primary-subtle.text-success");
                if (defaultBadge) {
                    defaultBadge.remove(); // Xóa "Mặc định"
                }

                // Hiển thị nút "Khôi phục" nếu địa chỉ đã thay đổi
                document.getElementById("btnRestoreAddress").style.display = 'inline-block';

                // Ẩn modal sau khi lưu địa chỉ
                var modal = bootstrap.Modal.getInstance(document.getElementById("exampleModal"));
                modal.hide();

                // Hiển thị kết quả sau khi lưu thành công
                printResult();
                Swal.fire("Thành Công", "Thay đổi địa chỉ thành công.", "success");
            } else {
                Swal.fire("Lỗi", "Không tìm thấy thông tin địa chỉ.", "error");
            }
        } catch (error) {
            Swal.fire("Lỗi", "Không thể tải thông tin địa chỉ", "error");
            console.error(error);
        }
    });

    /// Lắng nghe sự kiện "Khôi phục" địa chỉ mặc định
    document.getElementById("btnRestoreAddress").addEventListener("click", function () {
        // Gọi API để lấy lại địa chỉ mặc định
        fetchkhachangById()
            .then(data => {
                // Kiểm tra xem dữ liệu trả về có chứa địa chỉ không
                if (data && data.diachi) {
                    var defaultAddress = data.diachi; // Cập nhật theo cấu trúc dữ liệu thực tế

                    // Cập nhật lại địa chỉ mặc định vào phần tử "diachi"
                    var diachiElement = document.getElementById("diachi");
                    if (diachiElement) {
                        diachiElement.textContent = defaultAddress;
                        document.getElementById("sdt").textContent = data.sdt;
                        document.getElementById("hovaten").textContent = data.ten;

                        // Kiểm tra và hiển thị lại phần tử "Mặc định"
                        var badge = document.querySelector(".badge.bg-primary-subtle.text-success");
                        if (badge) {
                            badge.remove(); // Xóa phần tử "Mặc định" cũ nếu có
                        }

                        // Tạo phần tử "Mặc định" mới
                        var newBadge = document.createElement("span");
                        newBadge.classList.add("badge", "bg-primary-subtle", "text-success", "border", "border-success", "me-2");
                        newBadge.style.marginLeft = "10px";
                        newBadge.textContent = "Mặc định";
                        diachiElement.appendChild(newBadge);
                    }

                    // Ẩn nút khôi phục sau khi đã khôi phục địa chỉ mặc định
                    document.getElementById("btnRestoreAddress").style.display = 'none';
                    // Ẩn modal sau khi lưu địa chỉ
                    var modal = bootstrap.Modal.getInstance(document.getElementById("exampleModal"));
                    modal.hide();

                    // Hiển thị thông báo lỗi giả
                    Swal.fire("Thành Công", "Khôi phục địa chỉ mặc định thành công.", "success");
                } else {
                    // Nếu không có địa chỉ trong dữ liệu trả về, thông báo lỗi
                    Swal.fire("Lỗi", "Không tìm thấy địa chỉ mặc định.", "error");
                }
            })
            .catch(error => {
                // Thông báo lỗi khi gọi API
                Swal.fire("Lỗi", "Lỗi khi khôi phục địa chỉ: " + error.message, "error");
            });
    });

    var printResult = () => {
        let province = document.querySelector("#province") ? document.querySelector("#province").value : '';
        let district = document.querySelector("#district") ? document.querySelector("#district").value : '';
        let ward = document.querySelector("#ward") ? document.querySelector("#ward").value : '';

        // Nếu tất cả các dropdown đều có giá trị đã chọn, hiển thị kết quả
        if (province && district && ward) {
            let result = `${document.querySelector("#province").selectedOptions[0].text} | ` +
                `${document.querySelector("#district").selectedOptions[0].text} | ` +
                `${document.querySelector("#ward").selectedOptions[0].text}`;
            if (document.querySelector("#result")) {
                document.querySelector("#result").textContent = result; // Hiển thị kết quả
            }
        }
    };

    document.getElementById('diemsudungcheckbox').addEventListener('change', function () {
        const diemsudungElement = document.getElementById('diemsudung');
        const tongHoaDonElement = document.getElementById('tongHoaDon');
        const diemSuDungHienThiElement = document.getElementById('diemSuDungHienThi'); // Đối tượng hiển thị số điểm sử dụng bên cạnh hóa đơn

        // Lấy giá trị điểm sử dụng và tổng hóa đơn
        const diemsudung = parseInt(diemsudungElement.innerText.replace(/[VNĐ.,]/g, "").trim() || "0", 10);
        let tongHoaDon = parseInt(tongHoaDonElement.innerText.replace(/[VNĐ.,]/g, "") || "0", 10);

        // Kiểm tra trạng thái checkbox
        if (this.checked) {
            // Nếu điểm sử dụng lớn hơn hoặc bằng tổng hóa đơn, chỉ trừ đủ số tiền trong hóa đơn
            if (diemsudung >= tongHoaDon) {
                diemTru = tongHoaDon;  // Lưu số tiền trừ vào biến diemTru
                tongHoaDon = 0;         // Trừ hết số tiền
            } else {
                diemTru = diemsudung;  // Lưu số tiền trừ vào biến diemTru
                tongHoaDon -= diemsudung;  // Trừ số điểm sử dụng vào tổng hóa đơn
            }

            // Cập nhật số điểm sử dụng hiển thị bên cạnh hóa đơn
            diemSuDungHienThiElement.innerText = `Sử dụng: ${diemTru.toLocaleString()} VNĐ`;

        } else {
            // Nếu bỏ chọn, hoàn lại số tiền đã trừ
            tongHoaDon += diemTru;  // Cộng lại số tiền đã trừ
            diemTru = 0;  // Reset lại biến diemTru

            // Ẩn số điểm sử dụng bên cạnh hóa đơn khi checkbox không được chọn
            diemSuDungHienThiElement.innerText = '';
        }

        // Cập nhật tổng hóa đơn
        tongHoaDonElement.innerText = `${tongHoaDon.toLocaleString()} VNĐ`;
    });
    document.querySelectorAll('.voucher-card').forEach(card => {
        card.addEventListener('click', function () {
            // Lấy ra id của voucher được chọn từ thẻ card
            var radioButtonId = card.id.replace('card-', '');

            // Đánh dấu radio button tương ứng với thẻ card được chọn
            var radioButton = document.getElementById(radioButtonId);
            radioButton.checked = true;

            // Thêm lớp 'selected-card' vào thẻ card để làm nổi bật
            document.querySelectorAll('.voucher-card').forEach(c => c.classList.remove('selected-card'));
            card.classList.add('selected-card');
        });
    });

    // Hàm gọi API lấy danh sách voucher khi modal mở
    $('#addVoucherButton').on('show.bs.modal', function () {
        fetchVouchers();
    });

    async function fetchVouchers() {
        const idkh = GetByidKH();
        try {
            // Bước 1: Lấy idRank từ API khách hàng
            const responseRank = await fetch(`https://localhost:7196/api/khachhangs/${idkh}`);
            if (!responseRank.ok) {
                throw new Error(`Lỗi khi lấy idRank: ${responseRank.status}`);
            }
            const data = await responseRank.json();
            const idRank = data.idrank; // Giả định idRank nằm trong phản hồi

            // Bước 2: Lấy danh sách id giảm giá từ API giamgia_rank
            const responseDiscountIds = await fetch(`https://localhost:7196/api/giamgia_rank/rank/${idRank}`);
            if (!responseDiscountIds.ok) {
                document.getElementById('voucher-list').innerHTML = '<p>Rank chưa có voucher.</p>';
                return; // Thoát sớm nếu không có dữ liệu
            }
            const discountIds = await responseDiscountIds.json(); // Giả định trả về [1, 2, 3, ...]

            // Bước 3: Lấy danh sách các mã giảm giá mà khách hàng đã sử dụng (nếu có)
            const responseUsedVouchers = await fetch(`https://localhost:7196/api/Hoadons/voucher/${idkh}`);

            // Kiểm tra nếu phản hồi từ API không có dữ liệu (empty response or 204 No Content)
            if (responseUsedVouchers.status === 204) {
                console.log("Không có dữ liệu voucher từ hóa đơn.");
                usedVouchers = []; // Nếu không có dữ liệu, gán empty array
            } else if (!responseUsedVouchers.ok) {
                throw new Error(`Lỗi khi lấy dữ liệu từ API hóa đơn: ${responseUsedVouchers.status}`);
            } else {
                const usedVouchersText = await responseUsedVouchers.text(); // Đọc phản hồi dưới dạng text
                if (usedVouchersText) {
                    usedVouchers = JSON.parse(usedVouchersText); // Phân tích nếu có dữ liệu
                } else {
                    usedVouchers = []; // Nếu phản hồi trống, gán danh sách rỗng
                }
            }

            // Nếu dữ liệu từ hóa đơn là null, không cần lọc
            // Bỏ qua bước lọc nếu usedVouchers là rỗng
            const vouchers = [];
            for (const id of discountIds) {
                // Kiểm tra nếu mã giảm giá trong discountIds đã có trong usedVouchers (nếu có)
                const isUsed = usedVouchers.length > 0 && usedVouchers.some(voucher => voucher.idgg === id.iDgiamgia); // so sánh idgg và iDgiamgia

                if (isUsed) {
                    continue; // Nếu voucher đã được sử dụng thì bỏ qua
                }

                try {
                    const responseVoucher = await fetch(`https://localhost:7196/api/giamgia/${id.iDgiamgia}`);
                    const data = await responseVoucher.json();
                    const currentDate = new Date();
                    // Format currentDate để giữ đối tượng Date thay vì chuỗi
                    const formattedDate = new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        currentDate.getDate(),
                        currentDate.getHours(),
                        currentDate.getMinutes()
                    );

                    // Chuyển đổi updatengaybatdau và updatengayketthuc sang đối tượng Date
                    const updatengaybatdauDate = new Date(data.ngaybatdau);
                    const updatengayketthucDate = new Date(data.ngayketthuc);

                    if (data.trangthai !== "Đang phát hành") {
                        continue;
                    }
                    if (updatengaybatdauDate > formattedDate) {
                        continue;
                    }
                    if (formattedDate > updatengayketthucDate) {
                        continue;
                    }
                    if (data.soluong == 0) {
                        continue;
                    }
                    vouchers.push(data);
                } catch (error) {
                    console.warn(`Lỗi không xác định khi lấy voucher với id: ${id.iDgiamgia}`, error);
                }
            }

            // Sắp xếp danh sách voucher: Ưu tiên Donvi = 1 và sắp xếp giá trị (Giatri) tăng dần
            vouchers.sort((a, b) => {
                // Kiểm tra điều kiện Donvi = 1
                if (a.donvi === "%" && b.donvi === "VND") return -1;  // % lên trước VNĐ
                if (a.donvi === "VND" && b.donvi === "%") return 1;   // VNĐ xuống sau
               // Nếu cả hai đều có Donvi == 1 hoặc đều không, sắp xếp theo giá trị (Giatri) tăng dần
                return a.giatri - b.giatri;
            });

            // Hiển thị danh sách voucher
            const voucherListContainer = document.getElementById('voucher-list');
            voucherListContainer.innerHTML = ''; // Xóa nội dung cũ

            const voucherNotice = document.getElementById('voucher-notice');
            if (vouchers.length === 0) {
                voucherNotice.style.display = 'block'; // Hiển thị thông báo không có voucher
            } else {
                voucherNotice.style.display = 'none'; // Ẩn thông báo
                vouchers.forEach((voucher) => {
                    const voucherCard = document.createElement('div');
                    voucherCard.classList.add('form-check');

                    const voucherRadio = document.createElement('input');
                    voucherRadio.classList.add('form-check-input');
                    voucherRadio.type = 'radio';
                    voucherRadio.name = 'voucher';
                    voucherRadio.id = `voucher${voucher.id}`;
                    voucherRadio.dataset.value = voucher.id;

                    const voucherLabel = document.createElement('label');
                    voucherLabel.setAttribute('for', `voucher${voucher.id}`);

                    const card = document.createElement('div');
                    card.classList.add('card', 'voucher-card');
                    card.setAttribute('id', `card-voucher${voucher.id}`);

                    const cardBody = document.createElement('div');
                    cardBody.classList.add('card-body');

                    const cardTitle = document.createElement('h5');
                    cardTitle.classList.add('card-title');
                    cardTitle.textContent = voucher.mota;

                    const cardText1 = document.createElement('p');
                    cardText1.classList.add('card-text');
                    cardText1.textContent = `${formatDate(voucher.ngaybatdau)} - ${formatDate(voucher.ngayketthuc)}`;

                    const cardText2 = document.createElement('p');
                    cardText2.classList.add('card-text');
                    const donvi = voucher.donvi.replace("VND", "VNĐ"); // Chuẩn hóa đơn vị
                    if (donvi === '%' || donvi === 'VNĐ') {
                        const formattedValue = voucher.giatri >= 1000
                            ? voucher.giatri.toLocaleString('vi-VN')
                            : voucher.giatri;
                        cardText2.textContent = `Giá Trị: ${formattedValue} ${donvi}`;
                    }

                    cardBody.appendChild(cardTitle);
                    cardBody.appendChild(cardText1);
                    cardBody.appendChild(cardText2);
                    card.appendChild(cardBody);
                    voucherLabel.appendChild(card);
                    voucherCard.appendChild(voucherRadio);
                    voucherCard.appendChild(voucherLabel);

                    voucherListContainer.appendChild(voucherCard);
                });
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách voucher:', error);
            Swal.fire("Lỗi", "Đã xảy ra lỗi khi tải danh sách voucher.", "error");
        }
    }


    // Hàm định dạng ngày
    function formatDate(dateTimeString) {
        const date = new Date(dateTimeString);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return date.toLocaleDateString('vi-VN', options);
    }


    // Xử lý khi click vào thẻ card
    document.querySelectorAll('.voucher-card').forEach(card => {
        card.addEventListener('click', function () {
            // Lấy ra id của voucher được chọn từ thẻ card
            var radioButtonId = card.id.replace('card-voucher', '');

            // Đánh dấu radio button tương ứng với thẻ card được chọn
            var radioButton = document.getElementById(`voucher${radioButtonId}`);
            radioButton.checked = true;

            // Thêm lớp 'selected-card' vào thẻ card để làm nổi bật
            document.querySelectorAll('.voucher-card').forEach(c => c.classList.remove('selected-card'));
            card.classList.add('selected-card');
        });
    });

    const confirmButton = document.querySelector('#btnAddVoucher');
    confirmButton.addEventListener('click', function () {
        const selectedVoucher = document.querySelector('input[name="voucher"]:checked');

        if (!selectedVoucher) {
            Swal.fire('Thông báo', 'Vui lòng chọn một voucher.', 'warning');
            return;
        }

        const selectedVoucherId = selectedVoucher.dataset.value; // Lấy ID của voucher

        Swal.fire({
            title: 'Xác Nhận Voucher',
            text: `Bạn có chắc chắn muốn áp dụng voucher này?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Đồng Ý',
            cancelButtonText: 'Hủy Bỏ'
        }).then((result) => {
            if (result.isConfirmed) {
                // Gọi API để lấy thông tin voucher dựa trên ID
                fetch(`${discountApiUrl}/${selectedVoucherId}`)
                    .then(response => response.json())
                    .then(voucher => {
                        if (voucher && voucher.giatri) {
                            const voucherCodeInput = document.getElementById('voucherCodeDisplay');

                            // Gán ID làm giá trị (value) của input
                            voucherCodeInput.setAttribute('data-value', selectedVoucherId);

                            // Hiển thị mô tả voucher bên trong input bằng cách thay đổi placeholder
                            voucherCodeInput.setAttribute('placeholder', voucher.mota);
                            voucherCodeInput.textContent = `${voucher.mota}`;
                            voucherCodeInput.classList.add('active'); // Nếu cần style input sau khi chọn

                            const soTienGiamGia = document.getElementById('soTienGiamGia');
                            const tongHoaDonElement = document.getElementById('tongHoaDon');
                            const tongSanPhamElement = document.getElementById('tongSanPham');

                            const tongSanPhamValue = parseInt(tongSanPhamElement.textContent.replace(/[VNĐ.]/g, ''));
                            let soTienGiam = 0;

                            // Tính toán số tiền giảm tùy thuộc vào đơn vị của voucher
                            if (voucher.donvi === 'VND') {
                                soTienGiam = voucher.giatri;
                            } else if (voucher.donvi === '%') {
                                soTienGiam = tongSanPhamValue * (voucher.giatri / 100);
                            }

                            // Hiển thị số tiền giảm
                            soTienGiamGia.textContent = `-${soTienGiam.toLocaleString()} VNĐ`;
                            soTienGiamGia.style.color = 'red';

                            if (soTienGiamGia < 0) {
                                soTienGiamGia = Math.abs(soTienGiamGia); // Chuyển thành giá trị dương
                            }

                            // Cập nhật tổng hóa đơn
                            const tongHoaDonValue = Math.max(0, tongSanPhamValue - soTienGiam);
                            tongHoaDonElement.textContent = `${tongHoaDonValue.toLocaleString()} VNĐ`;

                            // Gọi hàm updateTotals để tính lại tổng sản phẩm và hóa đơn
                            updateTotals();

                            const tongHoaDonValuecheck = parseInt(tongHoaDonEl.textContent.replace(/[VNĐ.]/g, ''));
                            const cashOnDeliveryLabel = getLabelByText("Thanh toán khi nhận hàng"); // Tìm nhãn "Thanh toán khi nhận hàng"
                            const bankTransferLabel = getLabelByText("Chuyển khoản ngân hàng"); // Tìm nhãn "Chuyển khoản ngân hàng"

                            // Lấy id của các radio button thông qua thuộc tính 'for' của label
                            const cashOnDeliveryRadioId = cashOnDeliveryLabel ? cashOnDeliveryLabel.getAttribute('for') : null;
                            const bankTransferRadioId = bankTransferLabel ? bankTransferLabel.getAttribute('for') : null;

                            // Tìm radio buttons theo id
                            const cashOnDeliveryRadio = cashOnDeliveryRadioId ? document.getElementById(cashOnDeliveryRadioId) : null;
                            const bankTransferRadio = bankTransferRadioId ? document.getElementById(bankTransferRadioId) : null;

                            if (tongHoaDonValuecheck === 0) {
                                if (cashOnDeliveryRadio) {
                                    cashOnDeliveryRadio.checked = true; // Chọn "Thanh toán khi nhận hàng"
                                }
                                if (bankTransferRadio) {
                                    bankTransferRadio.disabled = true; // Vô hiệu hóa "Chuyển khoản ngân hàng"
                                }
                                if (bankTransferLabel) {
                                    bankTransferLabel.style.display = "none"; // Ẩn nhãn
                                }
                            } else {
                                if (bankTransferRadio) {
                                    bankTransferRadio.disabled = false; // Bật lại "Chuyển khoản ngân hàng"
                                }
                                if (bankTransferLabel) {
                                    bankTransferLabel.style.display = "inline-block"; // Hiện lại nhãn
                                }
                            }

                            document.getElementById("btnRestoreVoucher").style.display = 'inline-block';
                            Swal.fire(
                                'Xác Nhận Thành Công',
                                `Voucher "${voucher.mota}" đã được áp dụng.`,
                                'success'
                            );
                        } else {
                            Swal.fire('Thông báo', 'Voucher không hợp lệ hoặc đã hết hạn.', 'error');
                        }
                    })
                    .catch(error => {
                        Swal.fire('Lỗi', 'Có lỗi xảy ra khi tải dữ liệu voucher. Vui lòng thử lại.', 'error');
                        console.error(error);
                    });
            } else {
                Swal.close();
            }
        });
    });

    document.getElementById("btnRestoreVoucher").addEventListener("click", function () {
        // Hiển thị hộp thoại xác nhận huỷ voucher
        Swal.fire({
            title: 'Xác nhận huỷ voucher?',
            text: "Bạn có chắc chắn muốn huỷ voucher đã chọn?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Huỷ Voucher',
            cancelButtonText: 'Hủy bỏ',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                // Xử lý khi nhấn "Huỷ"
                const voucherCodeDisplay = document.getElementById('voucherCodeDisplay');
                const soTienGiamGia = document.getElementById('soTienGiamGia');
                const tongHoaDonElement = document.getElementById('tongHoaDon');
                const tongSanPhamElement = document.getElementById('tongSanPham');

                // Khôi phục trạng thái ban đầu
                voucherCodeDisplay.textContent = 'Chưa chọn voucher';
                voucherCodeDisplay.setAttribute('data-voucher-code', ''); // Reset voucher code
                voucherCodeDisplay.classList.remove('active'); // Remove active class
                voucherCodeDisplay.removeAttribute('data-value'); // Xóa thuộc tính dữ liệu không cần thiết
                voucherCodeDisplay.setAttribute('placeholder', 'Nhập mã giảm giá'); // Thiết lập lại placeholder

                // Reset số tiền giảm và tổng hóa đơn
                soTienGiamGia.textContent = '0 VNĐ';

                // Lấy giá trị tổng số sản phẩm (loại bỏ ký tự không phải số)
                const tongSanPhamValue = parseInt(tongSanPhamElement.textContent.replace(/[VNĐ.]/g, ''));

                // Cập nhật tổng hóa đơn sau khi xóa voucher
                tongHoaDonElement.textContent = `${tongSanPhamValue.toLocaleString()} VNĐ`;

                // Ẩn nút "Khôi phục voucher"
                document.getElementById("btnRestoreVoucher").style.display = 'none';

                updateTotals();

                // Đóng modal
                var modal = bootstrap.Modal.getInstance(document.getElementById("addVoucherButton"));
                modal.hide();

                // Hiển thị thông báo thành công
                Swal.fire("Thành Công", "Huỷ áp dụng voucher thành công.", "success");
            } else {
                // Nếu người dùng chọn "Hủy bỏ", chỉ đóng thông báo mà không làm gì thêm
                Swal.close();
            }
        });
    });

    // API endpoint
    const apiUrl = "https://localhost:7196/api/Phuongthucthanhtoans";

    // Fetch payment methods từ API
    async function fetchPaymentMethods() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error("Không thể lấy phương thức thanh toán.");
            }
            const paymentMethods = await response.json();

            // Xử lý hiển thị phương thức thanh toán
            renderPaymentMethods(paymentMethods);
        } catch (error) {
            console.error(error);
            renderNoPaymentMethods();
        }
    }

    // Hiển thị danh sách phương thức thanh toán
    function renderPaymentMethods(paymentMethods) {
        const container = document.getElementById("payment-methods-container");
        container.innerHTML = ""; // Xóa nội dung cũ

        if (paymentMethods.length === 0) {
            renderNoPaymentMethods();
            return;
        }

        paymentMethods.forEach((method, index) => {
            const isChecked = index === 0 ? "checked" : ""; // Chọn mặc định phương thức đầu tiên

            // Tạo input và label cho từng phương thức thanh toán
            const input = document.createElement("input");
            input.type = "radio";
            input.className = "btn-check";
            input.name = "paymentMethod";
            input.id = `paymentMethod-${method.id}`;
            input.value = method.id;
            input.autocomplete = "off";
            input.checked = isChecked;

            const label = document.createElement("label");
            label.className = "btn btn-outline-primary";
            label.htmlFor = `paymentMethod-${method.id}`;
            label.innerText = method.tenpttt;

            // Thêm input và label vào container
            container.appendChild(input);
            container.appendChild(label);
        });
    }

    // Hiển thị thông báo khi không có phương thức thanh toán
    function renderNoPaymentMethods() {
        const container = document.getElementById("payment-methods-container");
        container.innerHTML = `<p class="text-danger">Chưa có phương thức thanh toán</p>`;
    }

    const tongHoaDonEl = document.getElementById("tongHoaDon");

    // Hàm cập nhật trạng thái phương thức thanh toán
    function updatePaymentMethod() {
        const tongHoaDonValue = parseInt(tongHoaDonEl.textContent.replace(/[VNĐ.]/g, ''));

        const cashOnDeliveryLabel = getLabelByText("Thanh toán khi nhận hàng"); // Tìm nhãn "Thanh toán khi nhận hàng"
        const bankTransferLabel = getLabelByText("Chuyển khoản ngân hàng"); // Tìm nhãn "Chuyển khoản ngân hàng"

        // Lấy id của các radio button thông qua thuộc tính 'for' của label
        const cashOnDeliveryRadioId = cashOnDeliveryLabel ? cashOnDeliveryLabel.getAttribute('for') : null;
        const bankTransferRadioId = bankTransferLabel ? bankTransferLabel.getAttribute('for') : null;

        // Tìm radio buttons theo id
        const cashOnDeliveryRadio = cashOnDeliveryRadioId ? document.getElementById(cashOnDeliveryRadioId) : null;
        const bankTransferRadio = bankTransferRadioId ? document.getElementById(bankTransferRadioId) : null;

        if (tongHoaDonValue === 0) {
            if (cashOnDeliveryRadio) {
                cashOnDeliveryRadio.checked = true; // Chọn "Thanh toán khi nhận hàng"
            }
            if (bankTransferRadio) {
                bankTransferRadio.disabled = true; // Vô hiệu hóa "Chuyển khoản ngân hàng"
            }
            if (bankTransferLabel) {
                bankTransferLabel.style.display = "none"; // Ẩn nhãn
            }
        } else {
            if (bankTransferRadio) {
                bankTransferRadio.disabled = false; // Bật lại "Chuyển khoản ngân hàng"
            }
            if (bankTransferLabel) {
                bankTransferLabel.style.display = "inline-block"; // Hiện lại nhãn
            }
        }
    }

    function getLabelByText(text) {
        const labels = document.querySelectorAll('label');
        for (let label of labels) {
            if (label.innerText.trim() === text) {
                return label;
            }
        }
        return null; // If no label is found with the matching text
    }

    // Theo dõi thay đổi nội dung của tổng hóa đơn
    const observer = new MutationObserver(updatePaymentMethod);
    observer.observe(tongHoaDonEl, { childList: true, subtree: true });

    $('#muaHangBtn').on('click', async function () {
        const voucherCodeInputdata = document.getElementById('voucherCodeDisplay');
        const tongHoaDon = parseInt(document.getElementById("tongHoaDon")?.innerText.replace(/[VNĐ.]/g, "") || 0) || 0;
        const tongSanPham = parseInt(document.getElementById("tongSanPham")?.innerText.replace(/[VNĐ.]/g, "") || 0) || 0;
        const tienvanchuyen = parseInt(document.getElementById("phiVanCHuyen")?.innerText.replace(/[VNĐ.]/g, "") || 0) || 0;

        const soTienGiamGia = parseInt(document.getElementById("soTienGiamGia")?.innerText.replace(/[VNĐ.\-]/g, "") || 0) || 0;
        const diachi = document.getElementById("diachi")?.innerText.trim() || "";
        const sdt = document.getElementById("sdt")?.innerText.trim() || "";
        const voucherCodeInput = voucherCodeInputdata.getAttribute('data-value') || 0;
        const voucherCodeInputINT = parseInt(voucherCodeInput) || 0;
        const userId = GetByidKH();
        
        const currentDate = new Date();
        const vietnamTimezoneOffset =  0; // Múi giờ Việt Nam là UTC+7

        // Điều chỉnh thời gian theo múi giờ Việt Nam
        currentDate.setMinutes(currentDate.getMinutes() + vietnamTimezoneOffset - currentDate.getTimezoneOffset());

        const vietnamDate = currentDate.toISOString();

        console.log(vietnamDate); // Ngày giờ theo chuẩn ISO, tương ứng với múi giờ Việt Nam
        
        const bankTransferLabel = getLabelByText("Chuyển khoản ngân hàng");

        const bankTransferRadioId = bankTransferLabel ? bankTransferLabel.getAttribute('for') : null;
        
        const bankTransferRadio = bankTransferRadioId ? document.getElementById(bankTransferRadioId) : null;

        const paymentMethodElement = document.querySelector('input[name="paymentMethod"]:checked');

        if (!paymentMethodElement) {
            Swal.fire("Cảnh báo", "Vui lòng chọn phương thức thanh toán.", "warning");
            return;
        }

        const paymentMethodId = parseInt(paymentMethodElement.value);
    
        const hoadonData = {
            id: 0,
            idnv: 0,
            idkh: userId,
            trangthaithanhtoan: 0,
            trangthaidonhang: 0,
            donvitrangthai: 0,
            thoigiandathang: currentDate,
            diachiship: diachi,
            ngaygiaothucte: currentDate,
            tongtiencantra: tongHoaDon,
            tongtiensanpham: tongSanPham, 
            sdt: sdt,
            tonggiamgia: soTienGiamGia,
            idgg: voucherCodeInputINT,
            trangthai: 0,
            phivanchuyen: tienvanchuyen,
            idpttt: paymentMethodId,
            ghichu: "",
        };
    
        try {
            if (tongHoaDon == 0 && bankTransferRadio.checked) {
                Swal.fire("Lỗi", "Tổng sản phẩm = 0, không thể chuyển khoản", "error");
                return
            }
            // Kiểm tra xem checkbox điểm có được chọn hay không
            const diemsudungcheckbox = document.getElementById('diemsudungcheckbox');
            if (diemsudungcheckbox.checked) {
                const diemsudung = diemTru;
                
                // Nếu có sử dụng điểm, gọi hàm cập nhật điểm khách hàng
                await UpdateDiem(diemsudung);
            }

            const idhd = await taoHoaDon(hoadonData);
                if (!idhd) return; // Dừng nếu tạo hóa đơn thất bại
    
                const hoaDonChiTietResult = await themHoaDonChiTiet(idhd);
                if (!hoaDonChiTietResult) return; // Dừng nếu thêm chi tiết hóa đơn thất bại
    
                sessionStorage.clear();
                
                if (bankTransferRadio.checked) {
                    const taoLinkThanhToanResult = await taoLinkThanhToan(idhd);
                    if (!taoLinkThanhToanResult) return; // Dừng nếu tạo link thanh toán thất bại
                }
                Swal.fire("Thành Công", "Đặt Hàng Thành Công.", "success");
                $scope.$apply(() => {
                    $location.path(`/donhangcuaban`);
                });  

        } catch (error) {
            console.error("Lỗi trong quá trình xử lý:", error);
            // Không cần thông báo lỗi, chỉ dừng ở đây
        }
    });

    async function UpdateDiem(diemtru) {
        try {
            const userId = GetByidKH();
            // Lấy thông tin khách hàng từ API
            const datakhachang = await fetchkhachangById(); // Giả sử đây là async function
            const capnhatdiem = datakhachang.diemsudung - diemtru
    
            // Gửi PUT request để cập nhật điểm cho khách hàng
            const response = await fetch(`${apiKHUrl}/diem/${userId}?diemsudung=${capnhatdiem}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" }
            });
    
            // Xử lý phản hồi từ API
            if (!response.ok) {
                const errorResult = await response.json();
                Swal.fire("Lỗi", errorResult.message || "Cập nhật không thành công", "error");
                return null;  // Dừng nếu có lỗi từ BE
            }
    
            const result = await response.json();
    
            // Hiển thị thông báo thành công
            Swal.fire("Thành công", result.message || "Cập nhật thành công", "success");
            return result;
    
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            Swal.fire("Lỗi", "Kết nối cập nhật điểm khách hàng thất bại.", "error");
        }
    } 

    // Hàm tạo hóa đơn
    async function taoHoaDon(hoadonData) {
        try {
            const response = await fetch('https://localhost:7196/api/Hoadons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(hoadonData)
            });
            if (response.ok) {
                const result = await response.json();
                return result.id; // Trả về ID hóa đơn
            } else {
                const result = await response.json();
                if (result.error) {
                    Swal.fire("Lỗi", result.error, "error");
                }
            }
        } catch (error) {
            console.error("Lỗi khi tạo hóa đơn:", error);
            Swal.fire("Lỗi", "Kết nối tạo hóa đơn thất bại.", "error");
        }
        return null;
    }
    
    // Hàm thêm chi tiết hóa đơn
    async function themHoaDonChiTiet(idhd) {
        const ListdanhSachSanPham = danhSachSanPham; // Danh sách sản phẩm từ giỏ hàng
        for (const sanPham of ListdanhSachSanPham) {
            const data = {
                idhd: idhd,
                idspct: sanPham.id,
                soluong: sanPham.soluong,
                giasp: sanPham.giathoidiemhientai,
                giamgia: sanPham.giamgia || 0
            };
    
            try {
                const response = await fetch('https://localhost:7196/api/HoaDonChiTiets', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
    
                // Kiểm tra nếu BE trả thông báo lỗi
                if (response.ok && result.error) {
                    Swal.fire("Lỗi", result.error, "error");
                    return null;  // Dừng nếu có lỗi từ BE
                }
                return result;
            } catch (error) {
                console.error("Lỗi kết nối API khi thêm chi tiết hóa đơn:", error);
                Swal.fire("Lỗi", "Kết nối thêm chi tiết hóa đơn thất bại.", "error");
            }
        }
    }
    
    // Hàm tạo link thanh toán (không có cọc)
    async function taoLinkThanhToan(idhd) {
        const ListdanhSachSanPham = danhSachSanPham.map(sanPham => {
            const giaUuTien = sanPham.giamgia > 0 ? sanPham.giamgia : sanPham.giathoidiemhientai;
            return {
                name: sanPham.tensp,
                quantity: sanPham.soluong,
                price: giaUuTien
            };
        });
    
        const tongHoaDon = parseInt(document.getElementById("tongHoaDon") ? document.getElementById("tongHoaDon").innerText.replace(/[VNĐ.]/g, "") : 0) || 0;
    
        const payload = {
            orderCode: idhd,
            items: ListdanhSachSanPham,
            totalAmount: tongHoaDon,
            description: ""
        };
    
        try {
            const response = await fetch('https://localhost:7196/api/checkout/create-payment-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.error) {
                throw new Error(result.error || 'Có lỗi xảy ra trong quá trình xử lý.');
            }
    
            if (result.checkoutUrl) {
                sessionStorage.clear();
                window.location.href = result.checkoutUrl;
            } else {
                Swal.fire('Lỗi', 'Không nhận được đường dẫn thanh toán.', 'error');
            }
        } catch (error) {
            console.error("Lỗi khi tạo link thanh toán:", error);
            Swal.fire("Lỗi", "Không thể tạo link thanh toán.", "error");
        }
        return null;
    }

    updatePaymentMethod();
    fetchPaymentMethods();
    loadAddressesByIdKH();
    fetchkhachangById();
    renderSanPham();
})