const express = require('express')
const app = express()
const port = 3000
const axios = require('axios');

app.post('/', (req, res) => {
    let data = [];

    req.on("data", chunk => {
        data.push(chunk);
    });

    req.on("end", () => {
        const body = Buffer.concat(data).toString();
        const event = JSON.parse(body);

        console.log("Evento Webhook recebido:", event.actions[0].action);

        if (event.actions[0].action == "update") {
            console.log("Entro");
            verifyTypeOfEvent(event);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success' }));
    });
});


app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})

async function verifyTypeOfEvent(event) {
    let changes = event.actions[0].changes
    let references = event.references
    console.log(event.primary_id)
    let idFreshService = await getCardInformations(event.primary_id)
    let response

    if (changes.hasOwnProperty("started_at") && references[0].name == "To Do" && references[0].entity_type == "workflow-state") {
        msg = "O desenvolvimento do seu card foi interrompido"
        console.log(msg)
        response = await postEvent(msg, idFreshService)
    }
    else if (changes.hasOwnProperty("started")) {
        if (changes.started.new == true && references[0].name == "In Progress" && references[0].entity_type == "workflow-state"){
            msg = "O desenvolvimento do seu card foi iniciado"
            console.log(msg)
            response = await postEvent(msg, idFreshService)
        }
    }
    else if (changes.hasOwnProperty("completed")) {
        if (changes.completed.new == true && references[0].name == "Done" && references[0].entity_type == "workflow-state") {
            msg = "O desenvolvimento do seu card foi concluído"
            console.log(msg)
            response = await postEvent(msg, idFreshService)
        }
    }

    console.log(response)

}

async function getCardInformations(args){
    let link
    try {
        const response = await axios({
            method: 'get',
            url: `https://api.app.shortcut.com/api/v3/stories/${args}`,
            headers: {
                'Content-Type': 'application/json',
                'Shortcut-Token': '66e424d6-b301-4e5f-8f69-a1d5d1132c1a'
            }
        });

        link = response.data.external_links[0].split("/tickets/")

        return link[1]
    } catch (error) {
        console.error(error);
    }

}

async function postEvent(msg, idFreshService){
    try {
        let apiKey = "P6SN_I4t4C4zuPENzusZ"
        const response = await axios({
            method: 'post',
            headers: {
                'Authorization': `Basic ${Buffer.from(apiKey).toString('base64')}`,
                'Content-Type': 'application/json'
            },
            url: `https://testrenzo.freshservice.com/api/v2/tickets/${idFreshService}/reply`,
            data: {"body" : msg}
        })
        console.log(response)

        const conversation = response.data.conversation;

        return conversation.ticket_id;
    } catch (error) {
        console.error(error);
    }
}

