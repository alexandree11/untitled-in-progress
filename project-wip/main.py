from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Optional
import sqlite3

class TaskCreate(BaseModel):
    title: str
    priority: str = 'medium'
    description: str = ''
    deadline: Optional[str] = None

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
                description TEXT DEFAULT '',
                is_completed BOOLEAN DEFAULT 0)""")

def check_add_column(column_name, column_definition):
    connect = get_db_connection()
    column_rows = connect.execute('PRAGMA table_info(tasks)')
    existing_columns = []
    for column_row in column_rows:
        existing_columns.append(column_row["name"])
    if column_name not in existing_columns:
        connect.execute(f"ALTER TABLE tasks ADD COLUMN {column_name} {column_definition}")
    connect.commit()
    connect.close()

def upd_dates():
    timenow = datetime.now(timezone.utc).isoformat()
    connect = get_db_connection()
    connect.execute("""
        UPDATE tasks 
        SET date_created=? 
        WHERE date_created IS NULL
        """,(timenow,))
    connect.commit()
    connect.close()

init_db()
check_add_column('is_pinned','BOOLEAN DEFAULT 0')
check_add_column('pinned_at','TEXT DEFAULT NULL')
check_add_column('date_created', 'TEXT DEFAULT NULL')
check_add_column('date_completed', 'TEXT DEFAULT NULL')
check_add_column('deadline', 'TEXT DEFAULT NULL')
upd_dates()

@app.get("/api/tasks")
def get_tasks():
    connect = get_db_connection()
    tasks = connect.execute('SELECT * FROM tasks').fetchall()
    connect.close()
    return [dict(task) for task in tasks]

@app.post("/api/tasks")
def create_task(task: TaskCreate):
    timenow = datetime.now(timezone.utc).isoformat()
    connect = get_db_connection()
    connect.execute("""
        INSERT INTO tasks (title, priority, description, deadline, date_created) 
        VALUES (?, ?, ?, ?, ?)
        """, (task.title, task.priority, task.description, task.deadline, timenow))
    connect.commit()
    connect.close()
    return {"message": "Task created successfully."}

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int):
    connect = get_db_connection()
    connect.execute("""
        DELETE FROM tasks 
        WHERE id=?
        """, (task_id,))
    connect.commit()
    connect.close()
    return {"message": "Task deleted successfully."}

@app.patch("/api/tasks/{task_id}/complete")
def toggle_task_complete(task_id: int):
    timenow = datetime.now(timezone.utc).isoformat()
    connect = get_db_connection()
    connect.execute("""
        UPDATE tasks 
        SET is_completed = NOT is_completed, 
            date_completed = CASE WHEN is_completed = 1 THEN NULL ELSE ? END 
        WHERE id=?
        """, (timenow, task_id))
    connect.commit()
    connect.close()
    return {"message": "Task status updated successfully"}

@app.patch("/api/tasks/{task_id}/pin")
def toggle_pin_task(task_id: int):
    timenow = datetime.now(timezone.utc).isoformat()
    connect = get_db_connection()
    connect.execute("""
        UPDATE tasks 
        SET is_pinned = NOT is_pinned, 
            pinned_at = CASE WHEN is_pinned = 1 THEN NULL ELSE ? END 
        WHERE id=?
        """,(timenow, task_id))
    connect.commit()
    connect.close()
    return {"message": "Task pin status updated successfully"}
