// 后台管理页面功能
document.addEventListener('DOMContentLoaded', function() {
    
    // 加载所有预约数据
    loadBookings();
    
    // 绑定筛选控件事件
    document.getElementById('statusFilter').addEventListener('change', loadBookings);
    document.getElementById('dateFilter').addEventListener('change', loadBookings);
    document.getElementById('refreshBtn').addEventListener('click', loadBookings);
    
    // 定期刷新数据（每30秒）
    setInterval(loadBookings, 30000);
    
});

// 加载预约数据
async function loadBookings() {
    try {
        // 显示加载状态
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.textContent = '加载中...';
        refreshBtn.disabled = true;
        
        // 获取筛选条件
        const statusFilter = document.getElementById('statusFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;
        
        // 构建查询
        let query = supabase
            .from('bookings')
            .select(`
                *,
                users (name, phone, email),
                services (name, price, duration)
            `)
            .order('booking_date', { ascending: false })
            .order('booking_time', { ascending: false });
            
        // 应用筛选条件
        if (statusFilter) {
            query = query.eq('status', statusFilter);
        }
        
        if (dateFilter) {
            query = query.eq('booking_date', dateFilter);
        }
        
        const { data: bookings, error } = await query;
        
        if (error) {
            console.error('加载预约数据失败:', error);
            utils.showModal('加载数据失败，请重试。', 'error');
            return;
        }
        
        // 显示预约数据
        displayBookingsTable(bookings);
        
        // 更新统计数据
        updateStats(bookings);
        
    } catch (error) {
        console.error('加载预约数据时出错:', error);
        utils.showModal('加载数据时出现错误，请重试。', 'error');
    } finally {
        // 恢复按钮状态
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.textContent = '刷新数据';
        refreshBtn.disabled = false;
    }
}

// 显示预约表格
function displayBookingsTable(bookings) {
    const tableBody = document.getElementById('bookingsTableBody');
    
    if (bookings.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem;">
                    暂无预约数据
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = bookings.map(booking => `
        <tr>
            <td>
                ${utils.formatDate(booking.booking_date)}<br>
                <small>${utils.formatTime(booking.booking_time)}</small>
            </td>
            <td>
                <strong>${booking.users.name}</strong><br>
                <small>预约于 ${utils.formatDate(booking.created_at)}</small>
            </td>
            <td>
                ${booking.services.name}<br>
                <small>¥${booking.services.price} / ${booking.services.duration}分钟</small>
            </td>
            <td>${booking.users.phone}</td>
            <td>
                <span class="booking-status status-${booking.status}">
                    ${utils.getStatusText(booking.status)}
                </span>
            </td>
            <td>
                <div style="max-width: 200px; word-wrap: break-word;">
                    ${booking.notes || '-'}
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    ${booking.status === 'pending' ? `
                        <button class="action-btn btn-confirm" onclick="updateBookingStatus('${booking.id}', 'confirmed')">
                            确认
                        </button>
                    ` : ''}
                    ${booking.status === 'confirmed' ? `
                        <button class="action-btn btn-complete" onclick="updateBookingStatus('${booking.id}', 'completed')">
                            完成
                        </button>
                    ` : ''}
                    ${['pending', 'confirmed'].includes(booking.status) ? `
                        <button class="action-btn btn-cancel" onclick="updateBookingStatus('${booking.id}', 'cancelled')">
                            取消
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// 更新统计数据
function updateStats(bookings) {
    const today = new Date().toISOString().split('T')[0];
    
    // 今日预约数
    const todayCount = bookings.filter(booking => booking.booking_date === today).length;
    document.getElementById('todayCount').textContent = todayCount;
    
    // 待确认数
    const pendingCount = bookings.filter(booking => booking.status === 'pending').length;
    document.getElementById('pendingCount').textContent = pendingCount;
    
    // 已确认数
    const confirmedCount = bookings.filter(booking => booking.status === 'confirmed').length;
    document.getElementById('confirmedCount').textContent = confirmedCount;
}

// 更新预约状态
async function updateBookingStatus(bookingId, newStatus) {
    const statusTexts = {
        'confirmed': '确认',
        'completed': '完成',
        'cancelled': '取消'
    };
    
    const action = statusTexts[newStatus];
    if (!confirm(`确定要${action}这个预约吗？`)) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('bookings')
            .update({ status: newStatus })
            .eq('id', bookingId);
            
        if (error) {
            console.error(`${action}预约失败:`, error);
            utils.showModal(`${action}预约失败，请重试。`, 'error');
            return;
        }
        
        utils.showModal(`预约已${action}。`, 'success');
        
        // 刷新数据
        loadBookings();
        
    } catch (error) {
        console.error(`${action}预约时出错:`, error);
        utils.showModal(`${action}预约时出现错误，请重试。`, 'error');
    }
}