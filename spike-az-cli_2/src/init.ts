import * as core from '@actions/core';
import * as fs from 'fs';
import * as io from '@actions/io';
import * as path from 'path';
import { getScriptFileName, giveExecutablePermissionsToFile, executeScript, tempDirectory, ExecuteScriptModel } from './utils';

const bashArg: string = 'bash --noprofile --norc -eo pipefail';
const containerWorkspace: string = '/github/workspace';
const containerTempDirectory: string = '/_temp';
const run = async () => {

    try {
        if (process.env.RUNNER_OS != 'Linux') {
            core.setFailed('Please use Linux based OS as a runner.');
            return;
        }
        let inlineScript: string = core.getInput('inlineScript', {required:true});
        let azcliversion: string = core.getInput('azcliversion', {required:true}).trim();

        if (!(await checkIfValidVersion(azcliversion))) {
            core.setFailed('Please enter a valid azure cli version. \nRead more about Azure CLI versions: https://github.com/Azure/azure-cli/releases.');
            return;
        }
        if (!inlineScript.trim()) {
            core.setFailed('Please enter a valid script.');
            return;
        }
        const fullPath:string = getScriptFileName();
        fs.writeFileSync(fullPath, `${inlineScript}`);
        await giveExecutablePermissionsToFile(fullPath);
        let bashCommand: string = ` ${bashArg} ${containerTempDirectory}/${path.basename(fullPath)} `;
        /*
        For the docker run command, we are doing the following
        - Set the working directory for docker continer
        - volume mount the GITHUB_WORKSPACE env variable (path where users checkout code is present) to work directory of container
        - voulme mount .azure session token file between host and container,
        - volume mount temp directory between host and container, inline script file is created in temp directory
        */
        let command: string = `run --workdir ${containerWorkspace} -v ${process.env.GITHUB_WORKSPACE}:${containerWorkspace} `;
        command += ` -v ${process.env.HOME}/.azure:/root/.azure -v ${tempDirectory}:${containerTempDirectory} `;
        command += ` mcr.microsoft.com/azure-cli:${azcliversion} ${bashCommand}`;
        await executeDockerScript(command);
        console.log("az script ran successfully.");
    } catch (error) {
        console.log("az CLI action failed.\n\n", error);
        core.setFailed(error.stderr);
    }
};

const checkIfValidVersion = async (azcliversion: string): Promise<boolean> => {
    const allVersions: Array<string> = await getAllAzCliVersions();
    for (let i: number = allVersions.length - 1; i >= 0; i--) {
        if (allVersions[i].trim() === azcliversion) {
            return true;
        }
    }
    return false;
}

const getAllAzCliVersions = async (): Promise<Array<string>> => {

    const { outStream, errorStream, errorCaught } = <ExecuteScriptModel>await executeScript(`curl --location -s https://mcr.microsoft.com/v2/azure-cli/tags/list`);
    try {
        if (outStream && JSON.parse(outStream).tags) {
            return JSON.parse(outStream).tags;
        }
    } catch (error) {
        throw new Error(`Unable to fetch all az cli versions, please report it as a issue. outputstream contains ${outStream}, error = ${errorStream}\n${errorCaught}`);
    }
    return [];
}

const executeDockerScript = async (dockerCommand: string): Promise<void> => {
    const dockerPath: string = await io.which("docker", true);
    const { outStream, errorStream, errorCaught } = <ExecuteScriptModel>await executeScript(dockerCommand, dockerPath);
    console.log(outStream);
    if (errorCaught) {
        throw new Error(`az CLI script failed, Please check the script.\nPlease refer the script error at the end after docker logs.\n\nDocker logs...\n${errorStream}.`);
    }
}

run();