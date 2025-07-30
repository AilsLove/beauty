// 查询预约页面功能
document.addEventListener('DOMContentLoaded', function() {
    
    // 绑定查询表单提交事件
    document.getElementById('queryForm').addEventListener('submit', handleQuerySubmit);
    
});

// 处理查询表单提交
async function handleQuerySubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const phone = formData.get('queryPhone').trim();
    
    // 验证手机号
    if (!utils.validatePhone(phone)) {
        utils.showModal('请输入正确的手机号码。', 'error');
        return;
    }
    
    try {
        // 显示加载状态
        const submitBtn = event.target.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '查询中...';
        submitBtn.disabled = true;
        
        // 查找用户
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, name')
            .eq('phone', phone)
            .single();
            
        if (userError) {
            if (userError.code === 'PGRST116') {
                utils.showModal('未找到该手机号码的预约记录。', 'error');
            } else {
                console.error('查询用户失败:', userError);
                utils.showModal('查询失败，请重试。', 'error');
            }
            return;
        }
        
        // 查询该用户的所有预约
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
                *,
                services (name, price, duration)
            `)
            .eq('user_id', user.id)
            .order('booking_date', { ascending: false })
            .order('booking_time', { ascending: false });
            
        if (bookingsError) {
            console.error('查询预约失败:', bookingsError);
            utils.showModal('查询预约失败，请重试。', 'error');
            return;
        }
        
        // 显示查询结果
        displayBookings(bookings, user.name);
        
    } catch (error) {
        console.error('查询过程中出错:', error);
        utils.showModal('查询过程中出现错误，请重试。', 'error');
    } finally {
        // 恢复按钮状态
        const submitBtn = event.target.querySelector('.submit-btn');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// 显示预约记录
function displayBookings(bookings, userName) {
    const queryResults = document.getElementById('queryResults');
    const bookingsList = document.getElementById('bookingsList');
    
    if (bookings.length === 0) {
        bookingsList.innerHTML = '<p class="no-bookings">暂无预约记录。</p>';
    } else {
        bookingsList.innerHTML = bookings.map(booking => `
            <div class="booking-item">
                <div class="booking-header">
                    <h4>${booking.services.name}</h4>
                    <span class="booking-status status-${booking.status}">
                        ${utils.getStatusText(booking.status)}
                    </span>
                </div>
                <div class="booking-details">
                    <div class="booking-info">
                        <p><strong>预约时间：</strong>${utils.formatDate(booking.booking_date)} ${utils.formatTime(booking.booking_time)}</p>
                        <p><strong>服务时长：</strong>${booking.services.duration} 分钟</p>
                        <p><strong>服务价格：</strong>¥${booking.services.price}</p>
                        ${booking.notes ? `<p><strong>备注：</strong>${booking.notes}</p>` : ''}
                        <p><strong>预约时间：</strong>${utils.formatDate(booking.created_at)}</p>
                    </div>
                    ${booking.status === 'pending' ? `
                        <div class="booking-actions">
                            <button class="action-btn btn-cancel" onclick="cancelBooking('${booking.id}')">
                                取消预约
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }
    
    queryResults.style.display = 'block';
}

// 取消预约
async function cancelBooking(bookingId) {
    if (!confirm('确定要取消这个预约吗？')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', bookingId);
            
        if (error) {
            console.error('取消预约失败:', error);
            utils.showModal('取消预约失败，请重试。', 'error');
            return;
        }
        
        utils.showModal('预约已成功取消。', 'success');
        
        // 刷新当前显示的预约列表
        const queryForm = document.getElementById('queryForm');
        handleQuerySubmit({ preventDefault: () => {}, target: queryForm });
        
    } catch (error) {
        console.error('取消预约时出错:', error);
        utils.showModal('取消预约时出现错误，请重试。', 'error');
    }
}