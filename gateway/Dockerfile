FROM python:3.11-slim
WORKDIR /app

# Install system dependencies including curl for healthchecks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (layer-cached independently of source changes)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy gateway source
COPY app.py .

# NOTE: The docker-compose build context for this service must be set to the
# repository root (context: .) so that shared/python is accessible.
# The compose file uses: context: . / dockerfile: gateway/Dockerfile
COPY shared/python /app/shared/python

ENV PORT=7411
# Make alchemical_core importable: from alchemical_core.llm import AlchemicalLLM
ENV PYTHONPATH=/app/shared/python

CMD ["sh","-c","uvicorn app:app --host 0.0.0.0 --port ${PORT} --workers 1 --log-config /dev/null"]
