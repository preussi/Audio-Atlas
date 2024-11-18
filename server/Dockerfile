# syntax = docker/dockerfile:1.4

FROM python:3.9.13-slim-bullseye

WORKDIR /server

# Copy requirements first for dependency caching
COPY ./requirements.txt . 

# Update package list and install libsndfile
RUN apt update && apt install -y libsndfile1

# Upgrade pip to the latest version
RUN pip install --upgrade pip

# Install Python dependencies
RUN pip install -r requirements.txt

# Copy the rest of the application files (if needed)
COPY . .

# Specify the command to run the application
CMD ["python", "main.py"]