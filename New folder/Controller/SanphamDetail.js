
app.controller('SanphamDetail', function () {
    const apiSPCTUrl = "https://localhost:7196/api/Sanphamchitiets";
    const apiSPUrl = "https://localhost:7196/api/Sanphams";
    const apiSize = "https://localhost:7196/api/size";
    const apiChatlieu = "https://localhost:7196/api/ChatLieu";
    const apiMau = "https://localhost:7196/api/color";
    const apiThuonghieu = "https://localhost:7196/api/thuonghieu";
    const sanPhamId = 1;
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
                document.querySelector("#product-status").textContent = convertStatus(spct.trangthai);
                
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
                    allImages.push(imageUrl);
    
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
            container.innerHTML = allImages.map((imgUrl, index) =>
                `<img src="${imgUrl}" class="thumbnail-img ${index === 0 ? 'active' : ''}" 
                    data-img-url="${imgUrl}" alt="Thumbnail ${index + 1}">`
            ).join('');
    
            // Hiển thị ảnh đầu tiên vào position-relative
            mainImage.src = allImages[0];
    
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
    
        } catch (error) {
            console.error("Lỗi khi lấy ảnh sản phẩm chi tiết:", error);
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

    function updateSizeOptions(validSizeIds) {
        const sizeIdSet = new Set(validSizeIds); // Giữ nguyên kiểu int
    
        document.querySelectorAll(".size-option").forEach(button => {
            const rawSizeId = button.getAttribute("data-size"); // Lấy giá trị thô
            console.log("📌 rawSizeId:", rawSizeId); // Kiểm tra giá trị thực tế
        
            // Chỉ chuyển về int nếu rawSizeId hợp lệ
            const sizeId = rawSizeId ? parseInt(rawSizeId, 10) : NaN;
        
            console.log("🔍 sizeId sau khi parse:", sizeId);
        
            if (!isNaN(sizeId) && sizeIdSet.has(sizeId)) {
                button.style.display = "inline-block";  // Hiển thị nếu hợp lệ
            } else {
                button.style.display = "none";  // Ẩn nếu không hợp lệ
            }
        });
        
    }
    
    function updateChatlieuOptions(validChatlieuIds) {
        const chatlieuIdSet = new Set(validChatlieuIds); // Giữ nguyên kiểu int
    
        document.querySelectorAll(".chatlieu-option").forEach(button => {
            const chatlieuId = parseInt(button.getAttribute("data-chatlieu")); // Chuyển về int để so sánh
            if (chatlieuIdSet.has(chatlieuId)) {
                button.style.display = "inline-block";  // Hiển thị nếu hợp lệ
            } else {
                button.style.display = "none";  // Ẩn nếu không hợp lệ
            }
        });
    }
    
    function filterAttributesByColor(selectedColorId) {
        console.log(dataspct);
        // Lọc danh sách sản phẩm chi tiết theo màu sắc
        const filteredSPCTs = dataspct.filter(anhspct => anhspct.idMau == selectedColorId);
    
        // Lấy danh sách kích thước & chất liệu hợp lệ
        const validSizeIds = new Set(filteredSPCTs.map(anhspct => anhspct.idSize));
        const validChatlieuIds = new Set(filteredSPCTs.map(anhspct => anhspct.idChatLieu));
    
        // Cập nhật danh sách kích thước & chất liệu trên giao diện
        updateSizeOptions([...validSizeIds]);
        updateChatlieuOptions([...validChatlieuIds]);
    }    
    

    // 🟢 Xử lý chọn màu, chỉ được chọn một màu duy nhất
    function selectColor(selectedButton) {
        // Xóa trạng thái active của tất cả màu
        document.querySelectorAll(".color-option").forEach(button => {
            button.classList.remove("active");
            button.querySelector(".color-check").style.display = "none";
        });
    
        // Đánh dấu màu được chọn
        selectedButton.classList.add("active");
        selectedButton.querySelector(".color-check").style.display = "block";
    
        // Lọc thuộc tính dựa trên màu đã chọn
        const selectedColorId = selectedButton.getAttribute("data-color");
        filterAttributesByColor(selectedColorId);
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
                colorButton.innerHTML = `
                     <span class="color-check" style="display: none; 
                        position: absolute; 
                        top: 50%; left: 50%; 
                        transform: translate(-50%, -50%);
                        font-size: 18px; font-weight: bold;">✔</span>
                `;

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
                    selectChatLieu(this); // Gọi hàm đúng cách
                });
            });

        } catch (error) {
            console.error("Lỗi khi lấy danh sách chất liệu:", error);
        }
    }

    function selectSize(selectedButton) {
        document.querySelectorAll(".size-option").forEach(button => {
            button.classList.remove("active"); // Xóa trạng thái active cũ
        });

        selectedButton.classList.add("active"); // Thêm active cho phần tử được chọn
    }

    function selectChatLieu(selectedButton) {
        document.querySelectorAll(".chatlieu-option").forEach(button => {
            button.classList.remove("active"); // Xóa trạng thái active cũ
        });

        selectedButton.classList.add("active"); // Thêm active cho phần tử được chọn
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


    function selectChatLieu(selectedButton) {
        document.querySelectorAll(".chatlieu-option").forEach(button => {
            button.classList.remove("active"); // Xóa trạng thái active cũ
        });

        selectedButton.classList.add("active"); // Thêm active cho phần tử được chọn
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
        return statusCode === 0 ? "Còn hàng" : "Hết hàng";
    }


    // Gọi API khi trang tải
    fetchDataSanPhamChiTiet();
})