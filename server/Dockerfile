FROM python:3.12-slim-bookworm

WORKDIR /server

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends libsndfile1 curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements first for dependency caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create directory for uploaded files
RUN mkdir -p uploaded_files

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
