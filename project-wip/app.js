const container = document.querySelector("#user-container");
const loadButton = document.querySelector("#load-btn");
const addButton = document.querySelector("[id='add-btn']");
const taskInput = document.querySelector("#task-title");
const priorityInput = document.querySelector("#task-priority");
let currentFilter = "all";
const filterButtonsContainer = document.querySelector("#filter-buttons");

loadButton.addEventListener("click", async () => {
    try{
        loadTasks()
    } catch(error) {
        console.log("Error:", error);
    }
})

addButton.addEventListener("click", async() => {
    const titleInputValue = taskInput.value.trim();
    const priorityInputValue = priorityInput.value;
    if (!titleInputValue) return;
    try{
        await fetch("http://127.0.0.1:8000/api/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: titleInputValue,
                priority: priorityInputValue
            })
        });

        taskInput.value = "";
        loadTasks();
    } catch(error) {
        console.log('Error: ', error);
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

async function loadTasks(){
    try {
        const response = await fetch("http://127.0.0.1:8000/api/tasks");
        const tasks = await response.json();

        let filteredTasks = tasks;
        if(currentFilter === "active") {
            filteredTasks = tasks.filter(task => !task.is_completed);
        } else if(currentFilter === "completed") {
            filteredTasks = tasks.filter(task => task.is_completed);
        }

        const html_cards = filteredTasks.map(task => 
            `<div class="card ${task.is_completed ? "completed" : ""}">
                <h3 class="${task.is_completed ? "completed" : ""}">${task.title}</h3>
                <p>Priority: <span class="priority-${task.priority}">${task.priority}</span></p>
                <input type="checkbox" class="complete-checkbox" data-id="${task.id}" ${task.is_completed ? "checked" : ""}>
                <button class="delete-btn" data-id="${task.id}">Delete</button>
            </div>`);
        container.innerHTML = html_cards.join("");
    } catch(error) {
        console.log("Error:", error);
}}
document.addEventListener("DOMContentLoaded", loadTasks);

filterButtonsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("filter-btn")) {
        currentFilter = e.target.dataset.filter;
        loadTasks();
    }
});