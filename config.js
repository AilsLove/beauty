// Supabase 配置
const SUPABASE_URL = 'https://qhxveclethvqlsuuetre.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoeHZlY2xldGh2cWxzdXVldHJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NTIzNTgsImV4cCI6MjA2OTIyODM1OH0.tUAVb5crHJ4-GEVwsONnfJKLV892-qeC4rvcOPD6kA4';

// 初始化 Supabase 客户端
const { createClient } = window.supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 为了保持代码一致性，我们仍然使用 supabase 变量名
const supabase = supabaseClient;

// 通用工具函数
const utils = {
    // 显示模态框消息
    showModal: function(message, type = 'success') {
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
    },
    
    // 格式化日期
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN');
    },
    
    // 格式化时间
    formatTime: function(timeString) {
        return timeString.substring(0, 5); // 只显示小时:分钟
    },
    
    // 获取状态显示文本
    getStatusText: function(status) {
        const statusMap = {
            'pending': '待确认',
            'confirmed': '已确认', 
            'completed': '已完成',
            'cancelled': '已取消'
        };
        return statusMap[status] || status;
    },
    
    // 验证手机号
    validatePhone: function(phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone);
    },
    
    // 验证邮箱
    validateEmail: function(email) {
        if (!email) return true; // 邮箱是可选的
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
};