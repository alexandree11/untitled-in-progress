const container = document.querySelector("#user-container");
const addButton = document.querySelector("#add-btn");
const taskInput = document.querySelector("#task-title");
const descInput = document.querySelector("#task-desc");
const priorityInput = document.querySelector("#task-priority");
const searchInput = document.querySelector("#search-input");
const filterButtonsContainer = document.querySelector("#filter-buttons");

const API = "http://127.0.0.1:8000/api/tasks";

let allTasks = [];
let currentFilter = "all";
let searchQuery = "";

addButton.addEventListener("click", async () => {
    const title = taskInput.value.trim();
    const description = descInput.value.trim();
    const priority = priorityInput.value;
    if (!title) return;

    try {
        await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description, priority })
        });
        taskInput.value = "";
        descInput.value = "";
        loadTasks();
    } catch (error) {
        console.log("Error:", error);
    }
});

// DELETE Request
async function deleteTask(taskId) {
    await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}`, {
        method: "DELETE"
    });
    loadTasks();
}

// PATCH Request
async function toggleTaskComplete(taskId) {
    await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/complete`, {
        method: "PATCH"
    });
    loadTasks();
}

container.addEventListener("click", (e) => {
    const taskId = e.target.dataset.id;
    if (!taskId) return;

    if (e.target.classList.contains("delete-btn")) {
        deleteTask(taskId);
    } else if (e.target.classList.contains("complete-checkbox")) {
        toggleTaskComplete(taskId);
    }
});

async function loadTasks() {
    try {
        const response = await fetch(API);
        allTasks = await response.json();
        renderTasks();
    } catch (error) {
        console.log("Error:", error);
    }
}

function getVisibleTasks() {
    const q = searchQuery.trim().toLowerCase();

    return allTasks.filter(task => {
        const matchesStatus =
            currentFilter === "all" ||
            (currentFilter === "active" && !task.is_completed) ||
            (currentFilter === "completed" && task.is_completed);

        const matchesSearch =
            !q ||
            task.title.toLowerCase().includes(q) ||
            (task.description || "").toLowerCase().includes(q);

        return matchesStatus && matchesSearch;
    });
}

function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function renderTasks() {
    const tasks = getVisibleTasks();

    if (tasks.length === 0) {
        container.innerHTML = `<p class="empty">No tasks found</p>`;
        return;
    }

    container.innerHTML = tasks.map(task => `
        <div class="task-item ${task.is_completed ? "completed" : ""}">
            <input type="checkbox" class="complete-checkbox" data-id="${task.id}"
                   ${task.is_completed ? "checked" : ""}>
            <div class="task-info">
                <h3 class="task-title">${escapeHTML(task.title)}</h3>
                ${task.description
                    ? `<p class="task-desc">${escapeHTML(task.description)}</p>`
                    : ""}
            </div>
            <span class="priority-${task.priority}">${task.priority}</span>
            <button class="delete-btn" data-id="${task.id}">Delete</button>
        </div>
    `).join("");
}

filterButtonsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("filter-btn")) {
        currentFilter = e.target.dataset.filter;
        loadTasks();
    }
});


document.addEventListener("DOMContentLoaded", loadTasks);