# Full-Stack Task Manager (WIP)

A lightweight task management web application built to practice **SQL**, **FastAPI**, and **vanilla JavaScript (DOM manipulation & Fetch API)**.

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (Async/Await, Fetch API, DOM)
- **Backend:** Python, FastAPI, Uvicorn
- **Database:** SQL (PostgreSQL schema / In-memory Python list)

## Project Structure

```text
project-wip/
├── index.html     # Main user interface
├── app.js         # Frontend logic & API interaction
├── main.py        # FastAPI server implementation
└── queries.sql    # Database schema & practice queries
```


## Getting Started:
1. Run the Backend (FastAPI)
Navigate to the project directory and start the Uvicorn server:

Bash:   
cd project-wip
python -m uvicorn main:app --reload

-Local Server: http://127.0.0.1:8000    
-Interactive API Docs (Swagger): http://127.0.0.1:8000/docs

2. Run the Frontend
Open index.html directly in your browser or run it using VS Code Live Server.

Features Completed  
[x] Fetch and render tasks from the backend (GET /api/tasks)    
[x] Add new tasks via UI form submission (POST /api/tasks)  
[x] Designed core SQL schema and CRUD queries for tasks 

Roadmap / Next Steps    
[ ] Connect a persistent SQL database (PostgreSQL / SQLite) 
[ ] Implement ORM integration (SQLAlchemy)  
[ ] Add Task Deletion (DELETE /api/tasks/{id})  
[ ] Add Status/Priority Updates (PATCH /api/tasks/{id}) 