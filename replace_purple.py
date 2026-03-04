import os
import re
import sys

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replacements to match theme
    replacements = [
        (r'text-purple-\d+', 'text-brand-aqua'),
        (r'bg-purple-\d+', 'bg-brand-blue'),
        (r'bg-purple-\d+/\d+', 'bg-brand-blue/20'),
        (r'border-purple-\d+', 'border-brand-aqua'),
        (r'from-blue-\d+', 'from-brand-blue'),
        (r'from-blue-\d+/\d+', 'from-brand-blue/20'),
        (r'to-purple-\d+', 'to-brand-aqua'),
        (r'to-purple-\d+/\d+', 'to-brand-aqua/20'),
        (r'hover:from-blue-\d+', 'hover:from-brand-blue/80'),
        (r'hover:to-purple-\d+', 'hover:to-brand-aqua/80'),
        (r'text-yellow-300', 'text-brand-aqua'), # a random yellow text found in AiEngineeringPage
    ]

    original = content
    for pattern, rep in replacements:
        content = re.sub(pattern, rep, content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

def main():
    target_dir = sys.argv[1]
    for root, dirs, files in os.walk(target_dir):
        for file in files:
            if file.endswith('.jsx') or file.endswith('.js'):
                replace_in_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
