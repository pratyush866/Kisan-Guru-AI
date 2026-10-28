import os
import re

base = os.path.join("ai-assistance-web", "src")
missing = []
for root, dirs, files in os.walk(base):
    for f in files:
        if f.endswith(".js"):
            p = os.path.join(root, f)
            with open(p, "r", encoding="utf-8") as fh:
                content = fh.read()
                # matches: from './something.js' or import './something.js'
                imports = re.findall(r'(?:from|import)\s+[\'"]([^\'"]+)[\'"]', content)
                for imp in imports:
                    if imp.startswith("."):
                        target = os.path.normpath(os.path.join(root, imp))
                        # Check exact file or with .js
                        if not os.path.exists(target) and not os.path.exists(target + ".js"):
                            missing.append((p, imp, target))

for m in missing:
    print(f"MISSING: {m[0]} -> {m[1]}")

if not missing:
    print("SUCCESS: All module imports exist!")
