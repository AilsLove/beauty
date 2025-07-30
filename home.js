// 首页功能
document.addEventListener('DOMContentLoaded', function() {
    
    // 加载服务项目
    loadServicesForHome();
    
});

// 为首页加载服务项目
async function loadServicesForHome() {
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
        
        // 显示快速预约选项
        displayQuickBooking(services);
        
        // 显示服务项目网格（首页概览版本）
        displayServicesGridHome(services);
        
    } catch (error) {
        console.error('加载服务项目时出错:', error);
    }
}

// 显示快速预约选项
function displayQuickBooking(services) {
    const quickBookingGrid = document.getElementById('quickBookingGrid');
    if (!quickBookingGrid) return;
    
    quickBookingGrid.innerHTML = '';
    
    // 只显示前4个热门服务
    const popularServices = services.slice(0, 4);
    
    popularServices.forEach(service => {
        const quickCard = document.createElement('div');
        quickCard.className = 'quick-booking-card';
        quickCard.innerHTML = `
            <h3>${service.name}</h3>
            <p>${service.description}</p>
            <div class="price">¥${service.price}</div>
            <div class="duration">${service.duration}分钟</div>
        `;
        
        // 点击跳转到预约页面
        quickCard.addEventListener('click', function() {
            window.location.href = `booking.html?service=${service.id}`;
        });
        
        quickBookingGrid.appendChild(quickCard);
    });
}

// 显示服务项目网格（首页版本）
function displayServicesGridHome(services) {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) return;
    
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