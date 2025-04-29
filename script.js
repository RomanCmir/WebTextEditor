document.addEventListener('DOMContentLoaded', function() {
    // Инициализация данных пользователя
    const userData = JSON.parse(localStorage.getItem('userData')) || {
        username: 'John Doe',
        email: 'john.doe@example.com',
        initials: 'JD',
        documents: [],
        settings: {
            theme: 'light',
            fontSize: 16,
            autoSave: true
        },
        stats: {
            totalDocs: 12,
            totalChars: 24500,
            activeDays: 8
        }
    };

    // Инициализация элементов интерфейса
    const usernameElement = document.getElementById('username');
    const userEmailElement = document.getElementById('user-email');
    const userAvatar = document.getElementById('user-avatar');
    const avatarPreview = document.getElementById('avatar-preview');
    const fullNameInput = document.getElementById('full-name');
    const userEmailInput = document.getElementById('user-email-input');
    const themeSelect = document.getElementById('theme-select');
    const fontSizeSlider = document.getElementById('font-size');
    const fontSizeValue = document.getElementById('font-size-value');
    const autoSaveCheckbox = document.getElementById('auto-save');
    const totalDocsElement = document.getElementById('total-docs');
    const totalCharsElement = document.getElementById('total-chars');
    const activeDaysElement = document.getElementById('active-days');
    const documentsList = document.getElementById('documents-list');
    const logoutBtn = document.getElementById('logout-btn');

    // Загрузка данных пользователя
    function loadUserData() {
        usernameElement.textContent = userData.username;
        userEmailElement.textContent = userData.email;
        userAvatar.textContent = userData.initials;
        avatarPreview.textContent = userData.initials;
        fullNameInput.value = userData.username;
        userEmailInput.value = userData.email;
        
        // Настройки
        themeSelect.value = userData.settings.theme;
        fontSizeSlider.value = userData.settings.fontSize;
        fontSizeValue.textContent = `${userData.settings.fontSize}px`;
        autoSaveCheckbox.checked = userData.settings.autoSave;
        
        // Статистика
        totalDocsElement.textContent = userData.stats.totalDocs;
        totalCharsElement.textContent = userData.stats.totalChars;
        activeDaysElement.textContent = userData.stats.activeDays;
        
        // Загрузка документов
        loadDocuments();
    }

    // Загрузка списка документов
    function loadDocuments() {
        documentsList.innerHTML = '';
        
        const sampleDocuments = [
            { id: 1, title: 'Важный отчет', date: '2023-05-15', size: '24 KB' },
            { id: 2, title: 'План проекта', date: '2023-05-10', size: '18 KB' },
            { id: 3, title: 'Идеи для нового дизайна', date: '2023-05-05', size: '12 KB' },
            { id: 4, title: 'Заметки с совещания', date: '2023-04-28', size: '8 KB' }
        ];
        
        sampleDocuments.forEach(doc => {
            const docElement = document.createElement('div');
            docElement.className = 'document-card';
            docElement.innerHTML = `
                <h3>${doc.title}</h3>
                <p>Последнее изменение: ${doc.date}</p>
                <div class="document-meta">
                    <span>${doc.size}</span>
                    <button class="btn btn-secondary btn-sm">
                    <a href="index.html">Открыть</a>
                    </button>
                </div>
            `;
            documentsList.appendChild(docElement);
        });
    }

    // Инициализация графика активности
    function initActivityChart() {
        const ctx = document.getElementById('activity-chart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
                datasets: [{
                    label: 'Активность (часы)',
                    data: [3, 5, 2, 4, 6, 1, 0],
                    backgroundColor: '#2b579a',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Переключение между разделами
    function setupSectionSwitching() {
        const menuItems = document.querySelectorAll('.account-menu a');
        const sections = document.querySelectorAll('.account-section');
        
        menuItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Удаляем активный класс у всех пунктов меню
                menuItems.forEach(i => {
                    i.parentElement.classList.remove('active');
                });
                
                // Добавляем активный класс текущему пункту
                this.parentElement.classList.add('active');
                
                // Скрываем все секции
                sections.forEach(section => {
                    section.classList.remove('active');
                });
                
                // Показываем нужную секцию
                const targetId = this.getAttribute('href').substring(1) + '-section';
                document.getElementById(targetId).classList.add('active');
            });
        });
    }

    // Обработка формы профиля
    document.getElementById('profile-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        userData.username = fullNameInput.value;
        userData.email = userEmailInput.value;
        userData.initials = getInitials(fullNameInput.value);
        
        // Сохраняем в localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Обновляем интерфейс
        loadUserData();
        
        alert('Изменения профиля сохранены!');
    });

    // Загрузка аватара
    document.getElementById('avatar-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                avatarPreview.style.backgroundImage = `url(${event.target.result})`;
                avatarPreview.textContent = '';
                userAvatar.style.backgroundImage = `url(${event.target.result})`;
                userAvatar.textContent = '';
            };
            reader.readAsDataURL(file);
        }
    });

    // Обработка формы настроек
    document.getElementById('settings-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        userData.settings.theme = themeSelect.value;
        userData.settings.fontSize = fontSizeSlider.value;
        userData.settings.autoSave = autoSaveCheckbox.checked;
        
        // Сохраняем в localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Применяем настройки
        applySettings();
        
        alert('Настройки сохранены!');
    });

    // Изменение размера шрифта
    fontSizeSlider.addEventListener('input', function() {
        fontSizeValue.textContent = `${this.value}px`;
    });

    // Выход из системы
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'auth/login.html'; // Перенаправляем на страницу входа
    });

    // Вспомогательная функция для получения инициалов
    function getInitials(name) {
        return name.split(' ').map(part => part[0]).join('').toUpperCase();
    }

    // Применение настроек
    function applySettings() {
        // Тема
        document.body.className = userData.settings.theme;
        
        // Размер шрифта
        document.body.style.fontSize = `${userData.settings.fontSize}px`;
    }

    // Инициализация
    loadUserData();
    initActivityChart();
    setupSectionSwitching();
    applySettings();
});