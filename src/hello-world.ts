// src/hello-world.ts
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';

async function run() {
  try {
    const nameToGreet = core.getInput('who-to-greet');
    if (nameToGreet == 'Octocat') {
        // the Octocat doesn't want to be greeted here!
        throw new Error("No Octocat greetings, please.");
    } else {
        console.log(`Hello ${nameToGreet}!`);
        const time = (new Date()).toTimeString();
        core.setOutput("time", time);
    }
    console.log("starting the execution...");

    const bash: string = await io.which('bash', true);

    await exec.exec(`"${bash}"`, ['az --version']);

    // Get the JSON webhook payload for the event that triggered the workflow
  //const payload = JSON.stringify(github.context.payload, undefined, 2)
  //console.log(`The event payload: ${payload}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();