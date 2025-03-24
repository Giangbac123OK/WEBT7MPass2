document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const returnForm = document.getElementById('returnForm');
    const reasonRadios = document.querySelectorAll('input[name="returnReason"]');
    const refundMethodSelect = document.getElementById('refundMethod');
    const selectedReasonText = document.getElementById('selectedReasonText');
    const selectedRefundMethodText = document.getElementById('selectedRefundMethodText');
    const submitButton = document.getElementById('submitButton');
    const imageUpload1 = document.getElementById('imageUpload1');
    const imageUpload2 = document.getElementById('imageUpload2');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const imageCountElement = document.getElementById('imageCount');
    
    // Track uploaded images
    let uploadedImages = [];
    
    // Map reason values to display text
    const reasonTextMap = {
      'defective': 'Hàng lỗi, không hoạt động',
      'damaged': 'Hàng hết hạn sử dụng',
      'other': 'Khác với mô tả',
      'used': 'Hàng đã qua sử dụng',
      'fake': 'Hàng giả, nhái',
      'missing': 'Hàng nguyên vẹn nhưng không còn như cũ'
    };
    
    // Map refund method values to display text
    const refundMethodTextMap = {
      'balance': 'Số dư TK Shopee',
      'bank': 'Tài khoản ngân hàng',
      'card': 'Thẻ tín dụng/ghi nợ'
    };
    
    // Update selected reason text and enable/disable submit button
    reasonRadios.forEach(radio => {
      radio.addEventListener('change', function() {
        const selectedReason = this.value;
        selectedReasonText.textContent = reasonTextMap[selectedReason] || 'Chưa chọn';
        updateSubmitButtonState();
      });
      
      // Make the entire option clickable
      const parentLabel = radio.closest('.custom-reason-option');
      if (parentLabel) {
        parentLabel.addEventListener('click', function() {
          radio.checked = true;
          const event = new Event('change');
          radio.dispatchEvent(event);
        });
      }
    });
    
    // Update selected refund method text
    refundMethodSelect.addEventListener('change', function() {
      const selectedMethod = this.value;
      selectedRefundMethodText.textContent = refundMethodTextMap[selectedMethod] || 'Số dư TK Shopee';
    });
    
    // Handle image uploads
    [imageUpload1, imageUpload2].forEach(uploader => {
      uploader.addEventListener('change', function(event) {
        if (event.target.files && event.target.files[0]) {
          if (uploadedImages.length < 3) {
            const file = event.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
              const imageUrl = e.target.result;
              addImagePreview(imageUrl);
              uploadedImages.push(imageUrl);
              updateImageCount();
              updateUploadBoxesVisibility();
            };
            
            reader.readAsDataURL(file);
          }
        }
      });
    });
    
    // Add image preview to the container
    function addImagePreview(imageUrl) {
      const col = document.createElement('div');
      col.className = 'col-md-3';
      col.innerHTML = `
        <div class="image-preview">
          <img src="${imageUrl}" alt="Uploaded image">
          <button type="button" class="remove-image">&times;</button>
        </div>
      `;
      
      // Insert before upload boxes
      const uploadBox1 = document.getElementById('uploadBox1').closest('.col-md-3');
      imagePreviewContainer.insertBefore(col, uploadBox1);
      
      // Add event listener to remove button
      const removeButton = col.querySelector('.remove-image');
      removeButton.addEventListener('click', function() {
        col.remove();
        const index = uploadedImages.indexOf(imageUrl);
        if (index > -1) {
          uploadedImages.splice(index, 1);
        }
        updateImageCount();
        updateUploadBoxesVisibility();
      });
    }
    
    // Update image count display
    function updateImageCount() {
      imageCountElement.textContent = uploadedImages.length;
    }
    
    // Show/hide upload boxes based on number of images
    function updateUploadBoxesVisibility() {
      const uploadBox1Element = document.getElementById('uploadBox1').closest('.col-md-3');
      const uploadBox2Element = document.getElementById('uploadBox2').closest('.col-md-3');
      
      if (uploadedImages.length >= 3) {
        uploadBox1Element.style.display = 'none';
        uploadBox2Element.style.display = 'none';
      } else {
        uploadBox1Element.style.display = 'block';
        uploadBox2Element.style.display = 'block';
      }
    }
    
    // Enable/disable submit button based on form state
    function updateSubmitButtonState() {
      const isReasonSelected = Array.from(reasonRadios).some(radio => radio.checked);
      submitButton.disabled = !isReasonSelected;
    }
    
    // Form submission
    returnForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      // Get selected reason
      let selectedReason = '';
      reasonRadios.forEach(radio => {
        if (radio.checked) {
          selectedReason = radio.value;
        }
      });
      
      // Get refund method
      const selectedRefundMethod = refundMethodSelect.value;
      
      // Get error code and description
      const errorCode = document.getElementById('errorCode').value;
      const description = document.getElementById('description').value;
      
      // Create form data object
      const formData = {
        reason: selectedReason,
        refundMethod: selectedRefundMethod,
        errorCode: errorCode,
        description: description,
        images: uploadedImages
      };
      
      // In a real application, you would send this data to the server
      console.log('Form submitted with data:', formData);
      alert('Yêu cầu trả hàng/hoàn tiền đã được gửi thành công!');
    });
  });