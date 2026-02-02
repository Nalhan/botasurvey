# Docker Setup Guide

This project is configured to run as a Docker container using Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Setup Instructions

1.  **Clone the Repository:**
    ```bash
    git clone <repository-url>
    cd botasurvey
    ```

2.  **Environment Variables:**
    Create a `.env.local` file in the root directory and fill in the required variables (refer to `.env.example` if available).
    ```bash
    cp .env.example .env.local
    ```

3.  **Build and Run:**
    Use Docker Compose to build and start the application.
    ```bash
    docker-compose up -d --build
    ```

4.  **Access the Application:**
    The application will be available at `http://localhost:3000`.

## Database Persistence

The SQLite database (`db.sqlite`) is mounted as a volume in the Docker container. This ensures that your data persists even if the container is stopped or removed.

## Troubleshooting

- **Logs:** To view the application logs, run:
  ```bash
  docker-compose logs -f botasurvey
  ```
- **Stopping:** To stop the application:
  ```bash
  docker-compose stop
  ```
- **Resetting:** To remove the containers and images:
  ```bash
  docker-compose down --rmi all
  ```
