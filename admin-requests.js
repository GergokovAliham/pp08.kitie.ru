// Модуль управления заявками в админ-панели
class AdminRequests {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalPages = 1;
        this.currentRequests = [];
        this.currentFilters = {
            status: 'all',
            category: 'all',
            date: 'all',
            search: ''
        };
        
        this.init();
    }
    
    init() {
        this.checkAdminAuth();
        this.loadRequests();
        this.initEventListeners();
        this.updateDateTime();
        this.updateStats();
        
        // Обновляем время каждую минуту
        setInterval(() => this.updateDateTime(), 60000);
    }
    
    // Проверка авторизации администратора
    checkAdminAuth() {
        const currentUser = JSON.parse(localStorage.getItem('softbuy_currentUser'));
        
        if (!currentUser || currentUser.role !== 'admin') {
            alert('Доступ запрещен. Требуются права администратора.');
            window.location.href = 'login.html';
            return false;
        }
        
        // Обновляем имя администратора в шапке
        document.getElementById('adminUserName').textContent = currentUser.firstName;
        
        return true;
    }
    
    // Загрузка заявок из localStorage
    loadRequests() {
        const requests = JSON.parse(localStorage.getItem('softbuy_requests') || '[]');
        const users = JSON.parse(localStorage.getItem('softbuy_users') || '[]');
        
        // Обогащаем заявки данными пользователей
        this.currentRequests = requests.map(request => {
            const user = users.find(u => u.id === request.userId) || {
                firstName: 'Неизвестный',
                lastName: 'Пользователь',
                email: 'Не указан'
            };
            
            return {
                ...request,
                userName: `${user.firstName} ${user.lastName}`,
                userEmail: user.email || 'Не указан'
            };
        });
        
        // Сортируем по дате (новые сначала)
        this.currentRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        this.applyFilters();
        this.renderRequests();
        this.updatePagination();
        this.updateStats();
    }
    
    // Применение фильтров
    applyFilters() {
        let filtered = [...this.currentRequests];
        
        // Фильтр по статусу
        if (this.currentFilters.status !== 'all') {
            filtered = filtered.filter(request => request.status === this.currentFilters.status);
        }
        
        // Фильтр по категории
        if (this.currentFilters.category !== 'all') {
            filtered = filtered.filter(request => request.category === this.currentFilters.category);
        }
        
        // Фильтр по дате
        if (this.currentFilters.date !== 'all') {
            const now = new Date();
            let startDate;
            
            switch(this.currentFilters.date) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                    break;
            }
            
            if (startDate) {
                filtered = filtered.filter(request => new Date(request.createdAt) >= startDate);
            }
        }
        
        // Фильтр по поиску
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            filtered = filtered.filter(request => 
                request.title.toLowerCase().includes(searchTerm) ||
                request.description.toLowerCase().includes(searchTerm) ||
                request.userName.toLowerCase().includes(searchTerm) ||
                request.userEmail.toLowerCase().includes(searchTerm)
            );
        }
        
        this.filteredRequests = filtered;
        this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
        
        // Корректируем текущую страницу, если она больше общего количества страниц
        if (this.currentPage > this.totalPages) {
            this.currentPage = Math.max(1, this.totalPages);
        }
    }
    
    // Отображение заявок в таблице
    renderRequests() {
        const tableBody = document.getElementById('requestsTableBody');
        const noRequestsMessage = document.getElementById('noRequestsMessage');
        
        if (!this.filteredRequests || this.filteredRequests.length === 0) {
            tableBody.innerHTML = '';
            noRequestsMessage.style.display = 'block';
            return;
        }
        
        noRequestsMessage.style.display = 'none';
        
        // Вычисляем индекс начала и конца для текущей страницы
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredRequests.length);
        const pageRequests = this.filteredRequests.slice(startIndex, endIndex);
        
        let html = '';
        
        pageRequests.forEach(request => {
            const statusClass = this.getStatusClass(request.status);
            const statusText = this.getStatusText(request.status);
            const createdAt = new Date(request.createdAt).toLocaleString('ru-RU');
            
            html += `
                <tr data-id="${request.id}">
                    <td class="request-id">#${request.id.toString().padStart(3, '0')}</td>
                    <td class="request-user">
                        <div class="user-avatar-sm">
                            <i class="fas fa-user"></i>
                        </div>
                        <div>
                            <div>${request.userName}</div>
                            <small style="color: var(--gray-color);">${request.userEmail}</small>
                        </div>
                    </td>
                    <td>${request.title}</td>
                    <td>${this.getCategoryText(request.category)}</td>
                    <td>${createdAt}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <div class="request-actions">
                            <button class="btn-sm btn-view" onclick="adminRequests.viewRequest(${request.id})" title="Просмотр">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${request.status === 'new' ? `
                                <button class="btn-sm btn-solve" onclick="adminRequests.solveRequest(${request.id})" title="Решить">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="btn-sm btn-reject" onclick="adminRequests.openRejectModal(${request.id})" title="Отклонить">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                            <button class="btn-sm btn-delete" onclick="adminRequests.openDeleteModal(${request.id})" title="Удалить">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = html;
    }
    
    // Обновление пагинации
    updatePagination() {
        const pagination = document.getElementById('pagination');
        
        if (this.totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let html = '';
        
        // Кнопка "Назад"
        if (this.currentPage > 1) {
            html += `<button class="page-btn" onclick="adminRequests.goToPage(${this.currentPage - 1})">
                        <i class="fas fa-chevron-left"></i>
                     </button>`;
        }
        
        // Номера страниц
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, startPage + 4);
        
        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                             onclick="adminRequests.goToPage(${i})">${i}</button>`;
        }
        
        // Кнопка "Вперед"
        if (this.currentPage < this.totalPages) {
            html += `<button class="page-btn" onclick="adminRequests.goToPage(${this.currentPage + 1})">
                        <i class="fas fa-chevron-right"></i>
                     </button>`;
        }
        
        pagination.innerHTML = html;
    }
    
    // Переход на страницу
    goToPage(page) {
        if (page < 1 || page > this.totalPages) return;
        
        this.currentPage = page;
        this.renderRequests();
        this.updatePagination();
        
        // Прокрутка к началу таблицы
        document.querySelector('.table-container').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
    
    // Обновление статистики
    updateStats() {
        const requests = JSON.parse(localStorage.getItem('softbuy_requests') || '[]');
        
        const newCount = requests.filter(r => r.status === 'new').length;
        const solvedCount = requests.filter(r => r.status === 'solved').length;
        const rejectedCount = requests.filter(r => r.status === 'rejected').length;
        const totalCount = requests.length;
        
        // Обновляем счетчики
        document.getElementById('newRequestsCount').textContent = newCount;
        document.getElementById('solvedRequestsCount').textContent = solvedCount;
        document.getElementById('rejectedRequestsCount').textContent = rejectedCount;
        document.getElementById('totalRequestsCount').textContent = totalCount;
        
        // Обновляем бейджи в меню
        document.getElementById('newRequestsBadge').textContent = newCount;
        
        // Счетчик пользователей
        const users = JSON.parse(localStorage.getItem('softbuy_users') || '[]');
        document.getElementById('usersCountBadge').textContent = users.length;
    }
    
    // Инициализация обработчиков событий
    initEventListeners() {
        // Фильтры
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.currentFilters.status = e.target.value;
            this.currentPage = 1;
            this.loadRequests();
        });
        
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.currentFilters.category = e.target.value;
            this.currentPage = 1;
            this.loadRequests();
        });
        
        document.getElementById('dateFilter').addEventListener('change', (e) => {
            this.currentFilters.date = e.target.value;
            this.currentPage = 1;
            this.loadRequests();
        });
        
        // Поиск
        const searchInput = document.getElementById('requestSearch');
        const searchButton = document.getElementById('searchButton');
        
        searchButton.addEventListener('click', () => {
            this.currentFilters.search = searchInput.value;
            this.currentPage = 1;
            this.loadRequests();
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.currentFilters.search = searchInput.value;
                this.currentPage = 1;
                this.loadRequests();
            }
        });
        
        // Выход из админ-панели
        document.getElementById('adminLogout').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
        
        // Форма отклонения заявки
        document.getElementById('rejectRequestForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.rejectRequest();
        });
        
        // Подтверждение удаления
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            this.deleteRequest();
        });
        
        // Кнопки в модальном окне просмотра
        document.getElementById('modalSolveBtn').addEventListener('click', () => {
            const requestId = document.getElementById('modalRequestId').textContent;
            this.solveRequest(parseInt(requestId.replace('#', '')));
        });
        
        document.getElementById('modalRejectBtn').addEventListener('click', () => {
            const requestId = document.getElementById('modalRequestId').textContent;
            this.openRejectModal(parseInt(requestId.replace('#', '')));
        });
        
        document.getElementById('modalDeleteBtn').addEventListener('click', () => {
            const requestId = document.getElementById('modalRequestId').textContent;
            this.openDeleteModal(parseInt(requestId.replace('#', '')));
        });
    }
    
    // Обновление даты и времени
    updateDateTime() {
        const now = new Date();
        const dateTimeString = now.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        document.getElementById('currentDateTime').textContent = dateTimeString;
    }
    
    // Просмотр заявки
    viewRequest(requestId) {
        const request = this.currentRequests.find(r => r.id === requestId);
        if (!request) return;
        
        // Заполняем модальное окно данными
        document.getElementById('modalRequestId').textContent = request.id.toString().padStart(3, '0');
        document.getElementById('modalUserName').textContent = request.userName;
        document.getElementById('modalUserEmail').textContent = request.userEmail;
        document.getElementById('modalRequestTitle').textContent = request.title;
        document.getElementById('modalRequestCategory').textContent = this.getCategoryText(request.category);
        document.getElementById('modalRequestDate').textContent = new Date(request.createdAt).toLocaleString('ru-RU');
        document.getElementById('modalRequestDescription').textContent = request.description;
        
        // Статус
        const statusElement = document.getElementById('modalRequestStatus');
        statusElement.textContent = this.getStatusText(request.status);
        statusElement.className = `status-badge ${this.getStatusClass(request.status)}`;
        
        // Причина отказа (если есть)
        const rejectionReasonElement = document.getElementById('modalRejectionReason');
        const reasonTextElement = document.getElementById('modalReasonText');
        
        if (request.status === 'rejected' && request.rejectionReason) {
            rejectionReasonElement.style.display = 'flex';
            reasonTextElement.textContent = request.rejectionReason;
        } else {
            rejectionReasonElement.style.display = 'none';
        }
        
        // Показываем/скрываем кнопки в зависимости от статуса
        const solveBtn = document.getElementById('modalSolveBtn');
        const rejectBtn = document.getElementById('modalRejectBtn');
        
        if (request.status === 'new') {
            solveBtn.style.display = 'inline-flex';
            rejectBtn.style.display = 'inline-flex';
        } else {
            solveBtn.style.display = 'none';
            rejectBtn.style.display = 'none';
        }
        
        // Открываем модальное окно
        this.openModal('viewRequestModal');
    }
    
    // Решение заявки (отметить как решенную)
    solveRequest(requestId) {
        if (!confirm('Отметить заявку как решенную?')) return;
        
        const requests = JSON.parse(localStorage.getItem('softbuy_requests') || '[]');
        const requestIndex = requests.findIndex(r => r.id === requestId);
        
        if (requestIndex !== -1) {
            requests[requestIndex].status = 'solved';
            requests[requestIndex].solvedAt = new Date().toISOString();
            localStorage.setItem('softbuy_requests', JSON.stringify(requests));
            
            this.showSuccess('Заявка успешно отмечена как решенная');
            this.loadRequests();
            this.closeModal('viewRequestModal');
        }
    }
    
    // Открытие модального окна для отклонения
    openRejectModal(requestId) {
        document.getElementById('rejectRequestId').value = requestId;
        this.openModal('rejectRequestModal');
    }
    
    // Отклонение заявки
    rejectRequest() {
        const requestId = parseInt(document.getElementById('rejectRequestId').value);
        const reason = document.getElementById('rejectionReason').value.trim();
        
        if (!reason) {
            document.getElementById('rejectionReasonError').textContent = 'Укажите причину отказа';
            document.getElementById('rejectionReasonError').classList.add('show');
            return;
        }
        
        const requests = JSON.parse(localStorage.getItem('softbuy_requests') || '[]');
        const requestIndex = requests.findIndex(r => r.id === requestId);
        
        if (requestIndex !== -1) {
            requests[requestIndex].status = 'rejected';
            requests[requestIndex].rejectionReason = reason;
            requests[requestIndex].rejectedAt = new Date().toISOString();
            localStorage.setItem('softbuy_requests', JSON.stringify(requests));
            
            this.showSuccess('Заявка успешно отклонена');
            this.loadRequests();
            this.closeModal('rejectRequestModal');
            this.closeModal('viewRequestModal');
            
            // Очищаем форму
            document.getElementById('rejectionReason').value = '';
            document.getElementById('rejectionReasonError').classList.remove('show');
        }
    }
    
    // Открытие модального окна для удаления
    openDeleteModal(requestId) {
        const request = this.currentRequests.find(r => r.id === requestId);
        if (!request) return;
        
        document.getElementById('deleteRequestTitle').textContent = `#${request.id.toString().padStart(3, '0')} - ${request.title}`;
        document.getElementById('confirmDeleteBtn').dataset.id = requestId;
        
        this.openModal('deleteRequestModal');
    }
    
    // Удаление заявки
    deleteRequest() {
        const requestId = parseInt(document.getElementById('confirmDeleteBtn').dataset.id);
        
        const requests = JSON.parse(localStorage.getItem('softbuy_requests') || '[]');
        const filteredRequests = requests.filter(r => r.id !== requestId);
        
        localStorage.setItem('softbuy_requests', JSON.stringify(filteredRequests));
        
        this.showSuccess('Заявка успешно удалена');
        this.loadRequests();
        this.closeModal('deleteRequestModal');
        this.closeModal('viewRequestModal');
    }
    
    // Выход из системы
    logout() {
        localStorage.removeItem('softbuy_currentUser');
        window.location.href = 'index.html';
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
            'installation': 'Установка',
            'license': 'Лицензия',
            'bug': 'Ошибка',
            'update': 'Обновление',
            'other': 'Другое'
        };
        
        return categories[category] || category;
    }
    
    // Работа с модальными окнами
    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    showSuccess(message) {
        document.getElementById('successMessage').textContent = message;
        this.openModal('successModal');
        
        // Автоматическое закрытие через 3 секунды
        setTimeout(() => {
            this.closeModal('successModal');
        }, 3000);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin-requests.html') || 
        window.location.pathname.includes('admin.html')) {
        window.adminRequests = new AdminRequests();
    }
});