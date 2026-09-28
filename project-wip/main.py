from fastapi import FastAPI

app = FastAPI()

tasks_db = [
    {"id": 1, "title": "Learn SQL", "priority": "high", "is_completed": False},
    {"id": 2, "title": "Do a commit", "priority": "low", "is_completed": False}
]

@app.get("/api/tasks")
def get_tasks():
    return tasks_db

@app.post("/api/tasks")
def create_task(task: dict):
    tasks_db.append(task)
    return {"message": "Task created", "task": task}