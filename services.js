// 服务页面功能
document.addEventListener('DOMContentLoaded', function() {
    
    // 加载服务项目详情
    loadServicesDetail();
    
});

// 加载服务项目详情
async function loadServicesDetail() {
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
        
        // 显示详细服务项目
        displayServicesDetail(services);
        
    } catch (error) {
        console.error('加载服务项目时出错:', error);
    }
}

// 显示详细服务项目
function displayServicesDetail(services) {
    const servicesGrid = document.getElementById('servicesDetailGrid');
    if (!servicesGrid) return;
    
    servicesGrid.innerHTML = '';
    
    services.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-detail-card';
        serviceCard.innerHTML = `
            <div class="service-image">
                <div class="image-placeholder">
                    <span>💆‍♀️</span>
                </div>
            </div>
            <div class="service-content">
                <h3>${service.name}</h3>
                <p>${service.description || '专业的美容护理服务'}</p>
                <div class="service-details">
                    <div class="detail-item">
                        <span class="label">服务时长：</span>
                        <span class="value">${service.duration} 分钟</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">服务价格：</span>
                        <span class="value price">¥${service.price}</span>
                    </div>
                </div>
                <div class="service-benefits">
                    <h4>服务特色：</h4>
                    <ul>
                        ${getServiceBenefits(service.name)}
                    </ul>
                </div>
                <div class="service-actions">
                    <a href="booking.html?service=${service.id}" class="btn btn-primary">立即预约</a>
                    <button class="btn btn-secondary" onclick="showServiceModal('${service.id}')">了解详情</button>
                </div>
            </div>
        `;
        servicesGrid.appendChild(serviceCard);
    });
}

// 根据服务名称获取服务特色
function getServiceBenefits(serviceName) {
    const benefits = {
        '面部护理': [
            '深度清洁毛孔',
            '补水保湿',
            '改善肌肤质地',
            '提升肌肤光泽'
        ],
        '美甲服务': [
            '专业甲型修整',
            '创意彩绘设计',
            '指甲护理保养',
            '持久不脱落'
        ],
        '睫毛嫁接': [
            '自然根根分明',
            'D卷完美弧度',
            '防水不易脱落',
            '持续4-6周'
        ],
        '眉毛造型': [
            '根据脸型设计',
            '自然逼真效果',
            '专业修眉技术',
            '持久定型'
        ],
        '身体护理': [
            '全身肌肉放松',
            '改善血液循环',
            '滋润肌肤',
            '缓解疲劳压力'
        ],
        '头发护理': [
            '深层清洁头皮',
            '营养修复发质',
            '专业造型设计',
            '健康光泽秀发'
        ]
    };
    
    const serviceType = Object.keys(benefits).find(key => serviceName.includes(key)) || serviceName;
    const serviceBenefits = benefits[serviceType] || ['专业护理服务', '优质产品使用', '个性化方案', '贴心服务体验'];
    
    return serviceBenefits.map(benefit => `<li>${benefit}</li>`).join('');
}

// 显示服务详情模态框
function showServiceModal(serviceId) {
    // 这里可以实现一个详细的服务介绍模态框
    alert('服务详情功能开发中，请直接预约或联系我们咨询！');
}