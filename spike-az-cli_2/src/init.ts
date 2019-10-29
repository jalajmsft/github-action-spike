import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';

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
 
        let dockerCommand = `run -i --workdir /github/workspace -v ${process.env.GITHUB_WORKSPACE}:/github/workspace -v /home/runner/.azure:/root/.azure mcr.microsoft.com/azure-cli:${azcliversion}`;
        if (scriptPath){
            await executeCommand(`chmod +x ${scriptPath}`);
            dockerCommand += ` bash /github/workspace/${scriptPath}`;
        }
        else if (inlineScript){
            dockerCommand += ` bash -c \"${inlineScript.replace(/"/g, '\\\"')}\"`;
        }
        await executeCommand(dockerCommand, dockerPath);
        console.log("az script ran successfully.");
      } catch (error) {
        console.log("az script failed, Please check the script.", error);
        core.setFailed(error.stderr);
      }
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