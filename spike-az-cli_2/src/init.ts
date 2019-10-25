import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';

var azPath: string;
var bashPath: string;

async function run() {

    try{
        let inlineScript = core.getInput('inlineScript');
        let scriptPath = core.getInput('scriptPath');
        let azcliversion = core.getInput('azcliversion');

        if(process.env.RUNNER_OS != 'Linux'){
            core.warning('Please use Linux as a runner.');
            return;
        }
        azPath = await io.which("az", true);
        bashPath = await io.which("bash", true);
        // let option: IExecSyncOptions = {
        //   silent:true, 
        //   outStream: <stream.Writable>process.stdout,
        //   errStream: <stream.Writable>process.stderr
        // };
        console.log("log env", process.env);
        let dockerCommand = `run -i --workdir /github/workspace -v ${process.env.GITHUB_WORKSPACE}:/github/workspace -v /home/runner/.azure:/root/.azure mcr.microsoft.com/azure-cli:${azcliversion}`;
        if (scriptPath){
            await executeCommand(`chmod +x ${scriptPath}`, bashPath);
            dockerCommand += ` bash /github/workspace/${scriptPath}`;
        }
        else if (inlineScript){
            dockerCommand += ` bash -c \"${inlineScript}\"`;
        }
        console.log(dockerCommand);
        // throwIfError(execSync("docker", "run -i -v /home/runner/.azure:/root/.azure mcr.microsoft.com/azure-cli:2.0.69 bash -c \"az account show; az --version\"", option));
        // throwIfError(execSync("docker", dockerCommand));
        await executeCommand(dockerCommand, azPath);
        console.log("az script ran successfully.");
      } catch (error) {
        console.log("az script failed, Please check the script.", error);
        core.setFailed(error.stderr);
      }
}


async function executeCommand(command: string, toolPath:string = bashPath) {
    try {
        await exec.exec(`"${toolPath}" ${command}`, [],  {}); 
    }
    catch(error) {
        throw new Error(error);
    }
}


// function throwIfError(resultOfToolExecution: IExecSyncResult, errormsg?: string) {
//     if (resultOfToolExecution.code != 0) {
//         core.error("Error Code: [" + resultOfToolExecution.code + "]");
//         if (errormsg) {
//           core.error("Error: " + errormsg);
//         }
//         throw resultOfToolExecution;
//     }
//   }

run();