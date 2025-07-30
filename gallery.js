// 作品展示页面功能
document.addEventListener('DOMContentLoaded', function() {
    
    // 绑定筛选按钮事件
    initializeFilters();
    
});

// 初始化筛选功能
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // 更新按钮状态
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 筛选作品
            filterGalleryItems(galleryItems, category);
        });
    });
}

// 筛选作品项目
function filterGalleryItems(items, category) {
    items.forEach(item => {
        if (category === 'all' || item.getAttribute('data-category') === category) {
            item.style.display = 'block';
            // 添加动画效果
            item.style.opacity = '0';
            setTimeout(() => {
                item.style.opacity = '1';
            }, 100);
        } else {
            item.style.display = 'none';
        }
    });
}