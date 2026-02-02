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

2.  **Prepare the Environment:**
    - Create a `.env.local` file from the example.
    - Create a `data` directory for the database.
    ```bash
    cp .env.example .env.local
    mkdir data
    ```

3.  **Build and Run:**
    Use Docker Compose to build and start the application.
    ```bash
    docker-compose -f docker-compose-example.yml up -d --build
    ```

4.  **Access the Application:**
    The application will be available at `http://localhost:3000`.

## Database Persistence

The application uses a SQLite database located in the `data` directory. The `docker-compose-example.yml` is configured to mount this directory as a volume (`./data:/app/data`), ensuring that your data persists even when containers are recreated.

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
