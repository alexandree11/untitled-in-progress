import json

class Task:
    def __init__(self, task_id, title, priority="medium"):
        self.id = task_id
        self.title = title
        self.priority = priority
        self.completed = False

    def mark_completed(self):
        self.completed = True

    # turn the object into dictionary to save in json
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "priority": self.priority,
            "completed": self.completed
        }


class TaskManager:
    def __init__(self):
        self.tasks = []  # list to store Task objects
        self._next_id = 1

    def add_task(self, title, priority="medium"):
        task = Task(self._next_id, title, priority)
        self.tasks.append(task)
        self._next_id += 1
        return task

    def mark_task_completed(self, task_id):
        for task in self.tasks:
            if task.id == task_id:
                task.mark_completed()
                return True
        return False

    def get_tasks(self, status=None):
        # get status conpleted or pending
        if status == "completed":
            return [t for t in self.tasks if t.completed]
        elif status == "pending":
            return [t for t in self.tasks if not t.completed]
        return self.tasks

    def save_to_json(self, filename="tasks.json"):
        # convert each task to dictionary and save it as file
        data = [t.to_dict() for t in self.tasks]
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        print(f"Tasks saved in {filename}")

manager = TaskManager()

manager.add_task("learn js", "high")
manager.add_task("github repo")
manager.add_task("install nodejs")

manager.mark_task_completed(1)
manager.save_to_json()