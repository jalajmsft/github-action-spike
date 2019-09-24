// src/hello-world.ts
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import { ExecException } from 'child_process';
const { spawn } = require('child_process');
async function run() {
  try {
    console.log("starting the execution...");
    const ls = spawn('az');

ls.stdout.on('data', (data:any) => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data:any) => {
  console.error(`stderr: ${data}`);
});

ls.on('close', (code:any) => {
  console.log(`child process exited with code ${code}`);
});
    const bash: string = await io.which('bash', true);
    console.log(bash);
    
    
    //console.log(stdout);
    await exec.exec(`"${bash}"`, ['sample.sh'], {'cwd':'./lib'});

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