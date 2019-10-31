import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';
import {getScriptFileName, giveExecutablePermissionsToFile, executeDockerScript, pathToTempDirectory, getAllAzCliVersions} from './utils';

const bashArg = 'bash --noprofile --norc -eo pipefail';

const run = async () => {

    try {
        if (process.env.RUNNER_OS != 'Linux') {
            core.setFailed('Please use Linux OS as a runner.');
            return;
        }
        let inlineScript: string = core.getInput('inlineScript');
        let azcliversion: string = core.getInput('azcliversion').trim();

        if (!(await checkIfValidVersion(azcliversion))) {
            core.setFailed('Please enter a valid azure cli version.');
            return;
        }
        if(!inlineScript.trim()){
            core.setFailed('Please enter a valid script.');
            return;
        }
        const { fileName, fullPath } = getScriptFileName();
        fs.writeFileSync(path.join(fullPath), `${inlineScript}`);
        await giveExecutablePermissionsToFile(fullPath);

        let bashCommand: string = ` ${bashArg} /_temp/${fileName} `;
        let command: string = `run --workdir /github/workspace `;
        command += ` -v ${process.env.GITHUB_WORKSPACE}:/github/workspace `;
        command += ` -v /home/runner/.azure:/root/.azure `;
        command += ` -v ${pathToTempDirectory}:/_temp `;
        command += ` mcr.microsoft.com/azure-cli:${azcliversion} ${bashCommand}`;
        console.log(command);
        await executeDockerScript(command);
        console.log("az script ran successfully.");
    } catch (error) {
        console.log("az CLI GitHub action failed.\n\n",error);
        core.setFailed(error.stderr);
    }
};

const checkIfValidVersion = async (azcliversion: string): Promise<boolean> => {
    const allVersions: Array<string> = await getAllAzCliVersions();
    for (let i = allVersions.length - 1; i >= 0; i--) {
        if (allVersions[i].trim() === azcliversion) {
            return true;
        }
    }
    return false;
}

run();