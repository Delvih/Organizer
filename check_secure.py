from werkzeug.utils import secure_filename

filenames = [
    'Git-comand — копия.docx',
    'git-sequence — копия.docx',
    'Насыщенность — копия.docx',
]

print("=== ПРОВЕРКА secure_filename ===\n")
for f in filenames:
    secure = secure_filename(f)
    print(f"Исходное:  {f}")
    print(f"Обработано: {secure}")
    print(f"破损:  {secure != f}")
    print()
