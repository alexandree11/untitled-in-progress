from fastapi import FastAPI
from pydantic import BaseModel
import sqlite3

class TaskCreate(BaseModel):
    title: str
    priority: str = 'medium'

app = FastAPI()

def get_db_connection():
    connect = sqlite3.connect("tasks.db")
    connect.row_factory = sqlite3.Row
    return connect

def init_db():
    with get_db_connection() as connect:
        connect.execute("""
CREATE TABLE IF NOT EXISTS tasks(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    is_completed BOOLEAN DEFAULT 0)""")

init_db()

@app.get("/api/tasks")
def get_tasks():
    connect = get_db_connection()
    tasks = connect.execute('SELECT * FROM tasks').fetchall()
    connect.close()
    return [dict(task) for task in tasks]

@app.post("/api/tasks")
def create_task(task: TaskCreate):
    connect = get_db_connection()
    cursor = connect.cursor()
    cursor.execute("INSERT INTO tasks (title, priority) VALUES (?, ?)",
                   (task.title, task.priority))
    connect.commit()
    connect.close()
    return {"message": "Task created successfully."}

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int):
    connect = get_db_connection()
    cursor = connect.cursor()
    cursor.execute("DELETE FROM tasks WHERE id=?", (task_id,))
    connect.commit()
    connect.close()
    return {"message": "Task deleted successfully."}

@app.patch("/api/tasks/{task_id}/complete")
def toggle_task_complete(task_id: int):
    connect= get_db_connection()
    cursor = connect.cursor()
    cursor.execute("UPDATE tasks SET is_completed = NOT is_completed WHERE id=?",(task_id,))
    connect.commit()
    connect.close()
    return {"message": "Task status updated successfully"}