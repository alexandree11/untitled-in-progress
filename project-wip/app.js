const container = document.querySelector("#user-container");
const addTaskButton = document.querySelector("#add-btn");
const taskInput = document.querySelector("#task-title");
const descInput = document.querySelector("#task-desc");
const priorityInput = document.querySelector("#task-priority");
const searchInput = document.querySelector("#search-input");
const filterButtonsContainer = document.querySelector("#filter-buttons");
const openModalBtn = document.querySelector("#open-modal-btn");
const closeModalBtn = document.querySelector("#close-modal-btn");
const modalOverlay = document.querySelector("#modal-overlay");
const deadlineInput = document.querySelector("#task-deadline");

const API = "http://127.0.0.1:8000/api/tasks";

let allTasks = [];
let currentFilter = "all";
let searchQuery = "";

container.addEventListener("click", (e) => {
    const target = e.target.closest("[data-id]");
    if (!target) return
    const taskId = target.dataset.id;

    if (target.classList.contains("delete-btn")) {
        deleteTask(taskId);
    } else if ((target.classList.contains("complete-checkbox"))
        || (target.classList.contains("return-btn"))) {
        toggleTaskComplete(taskId);
    } else if ((target.classList.contains("pin-btn"))
        || (target.classList.contains("unpin-btn"))) {
        toggleTaskPin(taskId);
    }
});

function openModal() {
    modalOverlay.classList.remove("hidden");
    taskInput.focus();
}

function closeModal() {
    modalOverlay.classList.add("hidden");
}

openModalBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);

// close on background click
modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
});

// close on Esc
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
});

addTaskButton.addEventListener("click", async () => {
    const title = taskInput.value.trim();
    const description = descInput.value.trim();
    const priority = priorityInput.value;
    const deadline = deadlineInput.value
        ? new Date(deadlineInput.value).toISOString()
        : null;

    if (!title) return;

    try {
        const response = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description, priority, deadline })
        });

        if (!response.ok) {
            console.log("Server response:", await response.text());
            return;
        }

        taskInput.value = "";
        descInput.value = "";
        deadlineInput.value = "";
        closeModal();
        await loadTasks();
    } catch (error) {
        console.log("Error:", error);
    }
});

// DELETE Request
async function deleteTask(taskId) {
    const confirmDelete = confirm("Do you want to delete this task?");

    if (confirmDelete) {
        await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}`, {
            method: "DELETE"
        });
        loadTasks();
    }
}

// PATCH Request
async function toggleTaskComplete(taskId) {
    await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/complete`, {
        method: "PATCH"
    });
    loadTasks();
}

async function toggleTaskPin(taskId) {
    await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/pin`, {
        method: "PATCH"
    });
    loadTasks();
}

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

    return allTasks
        .filter(task => {
            const matchesStatus =
                currentFilter === "all"
                || (currentFilter === "active" && !task.is_completed)
                || (currentFilter === "completed" && task.is_completed);

            const matchesSearch =
                !q ||
                task.title.toLowerCase().includes(q) ||
                (task.description || "").toLowerCase().includes(q);

            return matchesStatus && matchesSearch;
        })

        .sort((a, b) => {
            if (b.is_pinned !== a.is_pinned) {
                return b.is_pinned - a.is_pinned;
            }
            return ((b.pinned_at || "").localeCompare((a.pinned_at || "")));
        });
}

function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function renderTasks() {
    const tasks = getVisibleTasks();
    
    // taskCounter(tasks);

    if (tasks.length === 0) {
        container.innerHTML = `<p class="empty">No tasks found</p>`;
        return;
    }



/***********************************************
REPLACE CHECKBOX WITH "Completed" BUTTON
CHANGE CLASS STYLE FROM TASK-DEADLINE TO A NEW ONE
REWORK CLASS STYLE .TASK-DEADLINE
CHANGE CLASS STYLE FROM TASK-DEADLINE TO A NEW ONE
MAYBE THINK ABOUT STYLING
STYLIZE WITH A PIN/UNPIN BUTTON
***********************************************/
    container.innerHTML = tasks.map(task => `
        <div class="task-item ${task.is_completed ? "completed" : ""}">     
            <input type="checkbox" class="complete-checkbox" data-id="${task.id}"
                ${task.is_completed                                                                     
                    ? "checked" 
                    : ""}>
            <div class="task-info">
                <h3 class="task-title">${escapeHTML(task.title)}</h3>
                ${task.description
                    ? `<p class="task-desc">${escapeHTML(task.description)}</p>`
                    : ""}
                ${task.date_created
                    ? `<p class="task-deadline">Created ${addedTime(task.date_created)}</p>`
                    : ""}
                ${task.deadline && !task.is_completed 
                    ? `<p class="task-deadline">Due in ${deadlineTimeLeft(task.deadline)}</p>`
                    : ""}
                ${task.is_completed && task.date_completed
                    ? `<p class="task-deadline">Completed in ${completionTime(task.date_created, task.date_completed)}</p>`
                    : ""}
            </div>
            <span class="priority-${task.priority}">${task.priority}</span>                             
            ${task.is_completed
                ? `<button class="return-btn" data-id="${task.id}"><span>Return</span></button>` : ""}
            ${task.is_pinned                                                                            
                ? `<button class="unpin-btn" data-id="${task.id}"><span>Unpin</span></button>`
                : `<button class="pin-btn" data-id="${task.id}"><span>Pin</span></button>`}             
            
            <button class="delete-btn" data-id="${task.id}"><span>Delete</span></button>                
        </div>
    `).join("");
}

filterButtonsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("filter-btn")) {
        currentFilter = e.target.dataset.filter;
        loadTasks();
    }
});

function pluralize(count, word) {
    return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function deadlineTimeLeft(deadline) {
    if (!deadline) { return ""; }

    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate - Date.now();

    if (timeDiff <= 0) {
        return "Overdue";
    }

    return timeCountTexted(timeDiff);
}

function completionTime(dateCreated, dateCompleted) {
    if(!dateCreated || !dateCompleted) { return "";}

    const creationDate = new Date(dateCreated)
    const completionDate = new Date(dateCompleted);
    const timeDiff = completionDate - creationDate;

    return timeCountTexted(timeDiff);
}

function addedTime(dateCreated) {
    if(!dateCreated) { return ""; }

    const creationDate = new Date(dateCreated);
    const timeDiff = Date.now() - creationDate;

    if(timeDiff <= 5000) { return "just now"; }         // THINK ABOUT WHAT IF timeDiff < 0

    return (timeCountTexted(timeDiff) + " ago");
}

function timeCountTexted(timeDiff) {
    const days = Math.floor(timeDiff / 86400000);
    const restDays = timeDiff % 86400000;
    const hours = Math.floor(restDays / 3600000);
    const restHours = restDays % 3600000;
    const minutes = Math.floor(restHours / 60000);
    const restMinutes = restHours % 60000;
    const seconds = Math.floor(restMinutes / 1000);

    const timeParts = [[days, 'day'], [hours, 'hour'], [minutes, 'minute'], [seconds, 'second']];

    const timeLeft = timeParts
        .filter(p => p[0] > 0)
        .slice(0, 2)
        .map(p => `${pluralize(p[0], p[1])}`)
        .join(", ");

    return (timeLeft || "less than a second");
}

/* function taskCounter(activeTasks) {
    const taskCount = document.querySelector("#task-count");
    taskCount.textContent = `Showing ${activeTasks} of ${pluralize(allTasks.length, "task")}`;
} */

document.addEventListener("DOMContentLoaded", loadTasks);