const getUsers = async() => {
    try {
        // printing "Getting data"
        console.log("Getting data");
        
        /* requesting the data from an API and storing it in response
        await = wait for the data to come and only then proceed to next line*/
        const users = await fetch("https://jsonplaceholder.typicode.com/users");

        // convert the data we got from json to a js-object
        const data = await users.json();

        // mapping to get only name and email of a user
        const user_list = data.map(user => ({
            name: user.name,
            email: user.email
        }))

        // print out the data
        console.log(user_list);
    } catch(error) {
        console.log('Something went wrong: ', error);
    }
}

getUsers()