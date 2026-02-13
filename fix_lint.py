import os

pdf_dir = r'h:\Github\1IMPORTANT\Resume Builder\src\templates\pdf'

for filename in os.listdir(pdf_dir):
    if filename.endswith('.tsx'):
        filepath = os.path.join(pdf_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Fix redundant escape in bullet regex
        new_content = content.replace(r'/\^[•\-\*]\s*/', r'/^[•\-*]\s*/')
        
        if new_content != content:
            print(f"Fixing lint error in {filename}...")
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)

print("Done.")
