// Модуль авторизации
class Auth {
    constructor() {
        this.initAuth();
        this.initLoginForm();
        this.checkCurrentPage();
    }
    
    // Инициализация авторизации
    initAuth() {
        // Проверяем, не авторизован ли пользователь уже
        this.checkAuth();
    }
    
    // Проверка авторизации
    checkAuth() {
        const currentUser = localStorage.getItem('softbuy_currentUser');
        const currentPath = window.location.pathname;
        
        // Страницы, требующие авторизации
        const protectedPages = ['dashboard.html', 'admin.html', 'admin-users.html', 'admin-requests.html'];
        const adminPages = ['admin.html', 'admin-users.html', 'admin-requests.html'];
        
        if (currentUser) {
            const user = JSON.parse(currentUser);
            
            // Проверка доступа к админ-страницам
            if (adminPages.some(page => currentPath.includes(page)) && user.role !== 'admin') {
                window.location.href = 'index.html';
                return;
            }
        } else {
            // Если пользователь не авторизован, но пытается зайти на защищенные страницы
            if (protectedPages.some(page => currentPath.includes(page))) {
                window.location.href = 'login.html';
                return;
            }
        }
    }
    
    // Проверка текущей страницы
    checkCurrentPage() {
        const currentPath = window.location.pathname;
        
        if (currentPath.includes('login.html')) {
            this.redirectIfLoggedIn();
        }
    }
    
    // Перенаправление если уже авторизован
    redirectIfLoggedIn() {
        const currentUser = localStorage.getItem('softbuy_currentUser');
        
        if (currentUser) {
            const user = JSON.parse(currentUser);
            
            if (user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        }
    }
    
    // Инициализация формы входа
    initLoginForm() {
        const loginForm = document.getElementById('loginForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
            
            // Демо кнопки
            const demoAdminBtn = document.getElementById('demoAdminBtn');
            const demoUserBtn = document.getElementById('demoUserBtn');
            
            if (demoAdminBtn) {
                demoAdminBtn.addEventListener('click', () => this.demoLogin('admin'));
            }
            
            if (demoUserBtn) {
                demoUserBtn.addEventListener('click', () => this.demoLogin('user'));
            }
        }
    }
    
    // Обработка входа
    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const login = form.querySelector('#login').value.trim();
        const password = form.querySelector('#password').value.trim();
        const remember = form.querySelector('#remember') ? form.querySelector('#remember').checked : false;
        
        // Валидация
        if (!login || !password) {
            this.showError('Заполните все поля');
            return;
        }
        
        // Имитация проверки на сервере
        const user = this.authenticate(login, password);
        
        if (user) {
            // Сохранение пользователя
            localStorage.setItem('softbuy_currentUser', JSON.stringify(user));
            
            // Сохранение в cookies если выбрано "Запомнить меня"
            if (remember) {
                this.setCookie('softbuy_user', JSON.stringify(user), 30);
            }
            
            // Редирект
            if (user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        } else {
            this.showError('Неверный логин или пароль');
        }
    }
    
    // Демо вход
    demoLogin(type) {
        let user;
        
        if (type === 'admin') {
            user = {
                id: 1,
                login: 'admin',
                firstName: 'Администратор',
                lastName: 'Системы',
                email: 'admin@softbuy.ru',
                role: 'admin',
                registrationDate: new Date().toISOString()
            };
        } else {
            user = {
                id: 2,
                login: 'user',
                firstName: 'Иван',
                lastName: 'Иванов',
                email: 'user@example.com',
                role: 'user',
                registrationDate: new Date().toISOString()
            };
        }
        
        localStorage.setItem('softbuy_currentUser', JSON.stringify(user));
        
        if (type === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    }
    
    // Аутентификация
    authenticate(login, password) {
        // Проверка демо пользователей
        if (login === 'admin' && password === 'admin') {
            return {
                id: 1,
                login: 'admin',
                firstName: 'Администратор',
                lastName: 'Системы',
                email: 'admin@softbuy.ru',
                role: 'admin',
                registrationDate: new Date().toISOString()
            };
        }
        
        if (login === 'user' && password === 'user123') {
            return {
                id: 2,
                login: 'user',
                firstName: 'Иван',
                lastName: 'Иванов',
                email: 'user@example.com',
                role: 'user',
                registrationDate: new Date().toISOString()
            };
        }
        
        // Проверка пользователей из localStorage
        const users = JSON.parse(localStorage.getItem('softbuy_users') || '[]');
        const user = users.find(u => u.login === login);
        
        if (user) {
            // В реальном приложении здесь была бы проверка хэша пароля
            return user;
        }
        
        return null;
    }
    
    // Выход
    logout() {
        localStorage.removeItem('softbuy_currentUser');
        this.deleteCookie('softbuy_user');
        window.location.href = 'index.html';
    }
    
    // Работа с cookies
    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
    }
    
    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
        return null;
    }
    
    deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
    
    // Показать ошибку
    showError(message) {
        const errorElement = document.getElementById('loginError');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            
            // Автоматическое скрытие
            setTimeout(() => {
                errorElement.classList.remove('show');
            }, 5000);
        } else {
            alert(message);
        }
    }
    
    // Получить текущего пользователя
    getCurrentUser() {
        const userStr = localStorage.getItem('softbuy_currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }
    
    // Проверить является ли пользователь администратором
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }
}

// Инициализация модуля авторизации
const auth = new Auth();

// Экспорт для использования в других файлах
window.Auth = auth;