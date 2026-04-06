import json
from pathlib import Path

with open('config.json') as f:
    cfg = json.load(f)

src = Path(cfg['paths']['source_directory'])
dst = cfg['paths']['destination_directory']

print(f'Source: {src}')
print(f'Exists: {src.exists()}')
if src.exists():
    print(f'Files: {[f.name for f in list(src.glob("*"))[:5]]}')

print(f'\nDestination: {dst}')
print(f'Exists: {Path(dst).exists()}')
