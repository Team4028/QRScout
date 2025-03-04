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
        const qmatches: Record<number, { key: string, red: { 1: number, 2: number, 3: number }, blue: { 1: number, 2: number, 3: number } }> = {};
        var smatches: Record<number, { key: string,  red: { 1: number, 2: number, 3: number }, blue: { 1: number, 2: number, 3: number } }> = {};
        var fmatches: Record<number, { key: string, red: { 1: number, 2: number, 3: number }, blue: { 1: number, 2: number, 3: number } }> = {};
        for (var i = 0; i < json.length; i++) {
            const alliances = json[i]["alliances"];
            console.log(`Current Match: ${json[i]["key"]}`)
            if (json[i]["comp_level"] === 'f') {
                console.log(`   - Sorted as: final${Object.keys(fmatches).length + 1}`)
                fmatches[parseInt(json[i]["match_number"])] = {
                    key: json[i]["key"],
                    red: { 1: parseInt(alliances["red"]["team_keys"][0].replace("frc", "")), 2: parseInt(alliances["red"]["team_keys"][1].replace("frc", "")), 3: parseInt(alliances["red"]["team_keys"][2].replace("frc", "")) },
                    blue: { 1: parseInt(alliances["blue"]["team_keys"][0].replace("frc", "")), 2: parseInt(alliances["blue"]["team_keys"][1].replace("frc", "")), 3: parseInt(alliances["blue"]["team_keys"][2].replace("frc", "")) }
                }
            } else if (json[i]["comp_level"] === 'sf') {
                console.log(`   - Sorted as: sf${Object.keys(smatches).length + 1}`)
                smatches[parseInt(json[i]["set_number"])] = {
                    key: json[i]["key"],
                    red: { 1: parseInt(alliances["red"]["team_keys"][0].replace("frc", "")), 2: parseInt(alliances["red"]["team_keys"][1].replace("frc", "")), 3: parseInt(alliances["red"]["team_keys"][2].replace("frc", "")) },
                    blue: { 1: parseInt(alliances["blue"]["team_keys"][0].replace("frc", "")), 2: parseInt(alliances["blue"]["team_keys"][1].replace("frc", "")), 3: parseInt(alliances["blue"]["team_keys"][2].replace("frc", "")) }
                }
            } else {
                console.log(`   - Sorted as: qm${Object.keys(qmatches).length + 1}`)
                qmatches[parseInt(json[i]["match_number"])] = {
                    key: json[i]["key"],
                    red: { 1: parseInt(alliances["red"]["team_keys"][0].replace("frc", "")), 2: parseInt(alliances["red"]["team_keys"][1].replace("frc", "")), 3: parseInt(alliances["red"]["team_keys"][2].replace("frc", "")) },
                    blue: { 1: parseInt(alliances["blue"]["team_keys"][0].replace("frc", "")), 2: parseInt(alliances["blue"]["team_keys"][1].replace("frc", "")), 3: parseInt(alliances["blue"]["team_keys"][2].replace("frc", "")) }
                }
            }
        }

        qmatches

        console.log(`Total: ${Object.keys(qmatches).length} quals, ${Object.keys(smatches).length} elims, ${Object.keys(fmatches).length} finals`)
        const n = Object.keys(qmatches).length;
        const n2 = Object.keys(smatches).length;
        smatches = Object.fromEntries(Object.entries(smatches).map(([key, value]) => [String(Number(key) + n), value]));
        fmatches = Object.fromEntries(Object.entries(fmatches).map(([key, value]) => [String(Number(key) + n + n2), value]))
        const jsonData = JSON.stringify({ event_id: eventId, matches: { ...qmatches, ...smatches, ...fmatches} }, null, 4);
        const outputPath = path.join(process.cwd(), 'public/teams.json');
        fs.writeFileSync(outputPath, jsonData, 'utf-8');
        console.log(`✅ Read matches from ${eventId} (${url}) into: ${outputPath}`);
    });