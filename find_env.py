import os

paths_to_check = [
    r"c:\Users\HP\OneDrive\Desktop\Kisan Gurur AI",
    r"c:\Users\HP\OneDrive\Desktop",
    r"c:\Users\HP"
]

for start_dir in paths_to_check:
    print(f"Searching in: {start_dir}")
    for file in os.listdir(start_dir):
        if file.startswith('.env'):
            print(f"Found: {os.path.join(start_dir, file)}")

