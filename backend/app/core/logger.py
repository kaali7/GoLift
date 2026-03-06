from loguru import logger
import sys

logger.remove()

logger.add(
    sys.stdout,
    level="INFO",
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
           "<level>{level}</level> | "
           "<cyan>{module}</cyan>:<cyan>{line}</cyan> - "
           "<level>{message}</level>",
    colorize=True,
)
# This code snippet is configuring a second log handler using Loguru in Python. Here's what it's
# doing:

logger.add(
    "logs/app_{time:YYYY-MM-DD-HH-mm-ss}.log",
    rotation="10 MB",
    retention="14 days",
    level="DEBUG",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {module}:{line} - {message}",
)

__all__ = ["logger"]

