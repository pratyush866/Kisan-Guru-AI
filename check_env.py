import os

paths = [
    r"c:\Users\HP\OneDrive\Desktop\Kisan Gurur AI\.env",
    r"c:\Users\HP\OneDrive\Desktop\Kisan Gurur AI\fastapi-backend\.env",
    r"c:\Users\HP\OneDrive\Desktop\Kisan Gurur AI\flutter-frontend\.env",
    r"c:\Users\HP\OneDrive\Desktop\Kisan Gurur AI\ai-assistance-web\.env",
    r"c:\Users\HP\OneDrive\Desktop\.env",
    r"c:\Users\HP\.env",
]

for p in paths:
    abs_p = os.path.abspath(p)
    exists = os.path.exists(abs_p)
    print(f"{p} ({abs_p}): {exists}")
    if exists:
        try:
            with open(abs_p, "r") as f:
                content = f.read()
                print(f"Content length: {len(content)}")
                for line in content.splitlines():
                    if "=" in line:
                        parts = line.split("=", 1)
                        k = parts[0].strip()
                        v = parts[1].strip()
                        print(f"  Key: {k} (length of val: {len(v)})")
        except Exception as e:
            print(f"  Error reading: {e}")
