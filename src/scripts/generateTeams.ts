import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);

const eventId = args[0].toLowerCase();
const api_key = args[1];

const url = "https://www.thebluealliance.com/api/v3/event/" + eventId + "/matches"

const header = {
    'X-TBA-Auth-Key': api_key
}

const options = {
    method: 'GET',
    headers: header
}

fetch(url, options)
    .then(response => response.json())
    .then(json => {
        const matches: Record<number, {red: {1: number, 2: number, 3: number}, blue: {1: number, 2: number, 3: number}}> = {};
        for (var i = 0; i < json.length; i++) {
            const alliances = json[i]["alliances"];
            matches[i] = {
                red: { 1: parseInt(alliances["red"]["team_keys"][0].replace("frc", "")), 2: parseInt(alliances["red"]["team_keys"][1].replace("frc", "")), 3: parseInt(alliances["red"]["team_keys"][2].replace("frc", "")) },
                blue: { 1: parseInt(alliances["blue"]["team_keys"][0].replace("frc", "")), 2: parseInt(alliances["blue"]["team_keys"][1].replace("frc", "")), 3: parseInt(alliances["blue"]["team_keys"][2].replace("frc", "")) }
            }
        }

        const jsonData = JSON.stringify({event_id: eventId, matches}, null, 4);
        const outputPath = path.join(process.cwd(), 'config/teams.json');
        fs.writeFileSync(outputPath, jsonData, 'utf-8');
        console.log(`✅ Read matches from ${eventId} (${url}) into: ${outputPath}`);
    });