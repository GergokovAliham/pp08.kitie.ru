// Модуль админ-панели
class AdminPanel {
    constructor() {
        this.initAdmin();
        this.loadStats();
        this.initAdminActions();
        this.initAdminLogout();
    }
    
    // Инициализация админ-панели
    initAdmin() {
        // Проверка прав администратора
        const currentUser = JSON.parse(localStorage.getItem('softbuy_currentUser') || '{}');
        
        if (!currentUser || currentUser.role !== 'admin') {
            window.location.href = 'index.html';
            return;
        }
        
        // Обновление информации о пользователе
        this.updateUserInfo();
        
        // Инициализация меню
        this.initAdminMenu();
    }
    
    // Обновление информации о пользователе
    updateUserInfo() {
        const currentUser = JSON.parse(localStorage.getItem('softbuy_currentUser'));
        
        if (currentUser) {
            const userNameElements = document.querySelectorAll('.user-name');
            userNameElements.forEach(el => {
                el.textContent = currentUser.firstName;
            });
        }
    }
    
    // Инициализация меню админ-панели
    initAdminMenu() {
        // Подсветка активного пункта меню
        const currentPath = window.location.pathname;
        const menuLinks = document.querySelectorAll('.admin-nav-list a');
        
        menuLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (currentPath.includes(href)) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Активация текущей страницы в меню
        const pageName = currentPath.split('/').pop() || 'admin.html';
        const activeLink = document.querySelector(`.admin-nav-list a[href*="${pageName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
    
    // Загрузка статистики
    loadStats() {
        // Загрузка пользователей
        const users = JSON.parse(localStorage.getItem('softbuy_users') || '[]');
        document.getElementById('usersCount')?.textContent = users.length;
        
        // Загрузка заявок
        const requests = JSON.parse(localStorage.getItem('softbuy_requests') || '[]');
        const newRequests = requests.filter(r => r.status === 'new');
        document.getElementById('newRequestsCount')?.textContent = newRequests.length;
        
        // Загрузка товаров
        const products = JSON.parse(localStorage.getItem('softbuy_products') || '[]');
        document.getElementById('productsCount')?.textContent = products.length;
        
        // Загрузка заказов
        const orders = JSON.parse(localStorage.getItem('softbuy_orders') || '[]');
        document.getElementById('ordersCount')?.textContent = orders.length;
    }
    
    // Инициализация действий админ-панели
    initAdminActions() {
        // Обработчики кнопок действий
        const actionButtons = document.querySelectorAll('.btn-action');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleAction(e));
        });
        
        // Обработчики быстрых действий
        const quickActions = document.querySelectorAll('.quick-action-btn');
        quickActions.forEach(action => {
            action.addEventListener('click', (e) => this.handleQuickAction(e));
        });
        
        // Форма добавления товара
        const addProductForm = document.getElementById('addProductForm');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => this.handleAddProduct(e));
        }
    }
    
    // Обработка действий
    handleAction(e) {
        const button = e.target.closest('.btn-action');
        const action = button.classList[1]; // btn-edit, btn-delete и т.д.
        const row = button.closest('tr');
        const id = row?.querySelector('td:first-child')?.textContent;
        
        switch(action) {
            case 'btn-edit':
                this.editItem(id);
                break;
            case 'btn-delete':
                this.deleteItem(id);
                break;
            case 'btn-solve':
                this.solveRequest(id);
                break;
            case 'btn-reject':
                this.rejectRequest(id);
                break;
        }
    }
    
    // Обработка быстрых действий
    handleQuickAction(e) {
        const action = e.target.closest('.quick-action-btn');
        const text = action.querySelector('span').textContent;
        
        switch(text) {
            case 'Добавить товар':
                this.openModal('add-product-modal');
                break;
            case 'Добавить новость':
                this.openModal('add-news-modal');
                break;
            case 'Добавить категорию':
                this.openModal('add-category-modal');
                break;
            case 'Настройки сайта':
                window.location.href = '#settings';
                break;
            case 'Экспорт данных':
                this.exportData();
                break;
            case 'Очистить кэш':
                this.clearCache();
                break;
        }
    }
    
    // Редактирование элемента
    editItem(id) {
        // В реальном приложении здесь была бы загрузка данных и открытие формы редактирования
        alert(`Редактирование элемента #${id}`);
    }
    
    // Удаление элемента
    deleteItem(id) {
        if (confirm(`Вы уверены, что хотите удалить элемент #${id}?`)) {
            // В реальном приложении здесь было бы удаление из базы данных
            const row = document.querySelector(`tr:has(td:first-child:contains("#${id}"))`);
            if (row) {
                row.style.opacity = '0.5';
                setTimeout(() => {
                    row.remove();
                    this.showNotification('Элемент успешно удален', 'success');
                }, 300);
            }
        }
    }
    
    // Решение заявки
    solveRequest(id) {
        // Обновление статуса заявки
        const requests = JSON.parse(localStorage.getItem('softbuy_requests') || '[]');
        const requestIndex = requests.findIndex(r => r.id === parseInt(id.replace('#', '')));
        
        if (requestIndex !== -1) {
            requests[requestIndex].status = 'solved';
            requests[requestIndex].solvedAt = new Date().toISOString();
            localStorage.setItem('softbuy_requests', JSON.stringify(requests));
            
            // Обновление интерфейса
            const statusCell = document.querySelector(`tr:has(td:first-child:contains("${id}")) .status-badge`);
            if (statusCell) {
                statusCell.textContent = 'Решена';
                statusCell.className = 'status-badge status-solved';
            }
            
            this.showNotification('Заявка отмечена как решенная', 'success');
        }
    }
    
    // Отклонение заявки
    rejectRequest(id) {
        const reason = prompt('Укажите причину отказа:');
        if (reason) {
            // Обновление статуса заявки
            const requests = JSON.parse(localStorage.getItem('softbuy_requests') || '[]');
            const requestIndex = requests.findIndex(r => r.id === parseInt(id.replace('#', '')));
            
            if (requestIndex !== -1) {
                requests[requestIndex].status = 'rejected';
                requests[requestIndex].rejectedReason = reason;
                requests[requestIndex].rejectedAt = new Date().toISOString();
                localStorage.setItem('softbuy_requests', JSON.stringify(requests));
                
                // Обновление интерфейса
                const statusCell = document.querySelector(`tr:has(td:first-child:contains("${id}")) .status-badge`);
                if (statusCell) {
                    statusCell.textContent = 'Отклонена';
                    statusCell.className = 'status-badge status-rejected';
                }
                
                this.showNotification('Заявка отклонена', 'success');
            }
        }
    }
    
    // Открытие модального окна
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Экспорт данных
    exportData() {
        // Сбор всех данных
        const data = {
            users: JSON.parse(localStorage.getItem('softbuy_users') || '[]'),
            requests: JSON.parse(localStorage.getItem('softbuy_requests') || '[]'),
            products: JSON.parse(localStorage.getItem('softbuy_products') || '[]'),
            orders: JSON.parse(localStorage.getItem('softbuy_orders') || '[]'),
            exportDate: new Date().toISOString()
        };
        
        // Создание файла для скачивания
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `softbuy_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Данные успешно экспортированы', 'success');
    }
    
    // Очистка кэша
    clearCache() {
        if (confirm('Очистить кэш браузера? Это может повлиять на производительность.')) {
            // Очистка локального хранилища (кроме пользователей и настроек)
            const users = localStorage.getItem('softbuy_users');
            const currentUser = localStorage.getItem('softbuy_currentUser');
            
            localStorage.clear();
            
            if (users) localStorage.setItem('softbuy_users', users);
            if (currentUser) localStorage.setItem('softbuy_currentUser', currentUser);
            
            this.showNotification('Кэш успешно очищен', 'success');
            
            // Перезагрузка страницы
            setTimeout(() => {
                location.reload();
            }, 1000);
        }
    }
    
    // Добавление товара
    handleAddProduct(e) {
        e.preventDefault();
        
        const form = e.target;
        const name = form.querySelector('#productName').value;
        const category = form.querySelector('#productCategory').value;
        const price = form.querySelector('#productPrice').value;
        const description = form.querySelector('#productDescription').value;
        
        if (!name || !category || !price) {
            this.showNotification('Заполните все обязательные поля', 'error');
            return;
        }
        
        // Сохранение товара
        const products = JSON.parse(localStorage.getItem('softbuy_products') || '[]');
        const newProduct = {
            id: Date.now(),
            name,
            category,
            price: parseFloat(price),
            description,
            createdAt: new Date().toISOString(),
            active: true
        };
        
        products.push(newProduct);
        localStorage.setItem('softbuy_products', JSON.stringify(products));
        
        // Закрытие модального окна
        const modal = form.closest('.modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        
        // Очистка формы
        form.reset();
        
        this.showNotification('Товар успешно добавлен', 'success');
        
        // Обновление статистики
        setTimeout(() => {
            this.loadStats();
        }, 500);
    }
    
    // Инициализация выхода
    initAdminLogout() {
        const logoutBtn = document.getElementById('adminLogout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }
    
    // Выход из админ-панели
    logout() {
        localStorage.removeItem('softbuy_currentUser');
        window.location.href = 'index.html';
    }
    
    // Показать уведомление
    showNotification(message, type = 'info') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `admin-notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // Стили
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Кнопка закрытия
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Автоматическое закрытие
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
        
        // Добавляем анимации
        if (!document.querySelector('#notification-animations')) {
            const style = document.createElement('style');
            style.id = 'notification-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Инициализация админ-панели при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, находимся ли мы на странице админ-панели
    if (window.location.pathname.includes('admin') || 
        document.querySelector('.admin-page')) {
        const adminPanel = new AdminPanel();
        window.AdminPanel = adminPanel;
    }
});