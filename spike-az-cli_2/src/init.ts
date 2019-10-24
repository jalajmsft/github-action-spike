// src/hello-world.ts
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import { ExecException } from 'child_process';
const { spawn } = require('child_process');
async function run() {

    const bash: string = await io.which('bash', true);
    console.log(bash);
    
    
    //console.log(stdout);
    await exec.exec(`"${bash}"`, ['docker run mcr.microsoft.com/azure-cli:2.0.69 az --version'], {'cwd':'./lib'});
    // await exec.exec(`"${bash}"`, ['sample.sh'], {'cwd':'./lib'});

    const nameToGreet = core.getInput('who-to-greet');
    if (nameToGreet == 'Octocat') {
        // the Octocat doesn't want to be greeted here!
        throw new Error("No Octocat greetings, please.");
    } else {
        console.log(`Hello ${nameToGreet}!`);
        const time = (new Date()).toTimeString();
        core.setOutput("time", time);
    }
}

run();