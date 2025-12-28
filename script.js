// Основной JavaScript файл
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация меню
    initMenu();
    
    // Инициализация счетчика посетителей
    initVisitorCounter();
    
    // Инициализация анимаций
    initAnimations();
    
    // Инициализация модальных окон
    initModals();
    
    // Инициализация фильтров каталога
    initCatalogFilters();
    
    // Инициализация форм
    initForms();
    
    // Обновление меню в зависимости от авторизации
    updateMenuForAuth();
});

// Мобильное меню
function initMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('active');
            this.classList.toggle('active');
            
            // Анимация гамбургера в крестик
            const spans = this.querySelectorAll('span');
            if (sidebar.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
        
        // Закрытие меню при клике вне его
        document.addEventListener('click', function(event) {
            if (sidebar.classList.contains('active') && 
                !sidebar.contains(event.target) && 
                !menuToggle.contains(event.target)) {
                closeMobileMenu();
            }
        });
        
        // Закрытие меню при клике на ссылку
        sidebar.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                closeMobileMenu();
            }
        });
    }
}

function closeMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle && sidebar) {
        sidebar.classList.remove('active');
        menuToggle.classList.remove('active');
        
        const spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
}

// Счетчик посетителей
function initVisitorCounter() {
    const counterElement = document.getElementById('visitorCount');
    if (!counterElement) return;
    
    let count = parseInt(counterElement.textContent) || 1247;
    
    // Имитация обновления счетчика
    setInterval(() => {
        const change = Math.floor(Math.random() * 16) - 5;
        count = Math.max(count + change, 1200);
        
        // Анимация
        counterElement.style.animation = 'none';
        counterElement.offsetHeight;
        counterElement.style.animation = 'countUp 0.5s ease';
        
        counterElement.textContent = count;
    }, 5000);
}

// Анимации
function initAnimations() {
    // Анимация при скролле
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Наблюдаем за карточками
    document.querySelectorAll('.software-card, .news-card, .category-card').forEach(el => {
        observer.observe(el);
    });
}

// Модальные окна
function initModals() {
    const modals = document.querySelectorAll('.modal');
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const modalCloses = document.querySelectorAll('.modal-close, .btn-cancel');
    
    // Открытие
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    // Закрытие
    modalCloses.forEach(close => {
        close.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal);
            }
        });
    });
    
    // Закрытие при клике вне
    modals.forEach(modal => {
        modal.addEventListener('click', function(event) {
            if (event.target === this) {
                closeModal(this);
            }
        });
    });
    
    // Закрытие на ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            modals.forEach(modal => {
                if (modal.classList.contains('active')) {
                    closeModal(modal);
                }
            });
        }
    });
    
    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        const form = modal.querySelector('form');
        if (form) form.reset();
        
        const errors = modal.querySelectorAll('.error-message');
        errors.forEach(error => error.classList.remove('show'));
        
        const errorInputs = modal.querySelectorAll('.form-control.error');
        errorInputs.forEach(input => input.classList.remove('error'));
    }
}

// Фильтры каталога
function initCatalogFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const softwareCards = document.querySelectorAll('.software-card');
    
    if (!categoryFilter && !sortFilter && !searchInput) return;
    
    function filterCatalog() {
        const category = categoryFilter ? categoryFilter.value : '';
        const sort = sortFilter ? sortFilter.value : 'popular';
        const search = searchInput ? searchInput.value.toLowerCase() : '';
        
        let filtered = Array.from(softwareCards);
        
        // Фильтрация по категории
        if (category) {
            filtered = filtered.filter(card => card.dataset.category === category);
        }
        
        // Фильтрация по поиску
        if (search) {
            filtered = filtered.filter(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const description = card.querySelector('.software-description').textContent.toLowerCase();
                return title.includes(search) || description.includes(search);
            });
        }
        
        // Сортировка
        switch(sort) {
            case 'price_asc':
                filtered.sort((a, b) => parseFloat(a.dataset.price) - parseFloat(b.dataset.price));
                break;
            case 'price_desc':
                filtered.sort((a, b) => parseFloat(b.dataset.price) - parseFloat(a.dataset.price));
                break;
            case 'name':
                filtered.sort((a, b) => {
                    const aName = a.querySelector('h3').textContent;
                    const bName = b.querySelector('h3').textContent;
                    return aName.localeCompare(bName);
                });
                break;
            // По популярности - оставляем как есть
        }
        
        // Показываем/скрываем карточки
        softwareCards.forEach(card => {
            card.style.display = 'none';
        });
        
        filtered.forEach(card => {
            card.style.display = 'block';
        });
        
        // Если нет результатов
        if (filtered.length === 0) {
            showNoResultsMessage();
        } else {
            removeNoResultsMessage();
        }
    }
    
    function showNoResultsMessage() {
        if (document.querySelector('.no-results')) return;
        
        const message = document.createElement('div');
        message.className = 'no-results';
        message.innerHTML = `
            <div style="text-align: center; padding: 50px; color: var(--gray-color);">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <h3>Ничего не найдено</h3>
                <p>Попробуйте изменить параметры поиска</p>
            </div>
        `;
        
        const catalogGrid = document.querySelector('.catalog-grid');
        if (catalogGrid) {
            catalogGrid.parentNode.insertBefore(message, catalogGrid.nextSibling);
        }
    }
    
    function removeNoResultsMessage() {
        const message = document.querySelector('.no-results');
        if (message) {
            message.remove();
        }
    }
    
    // События
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterCatalog);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', filterCatalog);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', filterCatalog);
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', filterCatalog);
    }
}

// Формы
function initForms() {
    // Форма регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
        
        // Валидация в реальном времени
        const inputs = registerForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('blur', validateRegisterField);
        });
        
        // Переключение видимости пароля
        const toggleButtons = registerForm.querySelectorAll('.toggle-password');
        toggleButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetId = this.dataset.target;
                const input = document.getElementById(targetId);
                if (input) {
                    const type = input.type === 'password' ? 'text' : 'password';
                    input.type = type;
                    this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
                }
            });
        });
    }
    
    // Кнопки корзины
    const cartButtons = document.querySelectorAll('.btn-cart');
    cartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.id;
            addToCart(productId);
        });
    });
}

// Валидация регистрации
function validateRegisterField(e) {
    const input = e.target;
    const value = input.value.trim();
    let isValid = true;
    let message = '';
    
    switch(input.id) {
        case 'lastName':
        case 'firstName':
            if (!value) {
                message = 'Поле обязательно для заполнения';
                isValid = false;
            } else if (!/^[а-яА-ЯёЁ\s-]+$/.test(value)) {
                message = 'Только русские буквы, пробелы и дефис';
                isValid = false;
            }
            break;
            
        case 'email':
            if (!value) {
                message = 'Поле обязательно для заполнения';
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                message = 'Введите корректный email';
                isValid = false;
            }
            break;
            
        case 'login':
            if (!value) {
                message = 'Поле обязательно для заполнения';
                isValid = false;
            } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
                message = 'Только латинские буквы, цифры и подчеркивание (3-20 символов)';
                isValid = false;
            }
            break;
            
        case 'password':
            if (!value) {
                message = 'Поле обязательно для заполнения';
                isValid = false;
            } else if (value.length < 6) {
                message = 'Минимум 6 символов';
                isValid = false;
            }
            break;
            
        case 'confirmPassword':
            const password = document.getElementById('password');
            if (!value) {
                message = 'Поле обязательно для заполнения';
                isValid = false;
            } else if (password && value !== password.value) {
                message = 'Пароли не совпадают';
                isValid = false;
            }
            break;
    }
    
    const errorElement = document.getElementById(input.id + 'Error');
    if (errorElement) {
        if (!isValid) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            input.classList.add('error');
        } else {
            errorElement.classList.remove('show');
            input.classList.remove('error');
        }
    }
    
    return isValid;
}

function handleRegisterSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;
    
    // Валидация всех полей
    inputs.forEach(input => {
        const event = new Event('blur');
        input.dispatchEvent(event);
        
        if (input.classList.contains('error')) {
            isValid = false;
        }
    });
    
    // Проверка согласия
    const agreeTerms = document.getElementById('agreeTerms');
    if (agreeTerms && !agreeTerms.checked) {
        const errorElement = document.getElementById('agreeTermsError');
        if (errorElement) {
            errorElement.textContent = 'Необходимо согласие с условиями';
            errorElement.classList.add('show');
            isValid = false;
        }
    }
    
    if (isValid) {
        // Сбор данных формы
        const formData = {
            lastName: document.getElementById('lastName').value.trim(),
            firstName: document.getElementById('firstName').value.trim(),
            middleName: document.getElementById('middleName').value.trim(),
            email: document.getElementById('email').value.trim(),
            login: document.getElementById('login').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            subscribeNews: document.getElementById('subscribeNews').checked
        };
        
        // Сохранение в localStorage (имитация регистрации)
        const users = JSON.parse(localStorage.getItem('softbuy_users') || '[]');
        
        // Проверка уникальности логина
        if (users.some(user => user.login === formData.login)) {
            showAlert('Этот логин уже занят', 'error');
            return;
        }
        
        if (users.some(user => user.email === formData.email)) {
            showAlert('Этот email уже используется', 'error');
            return;
        }
        
        users.push({
            ...formData,
            id: Date.now(),
            role: 'user',
            registrationDate: new Date().toISOString()
        });
        
        localStorage.setItem('softbuy_users', JSON.stringify(users));
        
        showAlert('Регистрация успешна! Теперь вы можете войти в систему.', 'success');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }
}

// Корзина
function addToCart(productId) {
    const cart = JSON.parse(localStorage.getItem('softbuy_cart') || '[]');
    
    // Поиск товара в корзине
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }
    
    localStorage.setItem('softbuy_cart', JSON.stringify(cart));
    
    showAlert('Товар добавлен в корзину!', 'success');
    
    // Анимация кнопки
    event.target.style.transform = 'scale(0.9)';
    setTimeout(() => {
        event.target.style.transform = 'scale(1)';
    }, 200);
}

// Уведомления
function showAlert(message, type = 'info') {
    // Удаляем старые уведомления
    const oldAlerts = document.querySelectorAll('.alert-message');
    oldAlerts.forEach(alert => alert.remove());
    
    // Создаем новое уведомление
    const alert = document.createElement('div');
    alert.className = `alert-message alert-${type}`;
    alert.innerHTML = `
        <span>${message}</span>
        <button class="alert-close">&times;</button>
    `;
    
    // Стили
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(alert);
    
    // Закрытие
    const closeBtn = alert.querySelector('.alert-close');
    closeBtn.addEventListener('click', () => {
        alert.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    });
    
    // Автоматическое закрытие
    setTimeout(() => {
        if (alert.parentNode) {
            alert.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => alert.remove(), 300);
        }
    }, 5000);
    
    // Добавляем CSS анимации
    if (!document.querySelector('#alert-animations')) {
        const style = document.createElement('style');
        style.id = 'alert-animations';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Обновление меню для авторизации
function updateMenuForAuth() {
    const currentUser = JSON.parse(localStorage.getItem('softbuy_currentUser'));
    const authLinks = document.querySelector('.auth-links');
    const mobileAuthSection = document.querySelector('.auth-section');
    const mobileUserSection = document.querySelector('.user-section');
    const mobileAdminSection = document.querySelector('.admin-section');
    const mobileUserInfo = document.getElementById('mobileUserInfo');
    const mobileUserName = document.getElementById('mobileUserName');
    const mobileUserRole = document.getElementById('mobileUserRole');
    const logoutMobile = document.getElementById('logoutMobile');
    
    if (currentUser) {
        // Обновление десктопного меню
        if (authLinks) {
            authLinks.innerHTML = `
                <div class="user-dropdown">
                    <button class="user-dropdown-toggle">
                        <div class="user-avatar-small">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <span>${currentUser.firstName}</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="user-dropdown-menu">
                        <a href="dashboard.html"><i class="fas fa-user-circle"></i> Личный кабинет</a>
                        ${currentUser.role === 'admin' ? '<a href="admin.html"><i class="fas fa-cogs"></i> Админ-панель</a>' : ''}
                        <div class="dropdown-divider"></div>
                        <a href="#" id="logoutDesktop"><i class="fas fa-sign-out-alt"></i> Выход</a>
                    </div>
                </div>
            `;
            
            // Обработчик выхода для десктопа
            const logoutDesktop = document.getElementById('logoutDesktop');
            if (logoutDesktop) {
                logoutDesktop.addEventListener('click', function(e) {
                    e.preventDefault();
                    localStorage.removeItem('softbuy_currentUser');
                    window.location.href = 'index.html';
                });
            }
        }
        
        // Обновление мобильного меню
        if (mobileAuthSection) mobileAuthSection.style.display = 'none';
        if (mobileUserSection) mobileUserSection.style.display = 'block';
        if (currentUser.role === 'admin' && mobileAdminSection) {
            mobileAdminSection.style.display = 'block';
        }
        if (mobileUserInfo && mobileUserName && mobileUserRole) {
            mobileUserInfo.style.display = 'flex';
            mobileUserName.textContent = currentUser.firstName + ' ' + currentUser.lastName;
            mobileUserRole.textContent = currentUser.role === 'admin' ? 'Администратор' : 'Пользователь';
        }
        
        // Обработчик выхода для мобильной версии
        if (logoutMobile) {
            logoutMobile.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('softbuy_currentUser');
                window.location.href = 'index.html';
            });
        }
    }
}

// Добавьте эти функции в ваш существующий script.js

// Функция для создания заявки (для пользователей)
function createRequest(title, description, category) {
    const currentUser = JSON.parse(localStorage.getItem('softbuy_currentUser'));
    
    if (!currentUser) {
        showAlert('Для создания заявки необходимо войти в систему', 'error');
        return false;
    }
    
    const requests = JSON.parse(localStorage.getItem('softbuy_requests') || '[]');
    
    const newRequest = {
        id: Date.now(),
        userId: currentUser.id,
        title: title,
        description: description,
        category: category,
        status: 'new',
        createdAt: new Date().toISOString(),
        solvedAt: null,
        rejectedAt: null,
        rejectionReason: null
    };
    
    requests.push(newRequest);
    localStorage.setItem('softbuy_requests', JSON.stringify(requests));
    
    return newRequest;
}

// Функция для получения заявок пользователя
function getUserRequests(userId) {
    const requests = JSON.parse(localStorage.getItem('softbuy_requests') || '[]');
    return requests.filter(request => request.userId === userId);
}

// Функция для удаления заявки пользователем
function deleteUserRequest(requestId) {
    const currentUser = JSON.parse(localStorage.getItem('softbuy_currentUser'));
    const requests = JSON.parse(localStorage.getItem('softbuy_requests') || '[]');
    
    const requestIndex = requests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) {
        showAlert('Заявка не найдена', 'error');
        return false;
    }
    
    const request = requests[requestIndex];
    
    // Проверяем, что пользователь удаляет свою заявку
    if (request.userId !== currentUser.id) {
        showAlert('Вы можете удалять только свои заявки', 'error');
        return false;
    }
    
    // Проверяем, что заявка не решена и не отклонена
    if (request.status !== 'new') {
        showAlert('Нельзя удалять заявки со статусом "' + getStatusText(request.status) + '"', 'error');
        return false;
    }
    
    requests.splice(requestIndex, 1);
    localStorage.setItem('softbuy_requests', JSON.stringify(requests));
    
    return true;
}

// Функция для получения текста статуса
function getStatusText(status) {
    switch(status) {
        case 'new': return 'Новая';
        case 'solved': return 'Решена';
        case 'rejected': return 'Отклонена';
        default: return 'Неизвестно';
    }
}

// Функция для инициализации демо-данных
function initializeDemoData() {
    // Проверяем, не инициализированы ли уже данные
    if (localStorage.getItem('softbuy_data_initialized')) {
        return;
    }
    
    console.log('Инициализация демо-данных...');
    
    // Создаем демо-пользователей
    const demoUsers = [
        {
            id: 1,
            login: 'admin',
            password: 'admin',
            firstName: 'Администратор',
            lastName: 'Системы',
            email: 'admin@softbuy.ru',
            role: 'admin',
            registrationDate: new Date().toISOString()
        },
        {
            id: 2,
            login: 'user',
            password: 'user123',
            firstName: 'Иван',
            lastName: 'Иванов',
            email: 'ivanov@example.com',
            role: 'user',
            registrationDate: new Date().toISOString()
        },
        {
            id: 3,
            login: 'petrov',
            password: 'petrov123',
            firstName: 'Петр',
            lastName: 'Петров',
            email: 'petrov@example.com',
            role: 'user',
            registrationDate: new Date().toISOString()
        }
    ];
    
    // Создаем демо-заявки
    const demoRequests = [
        {
            id: 1001,
            userId: 2,
            title: 'Не устанавливается Windows 11',
            description: 'При попытке установки Windows 11 появляется ошибка "This PC can\'t run Windows 11". Процессор: Intel Core i5, ОЗУ: 8 ГБ, SSD: 256 ГБ.',
            category: 'installation',
            status: 'new',
            createdAt: new Date('2024-03-20T14:30:00').toISOString()
        },
        {
            id: 1002,
            userId: 3,
            title: 'Проблема с лицензионным ключом',
            description: 'Купленный лицензионный ключ для Microsoft Office не принимается при активации. Ошибка: "Недействительный ключ продукта".',
            category: 'license',
            status: 'solved',
            createdAt: new Date('2024-03-18T10:15:00').toISOString(),
            solvedAt: new Date('2024-03-19T16:45:00').toISOString()
        },
        {
            id: 1003,
            userId: 2,
            title: 'Ошибка в Photoshop при сохранении',
            description: 'При сохранении файлов в формате PNG Photoshop вылетает с ошибкой "Could not complete your request because of a program error". Версия: Photoshop 2024.',
            category: 'bug',
            status: 'rejected',
            createdAt: new Date('2024-03-15T09:45:00').toISOString(),
            rejectedAt: new Date('2024-03-16T11:20:00').toISOString(),
            rejectionReason: 'Проблема связана с устаревшими драйверами видеокарты. Обновите драйвера и попробуйте снова.'
        },
        {
            id: 1004,
            userId: 3,
            title: 'Нужна помощь с обновлением антивируса',
            description: 'Не могу обновить базы данных Kaspersky. Выдает ошибку соединения, хотя интернет работает нормально.',
            category: 'update',
            status: 'new',
            createdAt: new Date('2024-03-22T16:20:00').toISOString()
        }
    ];
    
    // Сохраняем данные
    localStorage.setItem('softbuy_users', JSON.stringify(demoUsers));
    localStorage.setItem('softbuy_requests', JSON.stringify(demoRequests));
    localStorage.setItem('softbuy_data_initialized', 'true');
    
    console.log('Демо-данные успешно инициализированы');
}

// Инициализируем демо-данные при первой загрузке
document.addEventListener('DOMContentLoaded', initializeDemoData);