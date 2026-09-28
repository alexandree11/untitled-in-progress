const container = document.querySelector("#user-container");
const myButton = document.querySelector("#load-btn");
const addButton = document.querySelector("[id='add-btn']");
const taskInput = document.querySelector("#task-title");

myButton.addEventListener("click", async () => {
    try{
        const response = await fetch("http://127.0.0.1:8000/api/tasks");

        const tasks = await response.json();

        const html_cards = tasks.map(task => 
            `<div class="card">
                <h3>${task.title}</h3>
                <p>Priority: ${task.priority}</p>
            </div>`);
        container.innerHTML = html_cards.join("");
    } catch(error) {
        console.log("Error:", error);
    }
})

addButton.addEventListener("click", async() => {
    const titleInputValue = taskInput.value.trim();
    if (!titleInputValue) return;
    try{
        await fetch("http://127.0.0.1:8000/api/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: titleInputValue,
                priority: "medium"
            })
        });

        taskInput.value = "";
        myButton.click();
    } catch(error) {
        console.log('Error: ', error);
    }
});