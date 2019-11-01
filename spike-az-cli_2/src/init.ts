import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';

import * as fs from 'fs';
import * as path from 'path';
import stream = require('stream');

import { createScriptFile, executeScript, TEMP_DIRECTORY, START_SCRIPT_EXECUTION, ExecuteScriptModel, NullOutstreamStringWritable, ErrorstreamStringWritable } from './utils';

const BASH_ARG: string = `bash --noprofile --norc -eo pipefail -c "echo '${START_SCRIPT_EXECUTION}' >&2;`;
const CONTAINER_WORKSPACE: string = '/github/workspace';
const CONTAINER_TEMP_DIRECTORY: string = '/_temp';

const run = async () => {

    try {
        if (process.env.RUNNER_OS != 'Linux') {
            core.setFailed('Please use Linux based OS as a runner.');
            return;
        }
        
        let inlineScript: string = core.getInput('inlineScript', {required:true});
        let azcliversion: string = core.getInput('azcliversion', {required:true}).trim();

        if (!(await checkIfValidCLIVersion(azcliversion))) {
            core.setFailed('Please enter a valid azure cli version. \nSee available versions: https://github.com/Azure/azure-cli/releases.');
            return;
        }

        if (!inlineScript.trim()) {
            core.setFailed('Please enter a valid script.');
            return;
        }
        const scriptFile:string = await createScriptFile(inlineScript);
        let bashCommand: string = ` ${BASH_ARG}${CONTAINER_TEMP_DIRECTORY}/${scriptFile} `;

        /*
        For the docker run command, we are doing the following
        - Set the working directory for docker continer
        - volume mount the GITHUB_WORKSPACE env variable (path where users checkout code is present) to work directory of container
        - voulme mount .azure session token file between host and container,
        - volume mount temp directory between host and container, inline script file is created in temp directory
        */
        let command: string = `run --workdir ${CONTAINER_WORKSPACE} -v ${process.env.GITHUB_WORKSPACE}:${CONTAINER_WORKSPACE} `;
        command += ` -v ${process.env.HOME}/.azure:/root/.azure -v ${TEMP_DIRECTORY}:${CONTAINER_TEMP_DIRECTORY} `;
        command += `-e GITHUB_WORKSPACE=${CONTAINER_WORKSPACE}`;
        command += ` mcr.microsoft.com/azure-cli:${azcliversion} ${bashCommand}`;

        await executeDockerScript(command);
        console.log("az script ran successfully.");
    } catch (error) {
        console.log("az CLI action failed.\n\n", error);
        core.setFailed(error.stderr);
    }
};

const checkIfValidCLIVersion = async (azcliversion: string): Promise<boolean> => {
    const allVersions: Array<string> = await getAllAzCliVersions();
    for (let i: number = allVersions.length - 1; i >= 0; i--) {
        if (allVersions[i].trim() === azcliversion) {
            return true;
        }
    }
    return false;
}

const getAllAzCliVersions = async (): Promise<Array<string>> => {
    var outStream: string = '';
    var errorStream: string = '';
    var execOptions: any = {
        outStream: new NullOutstreamStringWritable({ decodeStrings: false }),
        listeners: {
            stdout: (data: any) => outStream += data.toString(),
            //stderr: (data) => errorStream += data.toString()
        }
    };
    
    try {
        await exec.exec(`curl --location -s https://mcr.microsoft.com/v2/azure-cli/tags/list`, [], execOptions)
        if (outStream && JSON.parse(outStream).tags) {
            return JSON.parse(outStream).tags;
        }
    } catch (error) {
        throw new Error(`Unable to fetch all az cli versions, please report it as an issue. Output: ${outStream}, Error: ${error}`);
    }
    return [];
}

const executeDockerScript = async (dockerCommand: string): Promise<void> => {
    const dockerTool: string = await io.which("docker", true);
    //const { outStream, errorStream, errorCaught } = <ExecuteScriptModel>await executeScript(dockerCommand, dockerTool);
    //console.log(outStream);
    var execOptions: any = {
        outStream: new NullOutstreamStringWritable({ decodeStrings: false }),
        errStream: new ErrorstreamStringWritable({ decodeStrings: false }),
        listeners: {
            stdout: (data: any) => console.log(data.toString()),
            //stderr: (data) => errorStream += data.toString()
        }
    };

    try {
        await exec.exec(`"${dockerTool}" ${dockerCommand}`, execOptions)
    } catch (error) {
        var commandError: string = execOptions.errStream.toString();
        if(commandError) {
            throw new Error(commandError);
        } else {
            throw error;
        }
    }
}

run();