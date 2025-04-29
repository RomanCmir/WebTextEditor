document.addEventListener('DOMContentLoaded', function() {
    // Инициализация хранилища пользователей
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    
    // Элементы формы входа
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const rememberMe = document.getElementById('remember-me').checked;
            
            // Проверка пользователя
            const users = JSON.parse(localStorage.getItem('users'));
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                // Сохраняем данные сессии
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }
                
                // Перенаправляем в редактор
                window.location.href = '../index.html';
            } else {
                alert('Неверный email или пароль');
            }
        });
        
        // Заполняем сохраненный email
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            document.getElementById('login-email').value = rememberedEmail;
            document.getElementById('remember-me').checked = true;
        }
    }
    
    // Элементы формы регистрации
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const confirm = document.getElementById('reg-confirm').value;
            
            // Валидация
            if (password !== confirm) {
                alert('Пароли не совпадают');
                return;
            }
            
            if (password.length < 6) {
                alert('Пароль должен содержать минимум 6 символов');
                return;
            }
            
            // Проверка существующего пользователя
            const users = JSON.parse(localStorage.getItem('users'));
            const userExists = users.some(u => u.email === email);
            
            if (userExists) {
                alert('Пользователь с таким email уже зарегистрирован');
                return;
            }
            
            // Создаем нового пользователя
            const newUser = {
                id: Date.now().toString(),
                name: name,
                email: email,
                password: password,
                registeredAt: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            alert('Регистрация прошла успешно!');
            window.location.href = '../index.html';
        });
    }
    
});