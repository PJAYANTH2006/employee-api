Employee Management API (DevOps Project)

A simple CRUD REST API built with Java Spring Boot that stores data in a JSON file. This project is configured with Maven for building, GitHub Actions for CI, and Docker for containerization.

🛠 Tech Stack

Language: Java 17

Framework: Spring Boot 3

Build Tool: Maven

Database: JSON File (No external DB required)

DevOps: GitHub Actions & Docker

🚀 How to Run Locally

1. Prerequisites

Java 17+ installed

Maven installed (or use mvnw)

2. Build and Run

mvn clean package
java -jar target/employee-api-0.0.1-SNAPSHOT.jar


The app will start on http://localhost:8080.

🧪 API Endpoints

| Method | Endpoint | Description | Payload Example |
|TM|TM|TM|TM|
| GET | /api/employees | List all employees | - |
| GET | /api/employees/{id} | Get specific employee | - |
| POST | /api/employees | Add a new employee | {"id":"1", "name":"John", "role":"Dev", "email":"j@test.com"} |
| DELETE | /api/employees/{id} | Delete an employee | - |

🐳 Docker Support

To build and run as a container:

# Build the image
docker build -t employee-api .

# Run the container (Mapping port 8080)
docker run -p 8080:8080 employee-api


⚙️ CI/CD Pipeline

The project includes a GitHub Actions workflow .github/workflows/ci-pipeline.yml.
Every time you push to main, it will:

Checkout code

Install Java

Run Unit Tests

Build the JAR file

Build the Docker image