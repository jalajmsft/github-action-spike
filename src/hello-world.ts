// src/hello-world.ts
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
const { execSync } = require('child_process');
async function run() {
  try {
    console.log("starting the execution...");
    let stdout = execSync('ls');
    const bash: string = await io.which('bash', true);
    console.log(bash);
    await exec.exec(`"${bash}"`, ['sample.sh']);

    const nameToGreet = core.getInput('who-to-greet');
    if (nameToGreet == 'Octocat') {
        // the Octocat doesn't want to be greeted here!
        throw new Error("No Octocat greetings, please.");
    } else {
        console.log(`Hello ${nameToGreet}!`);
        const time = (new Date()).toTimeString();
        core.setOutput("time", time);
    }
    

    // Get the JSON webhook payload for the event that triggered the workflow
  //const payload = JSON.stringify(github.context.payload, undefined, 2)
  //console.log(`The event payload: ${payload}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();