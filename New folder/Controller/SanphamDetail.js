
app.controller('SanphamDetail', function ($scope, $http) {
    const apiSPCTUrl = "https://localhost:7196/api/Sanphamchitiets";
    const apiSPUrl = "https://localhost:7196/api/Sanphams";
    const apiSize = "https://localhost:7196/api/size";
    const apiChatlieu = "https://localhost:7196/api/ChatLieu";
    const apiMau = "https://localhost:7196/api/color";
    const apiThuonghieu = "https://localhost:7196/api/thuonghieu";
    const apiDanhGia = "https://localhost:7196/byIDhdct/";
    const apiHinhAnh = "https://localhost:7196/api/Hinhanh/DanhGia/";
    const sanPhamId = 2;
    let dataspct = []; // Sửa Set thành mảng

    async function fetchSanPhamChiTiet() {
        try {
            if (!sanPhamId) {
                console.error("id sản phẩm không hợp lệ");
                return [];
            }

            const response = await fetch(`${apiSPUrl}/GetALLSanPham/${sanPhamId}`);
            if (!response.ok) {
                throw new Error(`Lỗi API sản phẩm chi tiết: ${response.status}`);
            }

            const data = await response.json();

            console.log(data);
            return Array.isArray(data) ? data : [data];


        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm chi tiết:", error);
            return [];
        }
    }

    async function fetchDataSanPhamChiTiet() {
        try {
            const danhSachSPCT = await fetchSanPhamChiTiet();
            if (!danhSachSPCT.length) return;

            const container = document.querySelector("#anhsanpham .thumbnail-container");
            const mainImage = document.querySelector("#main-product-image");

            let allImages = [];
            let colorIds = new Set();
            let chatlieuIds = new Set();
            let sizeIds = new Set();

            // Lặp qua tất cả sản phẩm chi tiết để lấy ảnh
            for (const spct of danhSachSPCT) {
                var thuonghieu = await fetchThuonghieu(spct.idThuongHieu);
                document.querySelector(".product-title").textContent = spct.tensp;
                document.querySelector("#product-detail").textContent = spct.mota;
                document.querySelector("#product-status").textContent = convertStatus(spct.trangThai);

                if (spct.giasale != null) {
                    document.querySelector("#price-current").textContent = spct.giasale;
                    document.querySelector("#price-original").textContent = spct.giaban;
                } else {
                    document.querySelector("#price-current").textContent = spct.giaban;
                    document.querySelector("#price-original").style.display = "none";
                }

                document.querySelector("#product-category").textContent = thuonghieu.tenthuonghieu;

                for (const anhspct of spct.sanphamchitiets) {
                    // Xử lý hình ảnh
                    const response = await fetch(`${apiSPCTUrl}/GetImageById/${anhspct.id}`);
                    if (!response.ok) continue;

                    const blob = await response.blob();
                    const imageUrl = URL.createObjectURL(blob);

                    allImages.push({
                        url: imageUrl,
                        id: anhspct.id
                    });

                    // Lấy tất cả color, chất liệu, size
                    colorIds.add(anhspct.idMau);
                    chatlieuIds.add(anhspct.idChatLieu);
                    sizeIds.add(anhspct.idSize);
                }

                // Thêm tất cả sản phẩm chi tiết vào danh sách chung
                dataspct.push(...spct.sanphamchitiets);
            }

            if (!allImages.length) return;

            // Hiển thị ảnh vào thumbnail-container
            container.innerHTML = allImages.map((img, index) =>
                `<img src="${img.url}" class="thumbnail-img ${index === 0 ? 'active' : ''}" 
                data-img-url="${img.url}" data-id-spct="${img.id}" 
                alt="Thumbnail ${index + 1}">`
            ).join('');

            // Hiển thị ảnh đầu tiên vào position-relative
            mainImage.src = allImages[0].url;

            // Thêm sự kiện click vào từng thumbnail
            document.querySelectorAll(".thumbnail-img").forEach(thumbnail => {
                thumbnail.addEventListener("click", function () {
                    changeMainImage(this.dataset.imgUrl, this);
                });
            });

            await fetchAndDisplayColors([...colorIds]);
            await fetchAndDisplayChatlieus([...chatlieuIds]);
            await fetchAndDisplaySize([...sizeIds]);

            console.log("Dữ liệu sản phẩm chi tiết:", dataspct); // Debug kiểm tra dữ liệu lấy ra
            await hienThiDanhGia();

        } catch (error) {
            console.error("Lỗi khi lấy ảnh sản phẩm chi tiết:", error);
        }
    }

    // Hàm hiển thị đánh giá
    async function hienThiDanhGia() {
        const reviewsContainer = document.getElementById("reviews");
        const filterContainer = document.getElementById("filterContainer");
        const avgRatingElement = document.getElementById("avgRating");
        const starDisplayElement = document.getElementById("starDisplay");

        reviewsContainer.innerHTML = ""; // Xóa đánh giá cũ
        filterContainer.innerHTML = ""; // Xóa bộ lọc cũ

        let danhGiaCounts = {}; // Lưu số lượng đánh giá theo sao
        let tongSao = 0;
        let tongDanhGia = 0;

        for (const spct of dataspct) {
            try {
                let danhGiaList = await fetchDanhGia(spct.id);
                if (danhGiaList === null) continue; // Nếu gặp lỗi 404, bỏ qua sản phẩm này

                if (!Array.isArray(danhGiaList)) {
                    danhGiaList = danhGiaList ? [danhGiaList] : [];
                }

                if (danhGiaList.length === 0) continue;

                for (const danhGia of danhGiaList) {
                    danhGiaCounts[danhGia.sosao] = (danhGiaCounts[danhGia.sosao] || 0) + 1;
                    tongSao += danhGia.sosao;
                    tongDanhGia++;

                    const hinhAnhList = await fetchHinhAnhDanhGia(danhGia.id);

                    const reviewDiv = document.createElement("div");
                    reviewDiv.classList.add("review");
                    reviewDiv.dataset.rating = danhGia.sosao;
                    reviewDiv.innerHTML = `
                    <div class="review-header">
                        <span class="review-user"><strong>${danhGia.idkh}</strong></span>
                        <span class="review-rating">${"★".repeat(danhGia.sosao)} (${danhGia.sosao}/5)</span>
                    </div>
                    <p class="review-content">${danhGia.noidungdanhgia}</p>
                    <div class="review-images">
                        ${Array.isArray(hinhAnhList) ?
                            hinhAnhList.map((url) => `<img src="${url}" class="review-img img-thumbnail" alt="Ảnh đánh giá" data-url="${url}" data-bs-toggle="modal" data-bs-target="#imageModal">`).join("")
                            : ""
                        }
                    </div>
                `;

                    // Sự kiện click vào ảnh để mở modal
                    reviewDiv.querySelectorAll(".review-img").forEach(img => {
                        img.addEventListener("click", function () {
                            document.getElementById("modalImg").src = this.dataset.url;
                        });
                    });

                    reviewsContainer.appendChild(reviewDiv);
                }
            } catch (error) {
                console.error(`Lỗi khi lấy đánh giá cho sản phẩm ID ${spct.id}:`, error);
            }
        }

        // Tính sao trung bình
        let avgRating = tongDanhGia > 0 ? (tongSao / tongDanhGia).toFixed(1) : 0;
        avgRatingElement.textContent = `${avgRating}`;
        starDisplayElement.innerHTML = "★".repeat(Math.round(avgRating)).padEnd(5, "☆");

        // Hiển thị bộ lọc chỉ với các sao có đánh giá
        if (Object.keys(danhGiaCounts).length > 0) {
            let filterHTML = `<button class="active" data-filter="all">Tất Cả (${tongDanhGia})</button>`;
            Object.keys(danhGiaCounts)
                .sort((a, b) => b - a) // Sắp xếp giảm dần (5 -> 1 sao)
                .forEach(sao => {
                    filterHTML += `<button data-filter="${sao}">${sao} Sao (${danhGiaCounts[sao]})</button>`;
                });

            filterContainer.innerHTML = filterHTML;

            // Thêm sự kiện lọc đánh giá
            document.querySelectorAll(".filter-buttons button").forEach(button => {
                button.addEventListener("click", function () {
                    const filterValue = this.dataset.filter;
                    document.querySelectorAll(".review").forEach(review => {
                        const rating = review.dataset.rating;
                        review.style.display = (filterValue === "all" || rating === filterValue) ? "block" : "none";
                    });

                    // Cập nhật trạng thái nút filter
                    document.querySelectorAll(".filter-buttons button").forEach(btn => btn.classList.remove("active"));
                    this.classList.add("active");
                });
            });
        }
    }

    // Hàm thay đổi ảnh chính khi click vào thumbnail
    function changeMainImage(imageUrl, clickedThumbnail) {
        const mainImage = document.querySelector("#main-product-image");
        if (mainImage) {
            mainImage.src = imageUrl;
        }

        // Loại bỏ class "active" khỏi tất cả ảnh thumbnail
        document.querySelectorAll(".thumbnail-img").forEach(img => img.classList.remove("active"));

        // Thêm class "active" cho ảnh đang chọn
        clickedThumbnail.classList.add("active");
    }

    // Đảm bảo khai báo các biến trước khi sử dụng
    let selectedColorId = null;
    let selectedSizeId = null;
    let selectedChatlieuId = null;

    function updateSizeOptions(validSizeIds) {
        document.querySelectorAll(".size-option").forEach(button => {
            const sizeId = parseInt(button.getAttribute("data-size"), 10);

            if (validSizeIds.includes(sizeId)) {
                button.disabled = false;
                button.style.opacity = "1";
                button.style.pointerEvents = "auto";
            } else {
                button.disabled = true;
                button.style.opacity = "0.5";
                button.style.pointerEvents = "none";
                button.classList.remove("active");
            }
        });

        if (selectedSizeId && !validSizeIds.includes(parseInt(selectedSizeId, 10))) {
            selectedSizeId = null;
        }
    }


    function updateChatlieuOptions(validChatlieuIds) {
        document.querySelectorAll(".chatlieu-option").forEach(button => {
            const chatlieuId = parseInt(button.getAttribute("data-chatlieu"), 10);

            if (validChatlieuIds.includes(chatlieuId)) {
                button.disabled = false;
                button.style.opacity = "1";
                button.style.pointerEvents = "auto";
            } else {
                button.disabled = true;
                button.style.opacity = "0.5";
                button.style.pointerEvents = "none";
                button.classList.remove("active");
            }
        });

        if (selectedChatlieuId && !validChatlieuIds.includes(parseInt(selectedChatlieuId, 10))) {
            selectedChatlieuId = null;
        }
    }

    function filterSanPhamChiTiet() {
        let filteredSPCTs = dataspct;

        // Chỉ lọc nếu giá trị được chọn không phải null hoặc rỗng
        if (selectedColorId !== null && selectedColorId !== "") {
            filteredSPCTs = filteredSPCTs.filter(sp => sp.idMau == selectedColorId);
        }
        if (selectedSizeId !== null && selectedSizeId !== "") {
            filteredSPCTs = filteredSPCTs.filter(sp => sp.idSize == selectedSizeId);
        }
        if (selectedChatlieuId !== null && selectedChatlieuId !== "") {
            filteredSPCTs = filteredSPCTs.filter(sp => sp.idChatLieu == selectedChatlieuId);
        }

        // Kiểm tra nếu tất cả đều không chọn thì hiển thị toàn bộ sản phẩm
        if (!selectedColorId && !selectedSizeId && !selectedChatlieuId) {
            filteredSPCTs = dataspct;
        }

        // Lấy danh sách thuộc tính hợp lệ từ kết quả lọc
        const validSizeIds = new Set(filteredSPCTs.map(sp => sp.idSize));
        const validChatlieuIds = new Set(filteredSPCTs.map(sp => sp.idChatLieu));
        const validColorIds = new Set(filteredSPCTs.map(sp => sp.idMau));

        // Cập nhật giao diện với các tùy chọn hợp lệ
        updateSizeOptions([...validSizeIds]);
        updateChatlieuOptions([...validChatlieuIds]);
        updateColorOptions([...validColorIds]);

        // Chỉ cập nhật hình ảnh khi chọn đủ 3 thuộc tính
        if (selectedColorId && selectedSizeId && selectedChatlieuId) {
            checkAndDisplayMainImage(filteredSPCTs);
            updateQuantity();
        }
    }


    function updateColorOptions(validColorIds) {
        document.querySelectorAll(".color-option").forEach(button => {
            const colorId = parseInt(button.getAttribute("data-color"), 10);

            if (validColorIds.includes(colorId)) {
                button.disabled = false;
                button.style.opacity = "1";
                button.style.pointerEvents = "auto";
            } else {
                button.disabled = true;
                button.style.opacity = "0.5";
                button.style.pointerEvents = "none";
                button.classList.remove("active");
            }
        });

        if (selectedColorId && !validColorIds.includes(parseInt(selectedColorId, 10))) {
            selectedColorId = null;
        }
    }

    // 🟢 Xử lý chọn màu, chỉ được chọn một màu duy nhất
    function selectColor(selectedButton) {
        document.querySelectorAll(".color-option").forEach(button => {
            button.classList.remove("active");
        });

        selectedButton.classList.add("active");

        selectedColorId = selectedButton.getAttribute("data-color");

        // Gọi hàm lọc sản phẩm chi tiết
        filterSanPhamChiTiet();
    }

    function selectChatlieu(selectedButton) {
        document.querySelectorAll(".chatlieu-option").forEach(button => {
            button.classList.remove("active");
        });

        selectedButton.classList.add("active");
        selectedChatlieuId = selectedButton.getAttribute("data-chatlieu");

        filterSanPhamChiTiet();
    }

    // 🟢 Hàm hiển thị màu sắc từ API lên giao diện
    async function fetchAndDisplayColors(colorIds) {
        try {
            const colorContainer = document.querySelector(".color-options");
            colorContainer.innerHTML = ""; // Xóa màu cũ

            for (const idMau of colorIds) {
                const response = await fetch(`${apiMau}/${idMau}`);
                if (!response.ok) continue;

                const colorData = await response.json();
                const colorCode = colorData.mamau;

                // Tạo nút màu với dấu tích ✔
                const colorButton = document.createElement("button");
                colorButton.classList.add("btn", "btn-outline-secondary", "me-2", "color-option");
                colorButton.style.backgroundColor = colorCode;
                colorButton.style.color = "#fff";
                colorButton.style.padding = "18px";
                colorButton.setAttribute("data-color", idMau);

                // Gán sự kiện click
                colorButton.addEventListener("click", function () {
                    selectColor(this);
                });

                // Thêm vào giao diện
                colorContainer.appendChild(colorButton);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách màu:", error);
        }
    }
    // Lấy danh sách đánh giá từ API
    async function fetchDanhGia(idspct) {
        try {
            const response = await fetch(`${apiDanhGia}${idspct}`);
            if (!response.ok) {
                if (response.status === 404) {
                    return null; // Trả về null nếu gặp lỗi 404
                }
                throw new Error(`Lỗi API đánh giá: ${response.status}`);
            }

            const danhGiaData = await response.json();
            return danhGiaData || []; // Đảm bảo trả về mảng rỗng nếu không có dữ liệu
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu đánh giá:", error);
            return []; // Trả về mảng rỗng thay vì `null` hoặc `undefined`
        }
    }

    // Lấy hình ảnh đánh giá từ API
    async function fetchHinhAnhDanhGia(danhGiaId) {
        try {
            const response = await fetch(`${apiHinhAnh}${danhGiaId}`);
            if (!response.ok) return [];

            const hinhAnhData = await response.json();
            return hinhAnhData.map(img => img.url); // Trả về danh sách URL ảnh
        } catch (error) {
            console.error("Lỗi khi lấy hình ảnh đánh giá:", error);
            return [];
        }
    }

    async function fetchAndDisplayChatlieus(chatlieuIds) {
        try {
            const chatlieuContainer = document.querySelector(".chatlieu-options");
            chatlieuContainer.innerHTML = ""; // Xóa nội dung cũ

            let chatlieuButtons = [];

            for (const idchatlieu of chatlieuIds) {
                const response = await fetch(`${apiChatlieu}/${idchatlieu}`);
                if (!response.ok) continue;

                const chatlieuData = await response.json();
                const chatlieuName = chatlieuData.tenchatlieu;

                chatlieuButtons.push(`
                    <div class="chatlieu-option" data-chatlieu="${idchatlieu}" style:width: 45px; height: 40px; display: inline-flex; align-items: center; justify-content: center;margin-right: 10px; cursor: pointer;  border: 1px solid #dee2e6; background-color: #fff; transition: all 0.3s ease; >
                        ${chatlieuName}
                    </div>
                `);
            }

            chatlieuContainer.innerHTML = chatlieuButtons.join('');

            // Gán sự kiện click vào từng nút chất liệu sau khi thêm vào DOM
            document.querySelectorAll(".chatlieu-option").forEach(button => {
                button.addEventListener("click", function () {
                    selectChatlieu(this); // Gọi hàm đúng cách
                });
            });

        } catch (error) {
            console.error("Lỗi khi lấy danh sách chất liệu:", error);
        }
    }

    function checkAndDisplayMainImage(filteredSPCTs) {
        if (!filteredSPCTs.length) return;

        const firstImageId = filteredSPCTs[0].id;
        const selectedImage = document.querySelector(`.thumbnail-img[data-id-spct="${firstImageId}"]`);

        if (selectedImage) {
            changeMainImage(selectedImage.dataset.imgUrl, selectedImage);
        }
    }


    function selectSize(selectedButton) {
        document.querySelectorAll(".size-option").forEach(button => {
            button.classList.remove("active");
        });

        selectedButton.classList.add("active");
        selectedSizeId = selectedButton.getAttribute("data-size");

        filterSanPhamChiTiet();
    }

    function selectChatlieu(selectedButton) {
        document.querySelectorAll(".chatlieu-option").forEach(button => {
            button.classList.remove("active");
        });

        selectedButton.classList.add("active");
        selectedChatlieuId = selectedButton.getAttribute("data-chatlieu");

        filterSanPhamChiTiet();
    }


    async function fetchAndDisplaySize(sizeIds) {
        try {
            const sizeContainer = document.querySelector(".size-options");
            sizeContainer.innerHTML = ""; // Xóa nội dung cũ

            let sizeButtons = [];

            for (const idsize of sizeIds) {
                const response = await fetch(`${apiSize}/${idsize}`);
                if (!response.ok) continue;

                const sizeData = await response.json();
                const sizeName = sizeData.sosize;

                sizeButtons.push(`
                    <div class="size-option" data-size="${idsize}" 
                        style="style:width: 45px; height: 40px; display: inline-flex; align-items: center; justify-content: center;margin-right: 10px; cursor: pointer;  border: 1px solid #dee2e6; background-color: #fff; transition: all 0.3s ease; ">
                        ${sizeName}
                    </div>
                `);
            }

            sizeContainer.innerHTML = sizeButtons.join('');

            // ✅ Gán sự kiện click đúng cách vào từng `.size-option`
            document.querySelectorAll(".size-option").forEach(button => {
                button.addEventListener("click", function () {
                    selectSize(this); // Gọi hàm đúng
                });
            });

        } catch (error) {
            console.error("Lỗi khi lấy danh sách size:", error);
        }
    }

    async function fetchThuonghieu(idth) {
        try {
            if (!idth) {
                console.error("id thương hiệu không hợp lệ");
                return;
            }

            const response = await fetch(`${apiThuonghieu}/${idth}`);
            if (!response.ok) {
                throw new Error(`Lỗi API thương hiệu: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Lỗi khi lấy thông tin thương hiệu:", error);
        }
    }

    function convertStatus(statusCode) {
        return statusCode === 0 ? "Còn hàng" : (statusCode === 1 ? "Hết hàng" : "Không xác định");
    }    

    function resetSelections() {
        // Xóa các thuộc tính đã chọn
        selectedColorId = null;
        selectedSizeId = null;
        selectedChatlieuId = null;

        // Xóa sự kiện click cũ và thêm lại sự kiện mới
        document.querySelectorAll(".color-option, .size-option, .chatlieu-option").forEach(button => {
            button.classList.remove("active");
        });

        // Đặt lại trạng thái của các nút (cho phép chọn lại)
        document.querySelectorAll(".color-option, .size-option, .chatlieu-option").forEach(button => {
            button.disabled = false;
            button.style.opacity = "1";
            button.style.pointerEvents = "auto";
        });

        updateQuantity();
        console.log("Đã đặt lại các lựa chọn về mặc định.");
    }

    document.getElementById("increase-quantity").addEventListener("click", function () {
        if (!selectedColorId || !selectedSizeId || !selectedChatlieuId) return;

        let selectedProduct = dataspct.find(sp =>
            sp.idMau == selectedColorId &&
            sp.idSize == selectedSizeId &&
            sp.idChatLieu == selectedChatlieuId
        );

        if (!selectedProduct) return;

        let quantityInput = document.getElementById("quantity");
        let currentQuantity = parseInt(quantityInput.value, 10);
        let maxQuantity = selectedProduct.soluong - 1; // Giới hạn số lượng có thể mua

        if (currentQuantity < maxQuantity) {
            quantityInput.value = currentQuantity + 1;
        } else {
            alert("Bạn chỉ có thể mua tối đa " + maxQuantity + " sản phẩm.");
        }
    });

    document.getElementById("decrease-quantity").addEventListener("click", function () {
        let quantityInput = document.getElementById("quantity");
        let currentQuantity = parseInt(quantityInput.value, 10);

        if (currentQuantity > 1) {
            quantityInput.value = currentQuantity - 1;
        }
    });

    // Kiểm tra điều kiện khi đủ 3 thuộc tính
    function updateQuantity() {
        let quantityInput = document.getElementById("quantity");

        if (selectedColorId && selectedSizeId && selectedChatlieuId) {
            let selectedProduct = dataspct.find(sp =>
                sp.idMau == selectedColorId &&
                sp.idSize == selectedSizeId &&
                sp.idChatLieu == selectedChatlieuId
            );

            if (selectedProduct) {
                let maxQuantity = selectedProduct.soLuong;
                quantityInput.value = 1; // Đặt lại số lượng về 1
                quantityInput.setAttribute("max", maxQuantity); // Giới hạn số lượng
            }
        } else {
            quantityInput.value = 1;
        }
    }

    function muaSanphamNgay() {
        // Lấy số lượng sản phẩm người dùng nhập
        let inputQuantity = parseInt(document.querySelector("#quantity").value, 10);

        // Kiểm tra người dùng đã chọn đủ thuộc tính chưa
        if (!selectedColorId || !selectedSizeId || !selectedChatlieuId) {
            alert("Vui lòng chọn đầy đủ Màu sắc, Kích thước và Chất liệu.");
            return;
        }

        // Lọc sản phẩm chi tiết dựa trên thuộc tính đã chọn
        let selectedSPCT = dataspct.find(spct =>
            spct.idMau == selectedColorId &&
            spct.idSize == selectedSizeId &&
            spct.idChatLieu == selectedChatlieuId
        );
        if (selectedSPCT.trangThai == 1) {
            alert("Sản phẩm đã hết hàng không thể mua được");
            return;
        }

        if (!selectedSPCT) {
            alert("Không tìm thấy sản phẩm phù hợp.");
            return;
        }

        // Kiểm tra số lượng tồn kho, đảm bảo còn lại ít nhất 1 sản phẩm
        if (inputQuantity >= selectedSPCT.soluong) {
            alert("Bạn chỉ có thể mua tối đa " + (selectedSPCT.soluong - 1) + " sản phẩm.");
            return;
        }

        // Hiển thị thông báo mua hàng thành công
        alert(`Mua sản phẩm thành công! ID Sản phẩm chi tiết = ${selectedSPCT.id} và số lượng = ${inputQuantity}`);

        // Xử lý logic thêm vào giỏ hàng (nếu có)
    }

    // Gán sự kiện cho nút "Xóa tất cả"
    document.getElementById("btnResetSelections").addEventListener("click", resetSelections);
    document.getElementById("buynow").addEventListener("click", muaSanphamNgay);

    // Gọi API khi trang tải
    fetchDataSanPhamChiTiet();
})