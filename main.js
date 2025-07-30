// 主页面 - 预约功能
document.addEventListener('DOMContentLoaded', function() {
    
    // 加载服务项目
    loadServices();
    
    // 设置最小日期为今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').min = today;
    
    // 绑定表单提交事件
    document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmit);
    
});

// 加载服务项目
async function loadServices() {
    try {
        const { data: services, error } = await supabase
            .from('services')
            .select('*')
            .eq('is_active', true)
            .order('name');
            
        if (error) {
            console.error('加载服务项目失败:', error);
            return;
        }
        
        // 填充服务选择下拉框
        const serviceSelect = document.getElementById('serviceSelect');
        services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = `${service.name} - ¥${service.price} (${service.duration}分钟)`;
            serviceSelect.appendChild(option);
        });
        
        // 显示服务项目网格
        displayServicesGrid(services);
        
    } catch (error) {
        console.error('加载服务项目时出错:', error);
    }
}

// 显示服务项目网格
function displayServicesGrid(services) {
    const servicesGrid = document.getElementById('servicesGrid');
    servicesGrid.innerHTML = '';
    
    services.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        serviceCard.innerHTML = `
            <h4>${service.name}</h4>
            <p>${service.description || ''}</p>
            <div class="duration">服务时长：${service.duration} 分钟</div>
            <div class="price">¥${service.price}</div>
        `;
        servicesGrid.appendChild(serviceCard);
    });
}

// 处理预约表单提交
async function handleBookingSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const bookingData = {
        customerName: formData.get('customerName').trim(),
        customerPhone: formData.get('customerPhone').trim(),
        customerEmail: formData.get('customerEmail').trim(),
        serviceId: formData.get('serviceSelect'),
        bookingDate: formData.get('bookingDate'),
        bookingTime: formData.get('bookingTime'),
        notes: formData.get('notes').trim()
    };
    
    // 验证表单数据
    if (!validateBookingData(bookingData)) {
        return;
    }
    
    try {
        // 检查时间段是否已被预约
        const isTimeSlotAvailable = await checkTimeSlotAvailability(
            bookingData.bookingDate, 
            bookingData.bookingTime
        );
        
        if (!isTimeSlotAvailable) {
            utils.showModal('该时间段已被预约，请选择其他时间。', 'error');
            return;
        }
        
        // 创建或获取用户
        const userId = await createOrGetUser({
            name: bookingData.customerName,
            phone: bookingData.customerPhone,
            email: bookingData.customerEmail
        });
        
        if (!userId) {
            utils.showModal('用户信息保存失败，请重试。', 'error');
            return;
        }
        
        // 创建预约
        const { data, error } = await supabase
            .from('bookings')
            .insert({
                user_id: userId,
                service_id: bookingData.serviceId,
                booking_date: bookingData.bookingDate,
                booking_time: bookingData.bookingTime,
                notes: bookingData.notes,
                status: 'pending'
            })
            .select();
            
        if (error) {
            console.error('创建预约失败:', error);
            utils.showModal('预约失败，请重试。', 'error');
            return;
        }
        
        // 预约成功
        utils.showModal('预约成功！我们会尽快联系您确认预约详情。', 'success');
        
        // 重置表单
        event.target.reset();
        
    } catch (error) {
        console.error('预约过程中出错:', error);
        utils.showModal('预约过程中出现错误，请重试。', 'error');
    }
}

// 验证预约数据
function validateBookingData(data) {
    if (!data.customerName) {
        utils.showModal('请输入您的姓名。', 'error');
        return false;
    }
    
    if (!utils.validatePhone(data.customerPhone)) {
        utils.showModal('请输入正确的手机号码。', 'error');
        return false;
    }
    
    if (data.customerEmail && !utils.validateEmail(data.customerEmail)) {
        utils.showModal('请输入正确的邮箱地址。', 'error');
        return false;
    }
    
    if (!data.serviceId) {
        utils.showModal('请选择服务项目。', 'error');
        return false;
    }
    
    if (!data.bookingDate) {
        utils.showModal('请选择预约日期。', 'error');
        return false;
    }
    
    if (!data.bookingTime) {
        utils.showModal('请选择预约时间。', 'error');
        return false;
    }
    
    // 检查日期不能是过去的日期
    const selectedDate = new Date(data.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        utils.showModal('预约日期不能是过去的日期。', 'error');
        return false;
    }
    
    return true;
}

// 检查时间段可用性
async function checkTimeSlotAvailability(date, time) {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('id')
            .eq('booking_date', date)
            .eq('booking_time', time)
            .in('status', ['pending', 'confirmed']);
            
        if (error) {
            console.error('检查时间段可用性失败:', error);
            return false;
        }
        
        return data.length === 0;
        
    } catch (error) {
        console.error('检查时间段可用性时出错:', error);
        return false;
    }
}

// 创建或获取用户
async function createOrGetUser(userData) {
    try {
        // 先尝试根据手机号查找现有用户
        let { data: existingUser, error: queryError } = await supabase
            .from('users')
            .select('id')
            .eq('phone', userData.phone)
            .single();
            
        if (queryError && queryError.code !== 'PGRST116') {
            // PGRST116 是"没有找到记录"的错误代码，其他错误需要处理
            console.error('查询用户失败:', queryError);
            return null;
        }
        
        if (existingUser) {
            // 用户已存在，更新用户信息
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    name: userData.name,
                    email: userData.email
                })
                .eq('id', existingUser.id);
                
            if (updateError) {
                console.error('更新用户信息失败:', updateError);
                return null;
            }
            
            return existingUser.id;
        } else {
            // 创建新用户
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert({
                    name: userData.name,
                    phone: userData.phone,
                    email: userData.email
                })
                .select('id')
                .single();
                
            if (insertError) {
                console.error('创建用户失败:', insertError);
                return null;
            }
            
            return newUser.id;
        }
        
    } catch (error) {
        console.error('处理用户信息时出错:', error);
        return null;
    }
}