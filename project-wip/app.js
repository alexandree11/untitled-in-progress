const container = document.querySelector("#user-container");
const myButton = document.querySelector("#load-btn");

myButton.addEventListener("click", async () => {
    try{
        const user_data = await fetch("https://jsonplaceholder.typicode.com/users");

        const users = await user_data.json();

        const html_cards = users.map(user => 
            `<div class="card">
                <h3>${user.name}</h3>
                <p>${user.email}</p>
            </div>`);
        container.innerHTML = html_cards.join("");
    } catch(error) {
        console.log("Error:", error);
    }
})