import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { getCurrentTime } from "./utils";

var dockerPath: string;

async function run() {

    try{
        let inlineScript = core.getInput('inlineScript');
        let scriptPath = core.getInput('scriptPath');
        let azcliversion = core.getInput('azcliversion');

        if(process.env.RUNNER_OS != 'Linux'){
            core.warning('Please use Linux as a runner.');
            return;
        }
        dockerPath = await io.which("docker", true);
 
        let dockerCommand = `run -i --workdir /github/workspace -v ${process.env.RUNNER_TEMP || os.tmpdir()}:/github/_temp -v ${process.env.GITHUB_WORKSPACE}:/github/workspace -v /home/runner/.azure:/root/.azure mcr.microsoft.com/azure-cli:${azcliversion}`;
        if (scriptPath){
            await executeCommand(`chmod +x ${scriptPath}`);
            dockerCommand += ` bash /github/workspace/${scriptPath}`;
        }
        else if (inlineScript){
            const {fileName, fullPath} = getScriptFileName();
            fs.writeFileSync(path.join(fullPath), `#!/bin/bash \n\n set -eo \n ${inlineScript}`);
            await executeCommand(`chmod +x ${fullPath}`);
            dockerCommand += ` bash /github/_temp/${fileName}`;
            // dockerCommand += ` bash -c \"${inlineScript.replace(/"/g, '\\\"')}\"`;
        }
        await executeCommand(dockerCommand, dockerPath);
        console.log("az script ran successfully.");
      } catch (error) {
        console.log("az script failed, Please check the script.", error);
        core.setFailed(error.stderr);
      }
}

function getScriptFileName() {
    const fileName:string = 'AZ_CLI_GITHUB_ACTION_' + getCurrentTime().toString();
    const tempDirectory = process.env.RUNNER_TEMP || os.tmpdir();
    const fullPath = path.join(tempDirectory, path.basename(fileName));
    return { fileName, fullPath};
}


async function executeCommand(command: string, toolPath?:string) {
    try {
        if(toolPath){
            command = `"${toolPath}" ${command}`;
        }
        await exec.exec(command, [],  {}); 
    }
    catch(error) {
        throw new Error(error);
    }
}

run();