import os
import re

pdf_dir = r'h:\Github\1IMPORTANT\Resume Builder\src\templates\pdf'

new_imports = """    getPDFDateFormat,
    getPDFDateSeparator,
    getPDFBodyTextWeight,
    getPDFParagraphSpacing,
    getPDFSectionTitleSpacing
} from '../../lib/pdfFormatting';"""

# Regex to find the corrupted import block
# It usually ends with ", getPDFDateSeparator } from '../../lib/pdfFormatting';"
corrupted_pattern = re.compile(r'getPDFDateFormat,\s*,\s*getPDFDateSeparator\s*}\s*from\s*\'\.\./\.\./lib/pdfFormatting\';', re.MULTILINE)

# Also handle cases where it might be slightly different or missing commas
# Actually, let's just find the whole import { ... } from '../../lib/pdfFormatting'; block and replace it correctly.
# But different templates have different subsets of imports.
# Better to focus on the tail end.

for filename in os.listdir(pdf_dir):
    if filename.endswith('.tsx'):
        filepath = os.path.join(pdf_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Look for the broken line: ", getPDFDateSeparator } from '../../lib/pdfFormatting';"
        # and replace the tail of the import block.
        broken_line = re.compile(r',\s*getPDFDateSeparator\s*}\s*from\s*\'\.\./\.\./lib/pdfFormatting\';')
        
        if broken_line.search(content):
            print(f"Fixing {filename}...")
            # We want to replace everything from getPDFDateFormat to the end of the import.
            # But getPDFDateFormat might not be the only thing before it.
            # Let's just find the start of the import block for pdfFormatting.
            
            # Pattern: find "import { ... } from '../../lib/pdfFormatting';"
            # We'll capture the parts we want to keep.
            full_pattern = re.compile(r'import\s+{\s*(.*?),\s*,\s*getPDFDateSeparator\s*}\s*from\s*\'\.\./\.\./lib/pdfFormatting\';', re.DOTALL)
            
            new_content = full_pattern.sub(r"import {\n    \1,\n    getPDFDateSeparator,\n    getPDFBodyTextWeight,\n    getPDFParagraphSpacing,\n    getPDFSectionTitleSpacing\n} from '../../lib/pdfFormatting';", content)
            
            if new_content == content:
                # Try a simpler replacement if the above failed
                new_content = content.replace(", getPDFDateSeparator } from '../../lib/pdfFormatting';", "\n    getPDFDateSeparator,\n    getPDFBodyTextWeight,\n    getPDFParagraphSpacing,\n    getPDFSectionTitleSpacing\n} from '../../lib/pdfFormatting';")
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)

print("Done.")
