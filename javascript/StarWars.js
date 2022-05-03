import chalk from 'chalk';
import inquirer from "inquirer";
import { io } from 'socket.io-client';

const socket = io("http://0.0.0.0:3000");

//establishes connection to socket
socket.on("connect", async () => {
    console.log(chalk.green('---------------------------------------------'));
    console.log(chalk.cyanBright("Connected to : " + socket.id)); // x8WIv7-mJelg7on_ALbx
    run();
});

//when disconnected
socket.on("disconnect", () => {
    console.log(chalk.blue("Disconnected: " + socket.id)); // undefined
});

//character lookup 
const characterSearch = async (payload) => {
    console.log("Got it, let's find ", payload.query+"!")
    //emit search criteria
    socket.emit("search", payload);
    //Display character name to user
    let name = payload.query;

    payload = null;
    socket.on('search', (data) => {
        try {
            if (data.page == -1) {
                console.log(chalk.red("ERR: No results found for " + name));
                socket.off('search');
                run();
                return;
            }
            console.log(chalk.green("\n(" + data.page + "/" + data.resultCount + ") " + data.name + " - [ " + chalk.white(data.films) + " ]"));
            if (data.page == data.resultCount) {
                console.log('----------------------------------------------------------------\n')
                socket.off('search');
                run();
            }
        } catch (e) {
            console.log("error", e);
        }
    });
}

//Questions for CLI
const askQuestions = () => {
    const question = [
        {
            name: "query",
            type: "input",
            message: "In a far far away galaxy, looking for who are you?"
        }
    ];
    return inquirer.prompt(question);
};
//initiate the CLI process
const run = async () => {
    const character = await askQuestions();
    if (character.query.toLowerCase() === "exit") {
        process.exit(1);
    }
    characterSearch(character);
};

