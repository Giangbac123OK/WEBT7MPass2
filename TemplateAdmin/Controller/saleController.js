app.controller('saleController', function () {
    function toggleStatus(el) {
        el.classList.toggle("active");
    }
    document.getElementById("btnAddSaleDetail").addEventListener("click", function () {
        let tableBody = document.getElementById("saleDetailBody");
        let newRow = document.createElement("tr");

        newRow.innerHTML = `
                <td style="width: 40%;">
                    <select class="form-control">
                        <option value="sp1">Sản phẩm 1</option>
                        <option value="sp2">Sản phẩm 2</option>
                        <option value="sp3">Sản phẩm 3</option>
                    </select>
                </td>
                <td style="width: 10%;">
                    <select class="form-control">
                        <option value="1">%</option>
                        <option value="0">VNĐ</option>
                    </select>
                </td>
                <td style="width: 15%;"><input type="number" class="form-control" placeholder="Số lượng"></td>
                <td style="width: 25%;"><input type="number" class="form-control" placeholder="Giá trị giảm"></td>
                <td style="width: 10%;">
                    <button type="button" class="btn btn-danger btnRemoveRow">Xóa</button>
                </td>
            `;

        tableBody.appendChild(newRow);

        // Xóa hàng khi nhấn nút "Xóa"
        newRow.querySelector(".btnRemoveRow").addEventListener("click", function () {
            newRow.remove();
        });
    });

    const btnAddSaleDetail = document.getElementById("btnAddSaleDetailupdate");
    const editSaleDetailBody = document.getElementById("editSaleDetailBody");

    // Hàm gọi API lấy dữ liệu sale chi tiết
    function loadSaleDetails() {
        fetch("/api/saleDetails") // Thay API thật của bạn ở đây
            .then(response => response.json())
            .then(data => {
                editSaleDetailBody.innerHTML = ""; // Xóa dữ liệu cũ trước khi cập nhật

                data.forEach(detail => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td style="width: 30%;"><input type="text" class="form-control" value="${detail.product}" disabled></td>
                        <td style="width: 10%;"><input type="text" class="form-control" value="${detail.unit}" disabled></td>
                        <td style="width: 15%;"><input type="number" class="form-control" value="${detail.quantity}"></td>
                        <td style="width: 20%;"><input type="number" class="form-control" value="${detail.discountValue}"></td>
                        <td class="text-center" style="width: 10%;">
                            <button class="btn btn-success btn-sm btnUpdateDetail" disabled>Cập Nhật</button>
                        </td>
                        <td class="text-center" style="width: 10%;">
                            <button class="btn btn-danger btn-sm btnDeleteRow">Xóa</button>
                        </td>
                    `;
                    editSaleDetailBody.appendChild(row);
                });
            })
            .catch(error => console.error("Lỗi tải dữ liệu sale chi tiết:", error));
    }

    // Hàm tạo một hàng sale ảo không có nút cập nhật
    function createFakeSaleDetailRow() {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td style="width: 30%;">
                <select class="form-control">
                    <option value="sp1">Sản phẩm 1</option>
                    <option value="sp2">Sản phẩm 2</option>
                    <option value="sp3">Sản phẩm 3</option>
                </select>
            </td>
            <td style="width: 10%;">
                <select class="form-control">
                    <option value="1">%</option>
                    <option value="0">VNĐ</option>
                </select>
            </td>
            <td style="width: 15%;"><input type="number" class="form-control" placeholder="Số lượng"></td>
            <td style="width: 20%;"><input type="number" class="form-control" placeholder="Giá trị giảm"></td>
            <td class="text-center" style="width: 10%;"></td>
            <td class="text-center" style="width: 10%;">
                <button type="button" class="btn btn-danger btn-sm btnDeleteRow">Xóa</button>
            </td>
        `;
        return row;
    }

    // Sự kiện thêm hàng sale chi tiết ảo
    btnAddSaleDetail.addEventListener("click", function () {
        editSaleDetailBody.appendChild(createFakeSaleDetailRow());
    });

    // Xử lý sự kiện cập nhật hoặc xóa
    editSaleDetailBody.addEventListener("input", function (event) {
        const row = event.target.closest("tr");
        const updateButton = row.querySelector(".btnUpdateDetail");
        if (updateButton) {
            updateButton.disabled = false; // Bật nút "Cập Nhật" khi có thay đổi
        }
    });

    editSaleDetailBody.addEventListener("click", function (event) {
        const row = event.target.closest("tr");

        if (event.target.classList.contains("btnUpdateDetail")) {
            alert("Cập nhật dữ liệu hàng này thành công!");
            event.target.disabled = true; // Sau khi cập nhật, tắt nút "Cập Nhật"
        }

        if (event.target.classList.contains("btnDeleteRow")) {
            row.remove();
        }
    });

    // Sự kiện cập nhật toàn bộ Sale
    document.getElementById("btnUpdateSale").addEventListener("click", function () {
        alert("Cập nhật toàn bộ Sale thành công!");
    });

    // Gọi API khi trang tải
    loadSaleDetails();
});