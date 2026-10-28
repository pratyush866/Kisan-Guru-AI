import os

start_dir = r"c:\Users\HP\OneDrive\Desktop\Kisan Gurur AI"
for root, dirs, files in os.walk(start_dir):
    for file in files:
        if file == '.env':
            print(f"Found: {os.path.join(root, file)}")
