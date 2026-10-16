/* 
    write the comments
*/
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
const taskCounterText = document.querySelector("#task-counter");

/* 
    write the comments
*/
const API = "http://127.0.0.1:8000/api/tasks";

/* 
    write the comments
*/
let allTasks = [];
let currentFilter = "all";
let searchQuery = "";

/* 
    write the comments
*/
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

/* 
    write the comments
*/
function openModal() {
    modalOverlay.classList.remove("hidden");
    taskInput.focus();
}

/* 
    write the comments
*/
function closeModal() {
    modalOverlay.classList.add("hidden");
}

/* 
    write the comments
*/
openModalBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);

/* 
    write the comments
*/
modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
});

/* 
    write the comments
*/
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
});

/* 
    write the comments
*/
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

/* 
    write the comments
*/
async function deleteTask(taskId) {
    const confirmDelete = confirm("Do you want to delete this task?");

    if (confirmDelete) {
        await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}`, {
            method: "DELETE"
        });
        loadTasks();
    }
}

/* 
    write the comments
*/
async function toggleTaskComplete(taskId) {
    await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/complete`, {
        method: "PATCH"
    });
    loadTasks();
}

/* 
    write the comments
*/
async function toggleTaskPin(taskId) {
    await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/pin`, {
        method: "PATCH"
    });
    loadTasks();
}

/* 
    write the comments
*/
async function loadTasks() {
    try {
        const response = await fetch(API);
        allTasks = await response.json();
        renderTasks();
    } catch (error) {
        console.log("Error:", error);
    }
}

/* 
    write the comments
*/
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

/* 
    write the comments
*/
function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

/* 
    write the comments
*/
function renderTasks() {
    const tasks = getVisibleTasks();
    
    updateTaskCounter(tasks.length);

    if (tasks.length === 0) {
        container.innerHTML = `<p class="empty">No tasks found</p>`;
        return;
    }



/*
    REPLACE CHECKBOX WITH "Completed" BUTTON
    CHANGE CLASS STYLE FROM TASK-DEADLINE TO A NEW ONE
    REWORK CLASS STYLE .TASK-DEADLINE
    CHANGE CLASS STYLE FROM TASK-DEADLINE TO A NEW ONE
    MAYBE THINK ABOUT STYLING
    STYLIZE WITH A PIN/UNPIN BUTTON
*/
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
                    ? `<p class="task-created-time" data-created="${task.date_created}">${addedTime(task.date_created)}</p>`
                    : ""}
                ${task.deadline && !task.is_completed 
                    ? `<p class="task-deadline-time" data-deadline="${task.deadline}">${deadlineTimeLeft(task.deadline)}</p>`
                    : ""}
                ${task.is_completed && task.date_completed
                    ? `<p class="task-completed-time">Completed in ${completionTime(task.date_created, task.date_completed)}</p>`
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

/* 
    write the comments
*/
filterButtonsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("filter-btn")) {
        currentFilter = e.target.dataset.filter;
        loadTasks();
    }
});

/* 
    write the comments
*/
function pluralize(count, word) {
    return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/* 
    write the comments
*/
function deadlineTimeLeft(deadline) {
    if (!deadline) { return ""; }

    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate - Date.now();

    if (timeDiff <= 0) {
        return "Overdue";
    }

    return ("Due in " + timeCountTexted(timeDiff));
}

/* 
    write the comments
*/
function completionTime(dateCreated, dateCompleted) {
    if(!dateCreated || !dateCompleted) { return "";}

    const creationDate = new Date(dateCreated)
    const completionDate = new Date(dateCompleted);
    const timeDiff = completionDate - creationDate;

    return timeCountTexted(timeDiff);
}

/* 
    write the comments
*/
function addedTime(dateCreated) {
    if(!dateCreated) { return ""; }

    const creationDate = new Date(dateCreated);
    const timeDiff = Date.now() - creationDate;

    if(timeDiff <= 60000) { return "Created less than a minute ago"; }         // THINK ABOUT WHAT IF timeDiff < 0

    return ("Created " + timeCountTexted(timeDiff) + " ago");
}

/* 
    a function that counts days, hours, minutes based on the time difference
    timeDiff is difference between the date task was created and current time
                                   the date task is due and current time
                                   the date task was created and completed (basically completion time)
    we use Math.floor function to get rid of floating point numbers and keep them integers
    Math.floor function can be changed to Math.ceil function which is better for counting
    time until deadline, but i dont think its a big deal

    in timeParts we create a list of pairs: 1st element is the count
                                            2nd element is the measurement

    in timeLeft we using: 
        .filter() we get rid of zeros like 0 days, 0 hours by checking if the 1st
                element is greater than zero
        .slice() creating a list of minimum size of 0 and maximum of 2 elements(pairs)
        .map() we pass each element to pluralize function(parameter1 = 1st element of the pair
                                                          parameter2 = 2nd element of the pair)
        .join() we concatenate them with a coma between them for better formatting
    
    returning as string (pair1[1st el] pair1[2nd el], pair2[1st el] pair2[2nd el])
        for example: "1 day 22 hours"
    or if after slicing we have 0 elements and the new list is empty
        for example: the value for each 1st elements of each pair was less than 0
        we return a string that says "less than a minute"
*/
function timeCountTexted(timeDiff) {
    const days = Math.floor(timeDiff / 86400000);
    const restDays = timeDiff % 86400000;
    const hours = Math.floor(restDays / 3600000);
    const restHours = restDays % 3600000;
    const minutes = Math.floor(restHours / 60000);

    const timeParts = [[days, 'day'], [hours, 'hour'], [minutes, 'minute']];

    const timeLeft = timeParts
        .filter(p => p[0] > 0)
        .slice(0, 2)
        .map(p => `${pluralize(p[0], p[1])}`)
        .join(", ");

    return (timeLeft || "less than a minute");
}

/* 
    a function that counts already filtered tasks and shows how many are there out of total
    for example: how many tasks completed out of total
    for completed: N tasks out of Total

    we call the function that already filtered the list and gives us the amount of tasks 
    that are counted using tasks.length in getVisibleTasks function
*/
function updateTaskCounter(visibleTasksCount) {
    taskCounterText.textContent = `Showing ${visibleTasksCount} of ${pluralize(allTasks.length, "task")}`;
}

/* 
    live timer for when is the deadline and when was the task created
    the function scans the whole app for the attributes called "data-created" and "data-deadline"
    for each of such attributes we take the parameter from these attributes and map them as an element
    then checking with if the attribute is "data-created" then we change the text shown in the render
    tasks using its parameter
    same if the attribute is "data-deadline"
*/
function updateTimes(){
    document.querySelectorAll("[data-created], [data-deadline]").forEach(element => {
        if(element.dataset.created) { element.textContent = addedTime(element.dataset.created); }
        else if(element.dataset.deadline) { element.textContent = deadlineTimeLeft(element.dataset.deadline); }
    });
}

/* 
    write the comments
*/
setInterval(updateTimes, 10000);
document.addEventListener("DOMContentLoaded", loadTasks);