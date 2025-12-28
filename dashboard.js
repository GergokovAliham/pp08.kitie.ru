// Модуль личного кабинета
class UserDashboard {
    constructor() {
        this.init();
    }
    
    init() {
        this.checkAuth();
        this.loadUserInfo();
        this.loadUserRequests();
        this.initEventListeners();
    }
    
    // Проверка авторизации
    checkAuth() {
        const currentUser = JSON.parse(localStorage.getItem('softbuy_currentUser'));
        
        if (!currentUser) {
            window.location.href = 'login.html';
            return false;
        }
        
        this.currentUser = currentUser;
        return true;
    }
    
    // Загрузка информации о пользователе
    loadUserInfo() {
        document.getElementById('userNameLarge').textContent = 
            `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        
        document.getElementById('userEmailLarge').textContent = 
            this.currentUser.email || 'Email не указан';
        
        // Загрузка статистики
        const requests = JSON.parse(localStorage.getItem('softbuy_requests') || '[]');
        const userRequests = requests.filter(r => r.userId === this.currentUser.id);
        
        document.getElementById('totalRequestsStat').textContent = userRequests.length;
        document.getElementById('solvedRequestsStat').textContent = 
            userRequests.filter(r => r.status === 'solved').length;
        document.getElementById('newRequestsStat').textContent = 
            userRequests.filter(r => r.status === 'new').length;
    }
    
    // Загрузка заявок пользователя
    loadUserRequests() {
        const requests = JSON.parse(localStorage.getItem('softbuy_requests') || '[]');
        const userRequests = requests.filter(r => r.userId === this.currentUser.id);
        
        const filterValue = document.getElementById('userRequestsFilter').value;
        let filteredRequests = [...userRequests];
        
        if (filterValue !== 'all') {
            filteredRequests = userRequests.filter(r => r.status === filterValue);
        }
        
        // Сортируем по дате (новые сначала)
        filteredRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        this.renderUserRequests(filteredRequests);
    }
    
    // Отображение заявок пользователя
    renderUserRequests(requests) {
        const tableBody = document.getElementById('userRequestsTableBody');
        const noRequestsMessage = document.getElementById('noUserRequests');
        
        if (!requests || requests.length === 0) {
            tableBody.innerHTML = '';
            noRequestsMessage.style.display = 'block';
            return;
        }
        
        noRequestsMessage.style.display = 'none';
        
        let html = '';
        
        requests.forEach(request => {
            const statusClass = this.getStatusClass(request.status);
            const statusText = this.getStatusText(request.status);
            const createdAt = new Date(request.createdAt).toLocaleString('ru-RU');
            const categoryText = this.getCategoryText(request.category);
            
            html += `
                <tr data-id="${request.id}">
                    <td class="request-id">#${request.id.toString().padStart(3, '0')}</td>
                    <td>${request.title}</td>
                    <td>${categoryText}</td>
                    <td>${createdAt}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <div class="request-actions">
                            <button class="btn-sm btn-view" onclick="userDashboard.viewRequest(${request.id})" title="Просмотр">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${request.status === 'new' ? `
                                <button class="btn-sm btn-delete" onclick="userDashboard.deleteRequest(${request.id})" title="Удалить">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = html;
    }
    
    // Просмотр заявки
    viewRequest(requestId) {
        const requests = JSON.parse(localStorage.getItem('softbuy_requests') || '[]');
        const request = requests.find(r => r.id === requestId);
        
        if (!request || request.userId !== this.currentUser.id) {
            showAlert('Заявка не найдена', 'error');
            return;
        }
        
        // Создаем модальное окно для просмотра
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">Заявка #${request.id.toString().padStart(3, '0')}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="request-details">
                <div class="detail-row">
                    <span class="detail-label">Тема:</span>
                    <span class="detail-value">${request.title}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Категория:</span>
                    <span class="detail-value">${this.getCategoryText(request.category)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Дата создания:</span>
                    <span class="detail-value">${new Date(request.createdAt).toLocaleString('ru-RU')}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Статус:</span>
                    <span class="detail-value">
                        <span class="status-badge ${this.getStatusClass(request.status)}">
                            ${this.getStatusText(request.status)}
                        </span>
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Описание:</span>
                    <span class="detail-value">${request.description}</span>
                </div>
                ${request.status === 'rejected' && request.rejectionReason ? `
                    <div class="detail-row">
                        <span class="detail-label">Причина отказа:</span>
                        <span class="detail-value">${request.rejectionReason}</span>
                    </div>
                ` : ''}
                ${request.solvedAt ? `
                    <div class="detail-row">
                        <span class="detail-label">Дата решения:</span>
                        <span class="detail-value">${new Date(request.solvedAt).toLocaleString('ru-RU')}</span>
                    </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-cancel modal-close">Закрыть</button>
                ${request.status === 'new' ? `
                    <button type="button" class="btn-submit" onclick="userDashboard.deleteRequest(${request.id})">
                        <i class="fas fa-trash"></i> Удалить заявку
                    </button>
                ` : ''}
            </div>
        `;
        
        // Создаем модальное окно
        this.createModal(modalContent);
    }
    
    // Удаление заявки
    deleteRequest(requestId) {
        if (!confirm('Вы уверены, что хотите удалить эту заявку?')) return;
        
        if (window.deleteUserRequest && deleteUserRequest(requestId)) {
            showAlert('Заявка успешно удалена', 'success');
            this.loadUserRequests();
            this.loadUserInfo();
            
            // Закрываем все модальные окна
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
            document.body.style.overflow = 'auto';
        }
    }
    
    // Инициализация обработчиков событий
    initEventListeners() {
        // Фильтр заявок
        document.getElementById('userRequestsFilter').addEventListener('change', () => {
            this.loadUserRequests();
        });
        
        // Форма создания заявки
        const createRequestForm = document.getElementById('createRequestForm');
        if (createRequestForm) {
            createRequestForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createRequest();
            });
        }
        
        // Кнопка выхода
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }
    
    // Создание новой заявки
    createRequest() {
        const title = document.getElementById('requestTitle').value.trim();
        const category = document.getElementById('requestCategory').value;
        const description = document.getElementById('requestDescription').value.trim();
        
        // Валидация
        let isValid = true;
        
        if (!title) {
            document.getElementById('requestTitleError').textContent = 'Введите тему заявки';
            document.getElementById('requestTitleError').classList.add('show');
            isValid = false;
        } else {
            document.getElementById('requestTitleError').classList.remove('show');
        }
        
        if (!category) {
            document.getElementById('requestCategoryError').textContent = 'Выберите категорию';
            document.getElementById('requestCategoryError').classList.add('show');
            isValid = false;
        } else {
            document.getElementById('requestCategoryError').classList.remove('show');
        }
        
        if (!description) {
            document.getElementById('requestDescriptionError').textContent = 'Введите описание проблемы';
            document.getElementById('requestDescriptionError').classList.add('show');
            isValid = false;
        } else {
            document.getElementById('requestDescriptionError').classList.remove('show');
        }
        
        if (!isValid) return;
        
        // Используем функцию из script.js
        if (window.createRequest) {
            const newRequest = createRequest(title, description, category);
            
            if (newRequest) {
                showAlert('Заявка успешно создана!', 'success');
                
                // Закрываем модальное окно и очищаем форму
                document.getElementById('create-request-modal').classList.remove('active');
                document.body.style.overflow = 'auto';
                document.getElementById('createRequestForm').reset();
                
                // Обновляем список заявок
                this.loadUserRequests();
                this.loadUserInfo();
            }
        }
    }
    
    // Выход из системы
    logout() {
        localStorage.removeItem('softbuy_currentUser');
        window.location.href = 'index.html';
    }
    
    // Создание модального окна
    createModal(content) {
        // Удаляем старые модальные окна
        const oldModal = document.getElementById('customModal');
        if (oldModal) oldModal.remove();
        
        // Создаем новое модальное окно
        const modal = document.createElement('div');
        modal.id = 'customModal';
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                ${content}
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Обработчик закрытия
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            setTimeout(() => modal.remove(), 300);
        });
        
        // Закрытие при клике вне контента
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
                setTimeout(() => modal.remove(), 300);
            }
        });
    }
    
    // Вспомогательные методы
    getStatusClass(status) {
        switch(status) {
            case 'new': return 'status-new';
            case 'solved': return 'status-solved';
            case 'rejected': return 'status-rejected';
            default: return 'status-pending';
        }
    }
    
    getStatusText(status) {
        switch(status) {
            case 'new': return 'Новая';
            case 'solved': return 'Решена';
            case 'rejected': return 'Отклонена';
            default: return 'В обработке';
        }
    }
    
    getCategoryText(category) {
        const categories = {
            'installation': 'Установка ПО',
            'license': 'Проблемы с лицензией',
            'bug': 'Ошибка в программе',
            'update': 'Обновление',
            'other': 'Другое'
        };
        
        return categories[category] || category;
    }
}

// Инициализация личного кабинета
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard.html')) {
        window.userDashboard = new UserDashboard();
    }
});