from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS
from werkzeug.utils import secure_filename
from typing import Any, Dict, List, Union, Tuple, Optional
import os
import shutil
import json
import logging
from logging.handlers import RotatingFileHandler
from datetime import datetime
from pathlib import Path
import threading

# ==================== КОНФИГУРАЦИЯ ====================

class Config:
    def __init__(self, config_file: str = 'config.json') -> None:
        self.config_file = config_file
        self.load_config()
    
    def load_config(self) -> None:
        try:
            with open(self.config_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.app = data.get('app', {})
                self.paths = data.get('paths', {})
                self.file_rules = data.get('file_rules', {})
                self.logging_config = data.get('logging', {})
                self.features = data.get('features', {})
        except Exception as e:
            print(f"Ошибка при загрузке конфигурации: {e}")
            raise

# ==================== ЛОГИРОВАНИЕ ====================

def setup_logger(app: Flask, config: Config) -> None:
    log_dir = Path(config.paths.get('log_file', './logs')).parent
    log_dir.mkdir(parents=True, exist_ok=True)
    
    handler = RotatingFileHandler(
        config.paths.get('log_file', './logs/organizer.log'),
        maxBytes=config.logging_config.get('max_bytes', 10485760),
        backupCount=config.logging_config.get('backup_count', 5)
    )
    
    formatter = logging.Formatter(
        config.logging_config.get('format', 
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    )
    handler.setFormatter(formatter)
    
    app.logger.addHandler(handler)
    app.logger.setLevel(config.logging_config.get('level', 'INFO'))

# ==================== FLASK APP ====================

BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
FRONT_DIR = os.path.join(BASE_DIR, 'frontend')

app = Flask(__name__, static_folder=FRONT_DIR, static_url_path='')
config = Config(os.path.join(BASE_DIR, 'config.json'))

# CORS конфигурация
CORS(app, resources={r"/api/*": {"origins": config.app.get('cors_origins', []) + ["http://localhost:5000", "http://127.0.0.1:5000"]}})

# Логирование
setup_logger(app, config)

# Initialize organizer variable
organizer: Optional['FileOrganizer'] = None

# ==================== ФРОНТЕНД ====================

@app.route('/')
@app.route('/index.html')
def index():
    return send_from_directory(FRONT_DIR, 'index.html')

# ==================== ИСТОРИЯ ====================

HISTORY_FILE = Path(BASE_DIR) / 'logs' / 'history.json'

def load_history() -> List[Dict[str, Any]]:
    if HISTORY_FILE.exists():
        with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_history(history: List[Dict[str, Any]]) -> None:
    """Сохраняет историю с потокобезопасностью"""
    with history_lock:
        try:
            HISTORY_FILE.parent.mkdir(parents=True, exist_ok=True)
            with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
                json.dump(history[-500:], f, ensure_ascii=False, indent=2)
        except Exception as e:
            app.logger.error(f"Ошибка при сохранении истории: {e}")

# Глобальные переменные
operation_history: List[Dict[str, Any]] = load_history()
history_lock = threading.Lock()  # Защита от race-conditions

# ==================== УТИЛИТЫ ====================

class FileOrganizer:
    def __init__(self, config: Config) -> None:
        self.config = config
        self.src_dir = Path(config.paths['source_directory'])
        self.dst_dir = Path(config.paths['destination_directory'])
        self.rules = config.file_rules
    
    def validate_paths(self) -> None:
        """Проверяет существование директорий"""
        if not self.src_dir.exists():
            raise ValueError(f"Source directory не существует: {self.src_dir}")
        if not self.dst_dir.exists() and config.features.get('create_folders_if_not_exist'):
            self.dst_dir.mkdir(parents=True, exist_ok=True)
    
    def get_file_category(self, filename: str) -> str:
        """Определяет категорию файла по расширению"""
        ext = Path(filename).suffix.lstrip('.').lower()
        
        for category, rules in self.rules.items():
            if ext in rules.get('extensions', []):
                return category
        return 'other'
    
    def organize_file(self, filename: str) -> Dict[str, Any]:
        """Перемещает файл в соответствующую папку"""
        try:
            # Валидация имени файла
            filename = secure_filename(filename)
            src_path = self.src_dir / filename
            
            # Проверки безопасности
            if not src_path.exists():
                return {'status': 'error', 'message': f'Файл не найден: {filename}'}
            
            if not src_path.is_file():
                return {'status': 'error', 'message': f'{filename} не является файлом'}
            
            # Получаем категорию
            category = self.get_file_category(filename)
            subfolder = self.rules[category].get('subfolder', category)
            dst_folder = self.dst_dir / subfolder
            dst_folder.mkdir(parents=True, exist_ok=True)
            
            dst_path = dst_folder / filename
            
            # Обработка конфликтов
            if dst_path.exists() and not config.features.get('override_existing_files'):
                base_name = Path(filename).stem
                ext = Path(filename).suffix
                dst_path = dst_folder / f"{base_name}_copy_{datetime.now().strftime('%Y%m%d_%H%M%S')}{ext}"
            
            # Перемещение файла
            shutil.move(str(src_path), str(dst_path))
            
            return {
                'status': 'success',
                'message': f'Файл перемещен в {subfolder}',
                'filename': filename,
                'category': category,
                'destination': str(dst_path)
            }
        
        except Exception as e:
            app.logger.error(f"Ошибка при организации файла {filename}: {str(e)}")
            return {'status': 'error', 'message': str(e)}
    
    def organize_all(self) -> Dict[str, Any]:
        """Организует все файлы в source_directory"""
        try:
            self.validate_paths()
            results: List[Dict[str, Any]] = []
            files = [f for f in os.listdir(self.src_dir) if (self.src_dir / f).is_file()]
            
            for filename in files:
                result = self.organize_file(filename)
                results.append(result)
                app.logger.info(f"Организован файл: {filename} - {result['status']}")
            
            return {
                'status': 'success',
                'total': len(files),
                'results': results
            }
        
        except Exception as e:
            app.logger.error(f"Ошибка при организации всех файлов: {str(e)}")
            return {'status': 'error', 'message': str(e)}

# Безопасная инициализация
try:
    _organizer = FileOrganizer(config)
    _organizer.validate_paths()
    organizer = _organizer
    app.logger.info("FileOrganizer инициализирован успешно")
except Exception as e:
    app.logger.error(f"Ошибка при инициализации FileOrganizer: {e}")
    app.logger.warning("Приложение запустится, но некоторые функции могут быть недоступны")

# ==================== API ENDPOINTS ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Проверка здоровья приложения"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/config', methods=['GET'])
def get_config():
    """Получить текущую конфигурацию"""
    if not organizer:
        return jsonify({'status': 'error', 'message': 'FileOrganizer не инициализирован'}), 500
        
    return jsonify({
        'source_directory': str(organizer.src_dir),
        'destination_directory': str(organizer.dst_dir),
        'file_rules': config.file_rules
    })

@app.route('/api/files', methods=['GET'])
def get_files():
    """Получить список файлов в source_directory"""
    try:
        if not organizer or not organizer.src_dir.exists():
            return jsonify({'status': 'error', 'message': 'Source directory не существует'}), 400
        
        files: List[Dict[str, Any]] = []
        for f in os.listdir(organizer.src_dir):
            file_path = organizer.src_dir / f
            if file_path.is_file():
                try:
                    files.append({
                        'name': f,
                        'size': file_path.stat().st_size,
                        'category': organizer.get_file_category(f),
                        'modified': datetime.fromtimestamp(file_path.stat().st_mtime).isoformat()
                    })
                except OSError as e:
                    app.logger.warning(f"Не могу получить информацию о файле {f}: {e}")
        
        return jsonify({'status': 'success', 'count': len(files), 'files': files})
    
    except Exception as e:
        app.logger.error(f"Ошибка при получении списка файлов: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/organize/single', methods=['POST'])
def organize_single_file():
    """Организовать один файл"""
    try:
        data = request.json
        if not data or 'filename' not in data:
            return jsonify({'status': 'error', 'message': 'Требуется filename'}), 400
        
        if not organizer:
            return jsonify({'status': 'error', 'message': 'FileOrganizer не инициализирован'}), 500
        
        result = organizer.organize_file(data['filename'])
        with history_lock:
            operation_history.append({
                'timestamp': datetime.now().isoformat(),
                'operation': 'organize_single',
                'result': result
            })
        save_history(operation_history)
        
        return jsonify(result)
    
    except Exception as e:
        app.logger.error(f"Ошибка при организации файла: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/organize/all', methods=['POST'])
def organize_all_files():
    """Организовать все файлы"""
    try:
        if not organizer:
            return jsonify({'status': 'error', 'message': 'FileOrganizer не инициализирован'}), 500
            
        result = organizer.organize_all()
        with history_lock:
            operation_history.append({
                'timestamp': datetime.now().isoformat(),
                'operation': 'organize_all',
                'result': result
            })
        save_history(operation_history)
        
        return jsonify(result)
    
    except Exception as e:
        app.logger.error(f"Ошибка при организации всех файлов: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/history', methods=['DELETE'])
def clear_history():
    """Очистить историю операций"""
    global operation_history
    with history_lock:
        operation_history = []
    save_history(operation_history)
    return jsonify({'status': 'success', 'message': 'История очищена'})

@app.route('/api/history', methods=['GET'])
def get_history():
    """Получить историю операций"""
    try:
        limit = request.args.get('limit', 50, type=int)
        return jsonify({
            'status': 'success',
            'count': len(operation_history[-limit:]),
            'history': operation_history[-limit:]
        })
    
    except Exception as e:
        app.logger.error(f"Ошибка при получении истории: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.errorhandler(404)
def not_found(error: Exception) -> Union[Response, Tuple[Response, int]]:
    if request.path.startswith('/api/'):
        return jsonify({'status': 'error', 'message': 'Endpoint не найден'}), 404
    return send_from_directory(FRONT_DIR, 'index.html')

@app.errorhandler(500)
def server_error(error: Exception) -> Tuple[Response, int]:
    return jsonify({'status': 'error', 'message': 'Внутренняя ошибка сервера'}), 500

# ==================== MAIN ====================

if __name__ == '__main__':
    app.logger.info(f"Запуск приложения {config.app.get('name', 'File Organizer')}")
    app.run(
        host=config.app.get('host', 'localhost'),
        port=config.app.get('port', 5000),
        debug=config.app.get('debug', False)
    )
