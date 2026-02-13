import os
import re

pdf_dir = r'h:\Github\1IMPORTANT\Resume Builder\src\templates\pdf'

# Correct import block for pdfFormatting
def get_new_import_block(existing_members):
    # Ensure members are unique and cleaned
    members = [m.strip() for m in existing_members.split(',')]
    members = [m for m in members if m and m != ',']
    
    # Standard members we want to ensure are there if they were there before or are new
    standard_new = [
        'getPDFDateSeparator',
        'getPDFBodyTextWeight',
        'getPDFParagraphSpacing',
        'getPDFSectionTitleSpacing'
    ]
    
    for s in standard_new:
        if s not in members:
            members.append(s)
            
    # Remove any duplicates
    unique_members = []
    seen = set()
    for m in members:
        if m not in seen:
            unique_members.append(m)
            seen.add(m)
            
    return "import {\n    " + ",\n    ".join(unique_members) + "\n} from '../../lib/pdfFormatting';"

for filename in os.listdir(pdf_dir):
    if filename.endswith('.tsx'):
        filepath = os.path.join(pdf_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # If the file starts with "import {" but is missing "@react-pdf/renderer", it's broken
        if 'import {' in content and '@react-pdf/renderer' not in content:
            print(f"Restoring {filename}...")
            # We need to put back the first two imports.
            # Most templates have:
            # import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer';
            # import type { ResumeData, FormattingOptions } from '../../types';
            
            # Since I can't know exactly what was swallowed, I'll try to find the captured part.
            # The current content starts with something like:
            # import {
            #     Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer';
            # import type { ResumeData, FormattingOptions } from '../../types';
            # import {
            #     getPDFFontFamily, ...
            # } from '../../lib/pdfFormatting';
            
            # Wait, let's look at TechnicalPDFTemplate.tsx again.
            # 1: import {
            # 2:     Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer';
            
            # It seems it didn't swallow it completely, but merged them into one 'import {'?
            pass

# Actually, I'll just use a safer approach: 
# Find the block ending in '../../lib/pdfFormatting'; and fix it.
# And separately find if any file is missing the @react-pdf/renderer import.

def fix_file(content):
    # Pattern to find the specific broken import block
    # It starts with "import {" and ends with "../../lib/pdfFormatting';"
    # We want to make sure we only match the one for pdfFormatting.
    
    # First, let's see if we have a merged import.
    # If "import {" is followed by "Document," and eventually "from '../../lib/pdfFormatting';"
    merged_pattern = re.compile(r'import\s+{\s*(.*?Document,.*?)\n} from \'\.\./\.\./lib/pdfFormatting\';', re.DOTALL)
    
    match = merged_pattern.search(content)
    if match:
        full_blob = match.group(1)
        # Split the blob into parts.
        # It likely contains: "Document, ... } from '@react-pdf/renderer';\nimport type { ... } from '../../types';\nimport {\n    getPDFFontFamily, ..."
        
        # This is getting complex. Let's just use the file content I saw.
        pass

# Strategy:
# 1. Identify all files in src/templates/pdf/
# 2. For each file, check if it's broken.
# 3. If broken, reconstruct the imports based on a known good template structure.

templates = [
    'AcademicPDFTemplate.tsx', 'ClassicPDFTemplate.tsx', 'CompactPDFTemplate.tsx',
    'CreativePDFTemplate.tsx', 'ElegantPDFTemplate.tsx', 'ExecutivePDFTemplate.tsx',
    'LaTeXPDFTemplate.tsx', 'MinimalPDFTemplate.tsx', 'ModernPDFTemplate.tsx',
    'TechnicalPDFTemplate.tsx'
]

correct_header = """import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData, FormattingOptions } from '../../types';
import {
    getPDFFontFamily,
    getPDFBulletSymbol,
    getPDFColorValue,
    getPDFPagePadding,
    getPDFFontSize,
    getPDFNameSize,
    getPDFSectionTitleSize,
    getPDFSectionMargin,
    getPDFBulletIndent,
    getPDFEntrySpacing,
    getPDFBulletGap,
    getPDFSectionHeaderStyle,
    getPDFSkillSeparator,
    getPDFDateFormat,
    getPDFDateSeparator,
    getPDFBodyTextWeight,
    getPDFParagraphSpacing,
    getPDFSectionTitleSpacing
} from '../../lib/pdfFormatting';
import { parseBoldTextPDF } from '../../lib/parseBoldText';"""

for filename in templates:
    filepath = os.path.join(pdf_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Find where the imports end.
    # We'll look for the first line that is NOT an import and NOT empty.
    body_start = 0
    for i, line in enumerate(lines):
        if line.strip() and not line.strip().startswith('import') and not line.strip().startswith('}') and not line.strip().startswith(',') and not 'from \'' in line:
            body_start = i
            break
            
    # Actually, let's just find the first "const" or "export function" or "/**"
    for i, line in enumerate(lines):
        if line.startswith('const') or line.startswith('export function') or line.startswith('/**'):
            body_start = i
            break
            
    body = "".join(lines[body_start:])
    
    # Check if we need getPDFFontFamily (Modern and Technical use it, others use 'NotoSerif' directly usually)
    # But it's safer to include all standard ones.
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(correct_header + "\n\n" + body)

print("Done restoring all PDF templates.")
