// ==================== КОНФИГУРАЦИЯ ====================
const API_BASE_URL = 'http://localhost:5000/api';
const LOG_LIMIT = 50;

let scanIntervalMs = parseInt(localStorage.getItem('scanInterval') ?? '10000');
let scanIntervalId = null;
let healthIntervalId = null;

// ==================== ПЕРЕВОДЫ ====================

const TRANSLATIONS = {
    ru: {
        subtitle: 'Умная система организации файлов',
        connecting: 'Подключение...', connected: '🟢 Подключено', disconnected: '🔴 Отключено',
        controls: 'Управление', organizeAll: 'Организовать все файлы',
        selectFile: 'Выбрать файл', refresh: 'Обновить',
        filesTitle: 'Файлы в "Загрузках"', searchPlaceholder: '🔍 Поиск файлов...',
        allCategories: 'Все категории', catImages: '📸 Изображения',
        catDocuments: '📄 Документы', catVideos: '🎬 Видео',
        catMusic: '🎵 Музыка', catArchives: '📦 Архивы', catOther: '📋 Другое',
        stats: 'Статистика', totalFiles: 'Всего файлов',
        totalSize: 'Общий размер', organized: 'Организовано',
        distribution: 'Распределение по типам', history: 'История операций',
        clear: 'Очистить', modalTitle: 'Выберите файл для организации',
        noFiles: '📭 Нет файлов для организации', notFound: '🔍 Файлы не найдены',
        noHistory: '📭 История пуста', noData: 'Нет данных',
        noFilesModal: 'Нет файлов', loading: '⏳ Загрузка файлов...', files: 'файлов',
        toastRefresh: '🔄 Обновление...', toastCleared: '📋 История очищена',
        toastOrganizing: '🔄 Начинается организация файлов...',
        toastOrganized: '✅ Организовано', toastOrgError: '❌ Ошибка при организации файлов',
        toastInProgress: 'Операция уже в процессе...',
        toastFileOrganizing: '📁 Организация файла:', toastFileOrganized: '✅ организован!',
        toastFileError: '❌ Ошибка при организации',
        organizeBtn: '📁 Организовать', operationDone: 'Операция выполнена',
        destination: '📂 Куда:', category: '🏷 Тип:', filesProcessed: '📊 Обработано файлов:',
        int5s: '5 секунд', int10s: '10 секунд', int30s: '30 секунд',
        int1m: '1 минута', int5m: '5 минут', intOff: 'Выключено',
        intActive: 'Активно —', intStopped: 'Остановлено',
        stopServer: 'Остановить', shutdownTitle: 'Остановить сервер?', shutdownDesc: 'Приложение будет остановлено. Браузер отключится от сервера.', shutdownConfirm: 'Остановить', shutdownCancel: 'Отмена',
        offlineDesc: 'Сервер не запущен. Запустите приложение чтобы начать работу.',
        offlineStep1: 'Дважды кликните на start.bat в папке проекта',
        offlineStep2: 'Дождитесь запуска — браузер откроется автоматически',
        offlineStep3: 'Для остановки закройте окно терминала',
        retryConnect: 'Повторить подключение',
        offlineHint: 'Сервер запущен? Нажмите кнопку выше.',
    },
    en: {
        subtitle: 'Smart file organization system',
        connecting: 'Connecting...', connected: '🟢 Connected', disconnected: '🔴 Disconnected',
        controls: 'Controls', organizeAll: 'Organize all files',
        selectFile: 'Select file', refresh: 'Refresh',
        filesTitle: 'Files in Downloads', searchPlaceholder: '🔍 Search files...',
        allCategories: 'All categories', catImages: '📸 Images',
        catDocuments: '📄 Documents', catVideos: '🎬 Videos',
        catMusic: '🎵 Music', catArchives: '📦 Archives', catOther: '📋 Other',
        stats: 'Statistics', totalFiles: 'Total files',
        totalSize: 'Total size', organized: 'Organized',
        distribution: 'Distribution by type', history: 'Operation history',
        clear: 'Clear', modalTitle: 'Select a file to organize',
        noFiles: '📭 No files to organize', notFound: '🔍 No files found',
        noHistory: '📭 History is empty', noData: 'No data',
        noFilesModal: 'No files', loading: '⏳ Loading files...', files: 'files',
        toastRefresh: '🔄 Refreshing...', toastCleared: '📋 History cleared',
        toastOrganizing: '🔄 Starting file organization...',
        toastOrganized: '✅ Organized', toastOrgError: '❌ Error organizing files',
        toastInProgress: 'Operation already in progress...',
        toastFileOrganizing: '📁 Organizing file:', toastFileOrganized: '✅ organized!',
        toastFileError: '❌ Error organizing',
        organizeBtn: '📁 Organize', operationDone: 'Operation completed',
        destination: '📂 Destination:', category: '🏷 Type:', filesProcessed: '📊 Files processed:',
        int5s: '5 seconds', int10s: '10 seconds', int30s: '30 seconds',
        int1m: '1 minute', int5m: '5 minutes', intOff: 'Disabled',
        intActive: 'Active —', intStopped: 'Stopped',
        stopServer: 'Stop server', shutdownTitle: 'Stop server?', shutdownDesc: 'The application will be stopped. The browser will disconnect.', shutdownConfirm: 'Stop', shutdownCancel: 'Cancel',
        offlineDesc: 'Server is not running. Launch the app to get started.',
        offlineStep1: 'Double-click start.bat in the project folder',
        offlineStep2: 'Wait for launch — the browser will open automatically',
        offlineStep3: 'To stop, close the terminal window',
        retryConnect: 'Retry connection',
        offlineHint: 'Server already running? Click the button above.',
    },
    pt: {
        subtitle: 'Sistema inteligente de organização de arquivos',
        connecting: 'Conectando...', connected: '🟢 Conectado', disconnected: '🔴 Desconectado',
        controls: 'Controles', organizeAll: 'Organizar todos os arquivos',
        selectFile: 'Selecionar arquivo', refresh: 'Atualizar',
        filesTitle: 'Arquivos em Downloads', searchPlaceholder: '🔍 Pesquisar arquivos...',
        allCategories: 'Todas as categorias', catImages: '📸 Imagens',
        catDocuments: '📄 Documentos', catVideos: '🎬 Vídeos',
        catMusic: '🎵 Música', catArchives: '📦 Arquivos compactados', catOther: '📋 Outros',
        stats: 'Estatísticas', totalFiles: 'Total de arquivos',
        totalSize: 'Tamanho total', organized: 'Organizados',
        distribution: 'Distribuição por tipo', history: 'Histórico de operações',
        clear: 'Limpar', modalTitle: 'Selecione um arquivo para organizar',
        noFiles: '📭 Nenhum arquivo para organizar', notFound: '🔍 Nenhum arquivo encontrado',
        noHistory: '📭 Histórico vazio', noData: 'Sem dados',
        noFilesModal: 'Sem arquivos', loading: '⏳ Carregando arquivos...', files: 'arquivos',
        toastRefresh: '🔄 Atualizando...', toastCleared: '📋 Histórico limpo',
        toastOrganizing: '🔄 Iniciando organização...',
        toastOrganized: '✅ Organizados', toastOrgError: '❌ Erro ao organizar arquivos',
        toastInProgress: 'Operação já em andamento...',
        toastFileOrganizing: '📁 Organizando arquivo:', toastFileOrganized: '✅ organizado!',
        toastFileError: '❌ Erro ao organizar',
        organizeBtn: '📁 Organizar', operationDone: 'Operação concluída',
        destination: '📂 Destino:', category: '🏷 Tipo:', filesProcessed: '📊 Arquivos processados:',
        int5s: '5 segundos', int10s: '10 segundos', int30s: '30 segundos',
        int1m: '1 minuto', int5m: '5 minutos', intOff: 'Desativado',
        intActive: 'Ativo —', intStopped: 'Parado',
        stopServer: 'Parar servidor', shutdownTitle: 'Parar servidor?', shutdownDesc: 'O aplicativo será encerrado.', shutdownConfirm: 'Parar', shutdownCancel: 'Cancelar',
        offlineDesc: 'Servidor não iniciado. Inicie o aplicativo para começar.',
        offlineStep1: 'Clique duas vezes em start.bat na pasta do projeto',
        offlineStep2: 'Aguarde a inicialização — o navegador abrirá automaticamente',
        offlineStep3: 'Para parar, feche a janela do terminal',
        retryConnect: 'Tentar reconectar',
        offlineHint: 'Servidor já rodando? Clique no botão acima.',
    },
    es: {
        subtitle: 'Sistema inteligente de organización de archivos',
        connecting: 'Conectando...', connected: '🟢 Conectado', disconnected: '🔴 Desconectado',
        controls: 'Controles', organizeAll: 'Organizar todos los archivos',
        selectFile: 'Seleccionar archivo', refresh: 'Actualizar',
        filesTitle: 'Archivos en Descargas', searchPlaceholder: '🔍 Buscar archivos...',
        allCategories: 'Todas las categorías', catImages: '📸 Imágenes',
        catDocuments: '📄 Documentos', catVideos: '🎬 Vídeos',
        catMusic: '🎵 Música', catArchives: '📦 Archivos comprimidos', catOther: '📋 Otros',
        stats: 'Estadísticas', totalFiles: 'Total de archivos',
        totalSize: 'Tamaño total', organized: 'Organizados',
        distribution: 'Distribución por tipo', history: 'Historial de operaciones',
        clear: 'Limpiar', modalTitle: 'Selecciona un archivo para organizar',
        noFiles: '📭 No hay archivos para organizar', notFound: '🔍 No se encontraron archivos',
        noHistory: '📭 Historial vacío', noData: 'Sin datos',
        noFilesModal: 'Sin archivos', loading: '⏳ Cargando archivos...', files: 'archivos',
        toastRefresh: '🔄 Actualizando...', toastCleared: '📋 Historial limpiado',
        toastOrganizing: '🔄 Iniciando organización...',
        toastOrganized: '✅ Organizados', toastOrgError: '❌ Error al organizar archivos',
        toastInProgress: 'Operación ya en curso...',
        toastFileOrganizing: '📁 Organizando archivo:', toastFileOrganized: '✅ ¡organizado!',
        toastFileError: '❌ Error al organizar',
        organizeBtn: '📁 Organizar', operationDone: 'Operación completada',
        destination: '📂 Destino:', category: '🏷 Tipo:', filesProcessed: '📊 Archivos procesados:',
        int5s: '5 segundos', int10s: '10 segundos', int30s: '30 segundos',
        int1m: '1 minuto', int5m: '5 minutos', intOff: 'Desactivado',
        intActive: 'Activo —', intStopped: 'Detenido',
        stopServer: 'Detener servidor', shutdownTitle: '¿Detener servidor?', shutdownDesc: 'La aplicación se detendrá.', shutdownConfirm: 'Detener', shutdownCancel: 'Cancelar',
        offlineDesc: 'El servidor no está en ejecución. Inicia la aplicación para comenzar.',
        offlineStep1: 'Haz doble clic en start.bat en la carpeta del proyecto',
        offlineStep2: 'Espera el inicio — el navegador se abrirá automáticamente',
        offlineStep3: 'Para detener, cierra la ventana de terminal',
        retryConnect: 'Reintentar conexión',
        offlineHint: '¿Servidor ya en marcha? Haz clic en el botón de arriba.',
    },
    zh: {
        subtitle: '智能文件整理系统',
        connecting: '连接中...', connected: '🟢 已连接', disconnected: '🔴 已断开',
        controls: '控制面板', organizeAll: '整理所有文件',
        selectFile: '选择文件', refresh: '刷新',
        filesTitle: '下载文件夹中的文件', searchPlaceholder: '🔍 搜索文件...',
        allCategories: '所有类别', catImages: '📸 图片',
        catDocuments: '📄 文档', catVideos: '🎬 视频',
        catMusic: '🎵 音乐', catArchives: '📦 压缩包', catOther: '📋 其他',
        stats: '统计', totalFiles: '文件总数',
        totalSize: '总大小', organized: '已整理',
        distribution: '按类型分布', history: '操作历史',
        clear: '清除', modalTitle: '选择要整理的文件',
        noFiles: '📭 没有文件需要整理', notFound: '🔍 未找到文件',
        noHistory: '📭 历史记录为空', noData: '暂无数据',
        noFilesModal: '暂无文件', loading: '⏳ 加载文件中...', files: '个文件',
        toastRefresh: '🔄 刷新中...', toastCleared: '📋 历史已清除',
        toastOrganizing: '🔄 开始整理文件...',
        toastOrganized: '✅ 已整理', toastOrgError: '❌ 整理文件时出错',
        toastInProgress: '操作进行中...',
        toastFileOrganizing: '📁 正在整理文件:', toastFileOrganized: '✅ 已整理！',
        toastFileError: '❌ 整理出错',
        organizeBtn: '📁 整理', operationDone: '操作完成',
        destination: '📂 目标路径:', category: '🏷 类型:', filesProcessed: '📊 已处理文件:',
        int5s: '5 秒', int10s: '10 秒', int30s: '30 秒',
        int1m: '1 分钟', int5m: '5 分钟', intOff: '已禁用',
        intActive: '运行中 —', intStopped: '已停止',
        stopServer: '停止服务器', shutdownTitle: '停止服务器？', shutdownDesc: '应用程序将被停止。', shutdownConfirm: '停止', shutdownCancel: '取消',
        offlineDesc: '服务器未启动。请启动应用程序以开始使用。',
        offlineStep1: '双击项目文件夹中的 start.bat',
        offlineStep2: '等待启动 — 浏览器将自动打开',
        offlineStep3: '若要停止，请关闭终端窗口',
        retryConnect: '重试连接',
        offlineHint: '服务器已运行？请点击上方按钮。',
    }
};

let currentLang = localStorage.getItem('lang') || 'ru';

function t(key) {
    return TRANSLATIONS[currentLang][key] || TRANSLATIONS['ru'][key] || key;
}

function applyLang() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    document.querySelectorAll('#categoryFilter option[data-i18n]').forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('#intervalSelect option[data-i18n]').forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });
    document.getElementById('langSwitcher').value = currentLang;
    updateIntervalStatus();
}

// ==================== ИНТЕРВАЛ СКАНИРОВАНИЯ ====================

function startScanIntervals() {
    if (scanIntervalId) clearInterval(scanIntervalId);
    if (healthIntervalId) clearInterval(healthIntervalId);

    if (scanIntervalMs > 0) {
        scanIntervalId = setInterval(fetchFiles, scanIntervalMs);
        scanIntervalId = setInterval(fetchHistory, scanIntervalMs);
    }
    healthIntervalId = setInterval(checkHealth, 30000);
    updateIntervalStatus();
}

function updateIntervalStatus() {
    const el = document.getElementById('intervalStatus');
    if (!el) return;
    if (scanIntervalMs === 0) {
        el.textContent = t('intStopped');
        el.className = 'interval-status stopped';
    } else {
        const label = document.querySelector(`#intervalSelect option[value="${scanIntervalMs}"]`);
        const timeText = label ? label.textContent : '';
        el.textContent = `${t('intActive')} ${timeText}`;
        el.className = 'interval-status active';
    }
}

// ==================== СОСТОЯНИЕ ПРИЛОЖЕНИЯ ====================
const appState = {
    files: [],
    history: [],
    stats: {
        total: 0,
        organized: 0,
        size: 0
    },
    isLoading: false,
    selectedCategory: '',
    searchQuery: ''
};

// ==================== УТИЛИТЫ ====================

function formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('ru-RU');
}

function getCategoryEmoji(category) {
    const emojis = {
        images: '📸',
        documents: '📄',
        videos: '🎬',
        music: '🎵',
        archives: '📦',
        other: '📋'
    };
    return emojis[category] || '📋';
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==================== API ФУНКЦИИ ====================

async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showToast(`Ошибка: ${error.message}`, 'error');
        return null;
    }
}

async function fetchFiles() {
    appState.isLoading = true;
    const result = await apiCall('/files');
    
    if (result && result.status === 'success') {
        appState.files = result.files || [];
        updateFilesList();
        updateStats();
    }
    
    appState.isLoading = false;
}

async function fetchHistory() {
    const result = await apiCall(`/history?limit=${LOG_LIMIT}`);
    
    if (result && result.status === 'success') {
        appState.history = result.history || [];
        updateLog();
    }
}

async function organizeAllFiles() {
    if (appState.isLoading) { showToast(t('toastInProgress'), 'warning'); return; }
    appState.isLoading = true;
    showToast(t('toastOrganizing'));
    const result = await apiCall('/organize/all', 'POST');
    if (result && result.status === 'success') {
        showToast(`${t('toastOrganized')} ${result.total} ${t('files')}!`, 'success');
        await fetchFiles(); await fetchHistory();
    } else { showToast(t('toastOrgError'), 'error'); }
    appState.isLoading = false;
}

async function organizeSingleFile(filename) {
    appState.isLoading = true;
    showToast(`${t('toastFileOrganizing')} ${filename}...`);
    const result = await apiCall('/organize/single', 'POST', { filename });
    if (result && result.status === 'success') {
        showToast(`${filename} ${t('toastFileOrganized')}`, 'success');
        await fetchFiles(); await fetchHistory();
    } else { showToast(`${t('toastFileError')} ${filename}`, 'error'); }
    appState.isLoading = false;
}

async function checkHealth() {
    const result = await apiCall('/health');
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const overlay = document.getElementById('offlineOverlay');

    if (result && result.status === 'healthy') {
        statusText.textContent = t('connected');
        statusIndicator.classList.add('connected');
        if (overlay) overlay.style.display = 'none';
    } else {
        statusText.textContent = t('disconnected');
        statusIndicator.classList.remove('connected');
        if (overlay) overlay.style.display = 'flex';
    }
}

// ==================== РЕНДЕРИНГ UI ====================

function updateFilesList() {
    const filesList = document.getElementById('filesList');
    
    if (appState.files.length === 0) {
        filesList.innerHTML = `<div class="loading">${t('noFiles')}</div>`;
        return;
    }
    
    let filtered = appState.files;
    
    // Фильтр по категории
    if (appState.selectedCategory) {
        filtered = filtered.filter(f => f.category === appState.selectedCategory);
    }
    
    // Поиск по имени
    if (appState.searchQuery) {
        filtered = filtered.filter(f => 
            f.name.toLowerCase().includes(appState.searchQuery.toLowerCase())
        );
    }
    
    if (filtered.length === 0) {
        filesList.innerHTML = `<div class="loading">${t('notFound')}</div>`;
        return;
    }
    
    filesList.innerHTML = filtered.map(file => `
        <div class="file-item">
            <div class="file-info">
                <div class="file-icon">${getCategoryEmoji(file.category)}</div>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-meta">
                        ${formatFileSize(file.size)} • ${formatDate(file.modified)}
                    </div>
                </div>
                <span class="file-category">${file.category}</span>
            </div>
            <div class="file-actions">
                <button class="btn-organize" onclick="organizeSingleFile('${file.name}')">
                    ${t('organizeBtn')}
                </button>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    const fileCount = document.getElementById('fileCount');
    const totalFiles = document.getElementById('totalFiles');
    const totalSize = document.getElementById('totalSize');
    
    fileCount.textContent = appState.files.length;
    totalFiles.textContent = appState.files.length;
    
    const size = appState.files.reduce((sum, f) => sum + f.size, 0);
    totalSize.textContent = formatFileSize(size);
    
    // Распределение по категориям
    const categoryCount = {};
    appState.files.forEach(f => {
        categoryCount[f.category] = (categoryCount[f.category] || 0) + 1;
    });
    
    updateCategoryDistribution(categoryCount);
}

function updateCategoryDistribution(categoryCount) {
    const categoryList = document.getElementById('categoryList');
    
    if (Object.keys(categoryCount).length === 0) {
        categoryList.innerHTML = `<div style="color: var(--text-secondary); text-align: center; padding: 20px;">${t('noData')}</div>`;
        return;
    }
    
    categoryList.innerHTML = Object.entries(categoryCount)
        .map(([category, count]) => `
            <div class="category-item">
                <span class="category-name">${getCategoryEmoji(category)} ${category}</span>
                <span class="category-count">${count} ${t('files')}</span>
            </div>
        `)
        .join('');
}

function updateLog() {
    const logContainer = document.getElementById('logContainer');
    
    if (appState.history.length === 0) {
        logContainer.innerHTML = `<div class="log-empty">${t('noHistory')}</div>`;
        return;
    }
    
    logContainer.innerHTML = appState.history
        .slice()
        .reverse()
        .map((item) => {
            const isSuccess = item.result?.status === 'success';
            const className = isSuccess ? 'log-item success' : 'log-item error';
            const icon = isSuccess ? '✅' : '❌';
            const message = item.result?.message || t('operationDone');

            let details = '';

            if (item.operation === 'organize_single' && isSuccess) {
                const dest = item.result?.destination || '';
                const cat  = item.result?.category  || '';
                const fname = item.result?.filename  || '';
                details = `
                    <div class="log-details">
                        ${fname ? `<div class="log-detail-row"><span class="log-detail-label">📄 ${fname}</span></div>` : ''}
                        ${cat   ? `<div class="log-detail-row"><span class="log-detail-label">${t('category')} </span><span class="log-detail-value">${cat}</span></div>` : ''}
                        ${dest  ? `<div class="log-detail-row"><span class="log-detail-label">${t('destination')} </span><span class="log-detail-path">${dest}</span></div>` : ''}
                    </div>`;
            }

            if (item.operation === 'organize_all' && isSuccess) {
                const results = item.result?.results || [];
                const succeeded = results.filter(r => r.status === 'success');
                details = `
                    <div class="log-details">
                        <div class="log-detail-row"><span class="log-detail-label">${t('filesProcessed')} </span><span class="log-detail-value">${succeeded.length} / ${results.length}</span></div>
                        ${succeeded.map(r => `
                            <div class="log-detail-file">
                                <span>📄 ${r.filename}</span>
                                <span class="log-detail-path">${r.destination || ''}</span>
                            </div>`).join('')}
                    </div>`;
            }

            return `
                <div class="${className}">
                    <div class="log-header-row">
                        <span>${icon} ${item.operation.toUpperCase()}</span>
                        <span class="log-timestamp">${formatDate(item.timestamp)}</span>
                    </div>
                    <div class="log-message">${message}</div>
                    ${details}
                </div>
            `;
        })
        .join('');
}

function updateModalFiles() {
    const modalFiles = document.getElementById('modalFiles');
    
    if (appState.files.length === 0) {
        modalFiles.innerHTML = `<div style="color: var(--text-secondary); text-align: center; padding: 20px;">${t('noFilesModal')}</div>`;
        return;
    }
    
    modalFiles.innerHTML = appState.files
        .map(file => `
            <div class="modal-file-item" onclick="organizeSingleFile('${file.name}'); closeModal()">
                <div style="font-weight: 600;">${file.name}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">
                    ${file.category} • ${formatFileSize(file.size)}
                </div>
            </div>
        `)
        .join('');
}

// ==================== МОДАЛЬНОЕ ОКНО ====================

function openModal() {
    const modal = document.getElementById('fileModal');
    modal.classList.add('show');
    updateModalFiles();
}

function closeModal() {
    const modal = document.getElementById('fileModal');
    modal.classList.remove('show');
}

// ==================== EVENT LISTENERS ====================

document.addEventListener('DOMContentLoaded', () => {
    // Retry при офлайне
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
        retryBtn.addEventListener('click', async () => {
            retryBtn.textContent = '...';
            retryBtn.disabled = true;
            await checkHealth();
            if (document.getElementById('offlineOverlay').style.display !== 'none') {
                retryBtn.textContent = t('retryConnect');
                retryBtn.disabled = false;
            } else {
                fetchFiles();
                fetchHistory();
            }
        });
    }

    // Кнопка остановки сервера
    const shutdownBtn = document.getElementById('shutdownBtn');
    const shutdownModal = document.getElementById('shutdownModal');
    const shutdownConfirm = document.getElementById('shutdownConfirm');
    const shutdownCancel = document.getElementById('shutdownCancel');
    const shutdownClose = document.getElementById('shutdownClose');

    if (shutdownBtn) {
        shutdownBtn.addEventListener('click', () => {
            shutdownModal.classList.add('show');
        });
    }
    [shutdownCancel, shutdownClose].forEach(btn => {
        if (btn) btn.addEventListener('click', () => shutdownModal.classList.remove('show'));
    });
    if (shutdownConfirm) {
        shutdownConfirm.addEventListener('click', async () => {
            shutdownConfirm.textContent = '...';
            shutdownConfirm.disabled = true;
            await apiCall('/api/shutdown', 'POST');
            shutdownModal.classList.remove('show');
            document.getElementById('offlineOverlay').style.display = 'flex';
        });
    }

    // Язык
    applyLang();
    document.getElementById('langSwitcher').addEventListener('change', (e) => {
        currentLang = e.target.value;
        localStorage.setItem('lang', currentLang);
        applyLang();
        updateFilesList();
        updateLog();
        updateStats();
    });

    // Интервал сканирования
    const intervalSelect = document.getElementById('intervalSelect');
    intervalSelect.value = String(scanIntervalMs);
    intervalSelect.addEventListener('change', (e) => {
        scanIntervalMs = parseInt(e.target.value);
        localStorage.setItem('scanInterval', scanIntervalMs);
        startScanIntervals();
        showToast(scanIntervalMs === 0 ? t('intStopped') : `${t('intActive')} ${e.target.options[e.target.selectedIndex].text}`);
    });

    // Основные кнопки
    document.getElementById('startBtn').addEventListener('click', organizeAllFiles);
    document.getElementById('startSingleBtn').addEventListener('click', openModal);
    document.getElementById('refreshBtn').addEventListener('click', () => {
        showToast(t('toastRefresh'));
        fetchFiles();
    });
    document.getElementById('clearLogBtn').addEventListener('click', async () => {
        await apiCall('/history', 'DELETE');
        appState.history = [];
        updateLog();
        showToast(t('toastCleared'));
    });

    // Поиск и фильтры
    document.getElementById('searchInput').addEventListener('input', (e) => {
        appState.searchQuery = e.target.value;
        updateFilesList();
    });
    document.getElementById('categoryFilter').addEventListener('change', (e) => {
        appState.selectedCategory = e.target.value;
        updateFilesList();
    });

    // Модальное окно
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('fileModal').addEventListener('click', (e) => {
        if (e.target.id === 'fileModal') closeModal();
    });

    // Начальная загрузка
    checkHealth();
    fetchFiles();
    fetchHistory();

    // Запуск интервалов
    startScanIntervals();
});

// ==================== ГОРЯЧИЕ КЛАВИШИ ====================

document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+O - запуск организации всех файлов
    if (e.ctrlKey && e.shiftKey && e.key === 'O') {
        e.preventDefault();
        organizeAllFiles();
    }
    
    // Esc - закрыть модальное окно
    if (e.key === 'Escape') {
        closeModal();
    }
});

console.log('✅ File Organizer Pro загружен успешно!');