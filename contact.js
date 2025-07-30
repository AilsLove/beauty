// 联系页面功能
document.addEventListener('DOMContentLoaded', function() {
    
    // 绑定留言表单提交事件
    document.getElementById('messageForm').addEventListener('submit', handleMessageSubmit);
    
});

// 处理留言表单提交
async function handleMessageSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const messageData = {
        name: formData.get('messageName').trim(),
        phone: formData.get('messagePhone').trim(),
        email: formData.get('messageEmail').trim(),
        subject: formData.get('messageSubject'),
        content: formData.get('messageContent').trim()
    };
    
    // 验证表单数据
    if (!validateMessageData(messageData)) {
        return;
    }
    
    try {
        // 显示提交状态
        const submitBtn = event.target.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '发送中...';
        submitBtn.disabled = true;
        
        // 这里可以将留言保存到数据库或发送邮件
        // 暂时使用模拟提交
        await simulateMessageSubmit(messageData);
        
        // 显示成功消息
        showModal('留言发送成功！我们会在24小时内回复您。', 'success');
        
        // 重置表单
        event.target.reset();
        
    } catch (error) {
        console.error('发送留言时出错:', error);
        showModal('留言发送失败，请重试或直接致电我们。', 'error');
    } finally {
        // 恢复按钮状态
        const submitBtn = event.target.querySelector('.submit-btn');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// 验证留言数据
function validateMessageData(data) {
    if (!data.name) {
        showModal('请输入您的姓名。', 'error');
        return false;
    }
    
    if (!validatePhone(data.phone)) {
        showModal('请输入正确的手机号码。', 'error');
        return false;
    }
    
    if (data.email && !validateEmail(data.email)) {
        showModal('请输入正确的邮箱地址。', 'error');
        return false;
    }
    
    if (!data.content) {
        showModal('请输入留言内容。', 'error');
        return false;
    }
    
    if (data.content.length < 10) {
        showModal('留言内容至少需要10个字符。', 'error');
        return false;
    }
    
    return true;
}

// 验证手机号
function validatePhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
}

// 验证邮箱
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 模拟留言提交
async function simulateMessageSubmit(messageData) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 这里可以实现真实的留言保存逻辑
    console.log('留言数据:', messageData);
    
    return true;
}

// 显示模态框消息
function showModal(message, type = 'success') {
    const modal = document.getElementById('modal');
    const modalMessage = document.getElementById('modalMessage');
    
    modalMessage.innerHTML = `
        <div class="alert alert-${type}">
            <p>${message}</p>
        </div>
    `;
    
    modal.style.display = 'block';
    
    // 添加关闭事件
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };
    
    // 点击模态框外部关闭
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    // 自动关闭（成功消息3秒后关闭）
    if (type === 'success') {
        setTimeout(() => {
            modal.style.display = 'none';
        }, 3000);
    }
}