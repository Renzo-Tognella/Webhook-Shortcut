const express = require('express')
const app = express()
const port = 3000
const axios = require('axios/dist/node/axios.cjs'); 

app.get('/', (req, res) => {
    if (req.method === "POST") {
        let data = [];

        req.on("data", chunk => {
            data.push(chunk);
        });

        req.on("end", () => {
            const body = Buffer.concat(data).toString();
            const event = JSON.parse(body);

            console.log("Evento Webhook recebido:", event);

            if(event.actions.action == "update") {
                verifyTypeOfEvent(event);
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'success' }));
        });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

function verifyTypeOfEvent(event) {
    let payload = {}
    let changes = event.actions.changes
    let references = event.references

    if (changes.hasOwnProperty("started_at") && references[0].name == "To Do" && references[0].entity_type == "workflow-state") {
        payload = EventToDo(event)
        postEventWhenStateToDo(payload)
    }
    else if (changes.hasOwnProperty("started")) {
        if (changes.started.new == true && references[0].name == "In Progress" && references[0].entity_type == "workflow-state"){
            payload = EventInProgress(event)
            postEventWhenStateInProgress(payload)
        }
    }
    else if (changes.hasOwnProperty("completed")) {
        if (changes.completed.new == true && references[0].name == "Done" && references[0].entity_type == "workflow-state") {
            payload = EventDone(event)
            postEventWhenStateDone(payload)
        }
    }

}

function EventToDo(event) {

}

function EventInProgress(event) {

}

function EventDone(event) {

}

function getCardInformations(args){
    axios({
        method: 'get',
        url: '',
        responseType: 'stream'
    })
        .then(function (response) {
            response.data.pipe(fs.createWriteStream('ada_lovelace.jpg'))
        });

}

function postEventWhenStateDone(args){
    
}

function postEventWhenStateInProgress(args){

}
function postEventWhenStateToDo(args){

}