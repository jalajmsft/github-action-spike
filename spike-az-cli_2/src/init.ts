import * as core from '@actions/core';
import { execSync, IExecSyncResult, IExecSyncOptions } from './utility';
import stream = require('stream');


async function run() {

    try{
        let inlineScript = core.getInput('inlineScript');
        let scriptPath = core.getInput('scriptPath');
        let azcliversion = core.getInput('azcliversion');

        if(process.env.RUNNER_OS != 'Linux'){
            core.warning('Please use Linux as a runner.');
            return;
        }

        let option: IExecSyncOptions = {
          silent:true, 
          outStream: <stream.Writable>process.stdout,
          errStream: <stream.Writable>process.stderr
        };
        console.log("log env", process.env);
        let dockerCommand = `run -i --workdir /github/workspace -e GITHUB_WORKSPACE -e RUNNER_WORKSPACE -e HOME -v RUNNER_WORKSPACE:/github/workspace -v HOME/.azure:/root/.azure mcr.microsoft.com/azure-cli:${azcliversion}`;
        if (scriptPath){
            dockerCommand += ` bash /github/workspace/${scriptPath}`;
        }
        else if (inlineScript){
            dockerCommand += ` bash -c \"${inlineScript}\"`;
        }
        console.log(dockerCommand);
        // throwIfError(execSync("docker", "run -i -v /home/runner/.azure:/root/.azure mcr.microsoft.com/azure-cli:2.0.69 bash -c \"az account show; az --version\"", option));
        throwIfError(execSync("docker", dockerCommand));
        console.log("successful.");
      } catch (error) {
        console.log("please check the command.", error);
        core.setFailed(error.stderr);
      }
      finally {
        core.warning('update your workflows to use the new action.');
      }
}

function throwIfError(resultOfToolExecution: IExecSyncResult, errormsg?: string) {
    if (resultOfToolExecution.code != 0) {
        core.error("Error Code: [" + resultOfToolExecution.code + "]");
        if (errormsg) {
          core.error("Error: " + errormsg);
        }
        throw resultOfToolExecution;
    }
    else{
        console.log("success...", resultOfToolExecution.stdout);

    }
  }

run();