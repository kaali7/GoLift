import subprocess
import sys

if __name__ == "__main__":
    if "prod" in sys.argv:
        subprocess.run(["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"])
    else:
        subprocess.run(["uvicorn", "app.main:app", "--reload"])