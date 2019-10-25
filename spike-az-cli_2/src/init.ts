import * as core from '@actions/core';
import { execSync, IExecSyncResult, IExecSyncOptions } from './utility';
import stream = require('stream');


async function run() {

    try{
        let inlineScript = core.getInput('inlineScript');
        let scriptPath = core.getInput('scriptPath');
        let azcliversion = core.getInput('azcliversion');
        
        console.log("script path = ", scriptPath);
        console.log("inline script = ", inlineScript);
        console.log("azcliversion = ", azcliversion);
        
        let option: IExecSyncOptions = {
          silent:true, 
          outStream: <stream.Writable>process.stdout,
          errStream: <stream.Writable>process.stderr
        };
        let dockerCommand = `run -i -v /home/runner/.azure:/root/.azure mcr.microsoft.com/azure-cli:${azcliversion}`;
        if (scriptPath){
            dockerCommand += '';
        }
        else if (inlineScript){
            dockerCommand += `bash -c \"${inlineScript}\"`;
        }
        // throwIfError(execSync("docker", "run -i -v /home/runner/.azure:/root/.azure mcr.microsoft.com/azure-cli:2.0.69 bash -c \"az account show; az --version\"", option));
        throwIfError(execSync("docker", dockerCommand));
        console.log("successful.");
      } catch (error) {
        console.log("please cehck the command.", error);
        core.setFailed(error);
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