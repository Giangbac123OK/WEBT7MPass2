
app.controller('SanphamDetail', function () {
    const apiSPCTUrl = "https://localhost:7196/api/Sanphamchitiets";
    const sanPhamId = 1;

    // Hàm gọi API để lấy sản phẩm chi tiết theo idsp
    async function fetchSanPhamChitiet() {
        try {
            // Kiểm tra nếu idsp có giá trị hợp lệ
            if (!sanPhamId) {
                console.error("idsp không hợp lệ");
                return null;
            }

            // Gọi API với idspct
            const response = await fetch(`${apiSPCTUrl}/sanpham/${sanPhamId}`);

            if (!response.ok) {
                throw new Error(`Lỗi API: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);
            // Nếu API trả về một đối tượng, chuyển đổi nó thành mảng
            return Array.isArray(data) ? data : [data];
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm chi tiết:", error);
            return null; // Trả về null nếu có lỗi
        }   
    }

    async function fetchAnhSanPhamChiTiet(idspct) {
        try {
            if (!idspct) {
                console.error("idspct không hợp lệ");
                return null;
            }

            // Gọi API với idspct
            const response = await fetch(`${apiSPCTUrl}/GetImageById/${idspct}`);

            if (!response.ok) {
                throw new Error(`Lỗi API: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);

            return data;
        } catch (error) {
            console.error("Lỗi khi lấy ảnh sản phẩm chi tiết:", error);
            return null;
        }   
    }

    fetchSanPhamChitiet();
    document.querySelectorAll(".filter-buttons button").forEach(button => {
        button.addEventListener("click", function () {
            document.querySelector(".active").classList.remove("active");
            this.classList.add("active");

            let filter = this.getAttribute("data-filter");
            filterReviews(filter);
        });
    });

    function filterReviews(filter) {
        let reviews = document.querySelectorAll("#reviews .review");

        reviews.forEach(review => {
            let rating = review.getAttribute("data-rating");
            let hasComment = review.getAttribute("data-comment");
            let hasMedia = review.getAttribute("data-media");
            let isLocal = review.getAttribute("data-local");

            if (filter === "all" ||
                (filter === "comment" && hasComment === "true") ||
                (filter === "media" && hasMedia === "true") ||
                (filter === "local" && isLocal === "true") ||
                rating === filter) {
                review.style.display = "block";
            } else {
                review.style.display = "none";
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        // Quantity selector
        const quantityInput = document.getElementById('quantity');
        const decreaseBtn = document.getElementById('decrease-quantity');
        const increaseBtn = document.getElementById('increase-quantity');

        decreaseBtn.addEventListener('click', function () {
            let currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });

        increaseBtn.addEventListener('click', function () {
            let currentValue = parseInt(quantityInput.value);
            quantityInput.value = currentValue + 1;
        });

        // Color selection
        document.querySelectorAll('.color-option').forEach(button => {
            button.addEventListener('click', function () {
                // Remove active class from all buttons
                document.querySelectorAll('.color-option').forEach(btn => {
                    btn.classList.remove('active');
                });
                // Add active class to clicked button
                this.classList.add('active');

                const selectedColor = this.getAttribute('data-color');
                console.log('Selected color:', selectedColor);
            });
        });

        // Size selection
        const sizeOptions = document.querySelectorAll('.size-option');
        sizeOptions.forEach(option => {
            option.addEventListener('click', function () {
                sizeOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');

                const selectedSize = this.getAttribute('data-size');
                console.log('Selected size:', selectedSize);
            });
        });

        // Thumbnail image selection
        const thumbnails = document.querySelectorAll('.thumbnail-img');
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function () {
                thumbnails.forEach(thumb => thumb.classList.remove('active'));
                this.classList.add('active');

                const imgId = this.getAttribute('data-img-id');
                console.log('Selected image:', imgId);

                // Example of how you might update the main product image
                // document.getElementById('main-product-image').src = `/images/product-large-${imgId}.jpg`;
            });
        });

        // Wishlist toggle
        const wishlistBtn = document.getElementById('add-to-wishlist');
        wishlistBtn.addEventListener('click', function () {
            this.classList.toggle('active');
            const icon = this.querySelector('i');
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
        });

        // Add to cart button
        document.getElementById('add-to-cart').addEventListener('click', function () {
            const quantity = parseInt(document.getElementById('quantity').value);
            const selectedColor = document.querySelector('.color-option.active').getAttribute('data-color');
            const selectedSize = document.querySelector('.size-option.active').getAttribute('data-size');

            // Here you would typically make an AJAX call to your backend
            console.log('Adding to cart:', {
                productId: 'CV0953-107',
                quantity: quantity,
                color: selectedColor,
                size: selectedSize
            });

            // Example of how you might call your backend
            addToCart('CV0953-107', quantity, selectedColor, selectedSize);
        });

        // Buy now button
        document.getElementById('buy-now').addEventListener('click', function () {
            const quantity = parseInt(document.getElementById('quantity').value);
            const selectedColor = document.querySelector('.color-option.active').getAttribute('data-color');
            const selectedSize = document.querySelector('.size-option.active').getAttribute('data-size');

            // Here you would typically redirect to checkout page
            console.log('Buy now:', {
                productId: 'CV0953-107',
                quantity: quantity,
                color: selectedColor,
                size: selectedSize
            });

            // Example of how you might call your backend
            buyNow('CV0953-107', quantity, selectedColor, selectedSize);
        });

        // Function to add product to cart (would connect to your C# backend)
        function addToCart(productId, quantity, color, size) {
            // Example AJAX call to your C# backend
            fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: productId,
                    quantity: quantity,
                    color: color,
                    size: size
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Sản phẩm đã được thêm vào giỏ hàng!');
                        // Update cart count in UI if needed
                    } else {
                        alert('Có lỗi xảy ra: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.');
                });
        }

        // Function to proceed to checkout (would connect to your C# backend)
        function buyNow(productId, quantity, color, size) {
            // Example AJAX call to your C# backend
            fetch('/api/checkout/buynow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: productId,
                    quantity: quantity,
                    color: color,
                    size: size
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Redirect to checkout page
                        window.location.href = data.checkoutUrl;
                    } else {
                        alert('Có lỗi xảy ra: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Có lỗi xảy ra khi xử lý đơn hàng.');
                });
        }

        // Rating functionality
        document.querySelectorAll('.rating i').forEach(star => {
            star.addEventListener('click', function () {
                const rating = this.getAttribute('data-rating');
                const stars = this.parentElement.children;

                for (let i = 0; i < stars.length; i++) {
                    if (i < rating) {
                        stars[i].classList.remove('far');
                        stars[i].classList.add('fas');
                    } else {
                        stars[i].classList.remove('fas');
                        stars[i].classList.add('far');
                    }
                }
            });
        });

        // Comment form submission
        document.querySelector('.comment-form button').addEventListener('click', function () {
            const commentText = document.querySelector('.comment-form textarea').value;
            const rating = document.querySelectorAll('.comment-form .rating .fas').length;

            if (commentText.trim() === '') {
                alert('Vui lòng nhập nội dung bình luận');
                return;
            }

            // Here you would typically send this to your backend
            console.log('New comment:', {
                text: commentText,
                rating: rating
            });

            // Clear the form
            document.querySelector('.comment-form textarea').value = '';
            // Reset rating
            document.querySelectorAll('.comment-form .rating i').forEach((star, index) => {
                if (index < 4) {
                    star.classList.remove('far');
                    star.classList.add('fas');
                } else {
                    star.classList.remove('fas');
                    star.classList.add('far');
                }
            });
        });

        // Related products hover effect
        document.querySelectorAll('.related-products .card').forEach(card => {
            card.addEventListener('mouseenter', function () {
                this.style.transform = 'translateY(-5px)';
                this.style.transition = 'transform 0.3s ease';
            });

            card.addEventListener('mouseleave', function () {
                this.style.transform = 'translateY(0)';
            });
        });
    });
})