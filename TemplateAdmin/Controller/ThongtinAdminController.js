document.addEventListener('DOMContentLoaded', function() {
    // Xử lý lưu thông tin cá nhân
    document.getElementById('savePersonalInfoBtn').addEventListener('click', function() {
        // Lấy dữ liệu từ form
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
        const bio = document.getElementById('bio').value;
        
        // Kiểm tra dữ liệu
        if (!firstName || !lastName || !email) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }
        
        // Tạo đối tượng dữ liệu
        const personalInfo = {
            firstName,
            lastName,
            email,
            phone,
            address,
            bio
        };
        
        // API call để cập nhật thông tin cá nhân
        // fetch('/api/admin/profile', {
        //     method: 'PUT',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(personalInfo),
        // })
        // .then(response => response.json())
        // .then(data => {
        //     alert('Thông tin cá nhân đã được cập nhật thành công');
        // })
        // .catch(error => {
        //     console.error('Error:', error);
        //     alert('Đã xảy ra lỗi khi cập nhật thông tin cá nhân');
        // });
        
        // Mô phỏng cập nhật thành công
        alert('Thông tin cá nhân đã được cập nhật thành công');
    });
    
    // Xử lý cập nhật mật khẩu
    document.getElementById('updatePasswordBtn').addEventListener('click', function() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Kiểm tra dữ liệu
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert('Mật khẩu mới và xác nhận mật khẩu không khớp');
            return;
        }
        
        // Tạo đối tượng dữ liệu
        const passwordData = {
            currentPassword,
            newPassword
        };
        
        // API call để cập nhật mật khẩu
        // fetch('/api/admin/password', {
        //     method: 'PUT',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(passwordData),
        // })
        // .then(response => {
        //     if (response.ok) {
        //         alert('Mật khẩu đã được cập nhật thành công');
        //         document.getElementById('securityForm').reset();
        //     } else {
        //         throw new Error('Mật khẩu hiện tại không đúng');
        //     }
        // })
        // .catch(error => {
        //     console.error('Error:', error);
        //     alert(error.message);
        // });
        
        // Mô phỏng cập nhật thành công
        alert('Mật khẩu đã được cập nhật thành công');
        document.getElementById('securityForm').reset();
    });
    
    // Xử lý lưu tùy chọn
    document.getElementById('savePreferencesBtn').addEventListener('click', function() {
        const language = document.getElementById('language').value;
        const timezone = document.getElementById('timezone').value;
        const emailNotifications = document.getElementById('emailNotifications').checked;
        
        // Tạo đối tượng dữ liệu
        const preferencesData = {
            language,
            timezone,
            emailNotifications
        };
        
        // API call để cập nhật tùy chọn
        // fetch('/api/admin/preferences', {
        //     method: 'PUT',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(preferencesData),
        // })
        // .then(response => response.json())
        // .then(data => {
        //     alert('Tùy chọn đã được lưu thành công');
        // })
        // .catch(error => {
        //     console.error('Error:', error);
        //     alert('Đã xảy ra lỗi khi lưu tùy chọn');
        // });
        
        // Mô phỏng cập nhật thành công
        alert('Tùy chọn đã được lưu thành công');
    });
    
    // Xử lý lưu hồ sơ
    document.getElementById('saveProfileBtn').addEventListener('click', function() {
        const name = document.getElementById('editName').value;
        const title = document.getElementById('editTitle').value;
        
        // Kiểm tra dữ liệu
        if (!name || !title) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }
        
        // Tạo đối tượng dữ liệu
        const profileData = {
            name,
            title
        };
        
        // API call để cập nhật hồ sơ
        // fetch('/api/admin/profile-basic', {
        //     method: 'PUT',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(profileData),
        // })
        // .then(response => response.json())
        // .then(data => {
        //     // Cập nhật UI
        //     document.querySelector('h4.mb-1').textContent = name;
        //     document.querySelector('p.text-muted.mb-3').textContent = title;
        //     
        //     const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
        //     modal.hide();
        //     
        //     alert('Hồ sơ đã được cập nhật thành công');
        // })
        // .catch(error => {
        //     console.error('Error:', error);
        //     alert('Đã xảy ra lỗi khi cập nhật hồ sơ');
        // });
        
        // Mô phỏng cập nhật thành công
        document.querySelector('h4.mb-1').textContent = name;
        document.querySelector('p.text-muted.mb-3').textContent = title;
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
        modal.hide();
        
        alert('Hồ sơ đã được cập nhật thành công');
    });
});