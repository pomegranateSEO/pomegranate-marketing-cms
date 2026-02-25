import sys
from pypdf import PdfReader

for file in ["content-model-v3.pdf", "content-model-amendments-v3.pdf", "project-roadmap-v3.pdf"]:
    print(f"Reading {file}")
    try:
        reader = PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        with open(file + ".txt", "w", encoding="utf-8") as f:
            f.write(text)
    except Exception as e:
        print(f"Failed to read {file}: {e}")
