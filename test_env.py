import os

root_env = r"c:\Users\HP\OneDrive\Desktop\Kisan Gurur AI\.env"
backend_env = r"c:\Users\HP\OneDrive\Desktop\Kisan Gurur AI\fastapi-backend\.env"

print("root_env exists:", os.path.exists(root_env))
print("backend_env exists:", os.path.exists(backend_env))

if os.path.exists(root_env):
    print("root_env size:", os.path.getsize(root_env))
if os.path.exists(backend_env):
    print("backend_env size:", os.path.getsize(backend_env))
