import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import stream = require('stream');

const bashArg = 'bash --noprofile --norc -eo pipefail';
const pathToTempDirectory: string = process.env.RUNNER_TEMP || os.tmpdir();

const run = async () => {

    try {
        if (process.env.RUNNER_OS != 'Linux') {
            core.setFailed('Please use Linux OS as a runner.');
            return;
        }
        let inlineScript: string = core.getInput('inlineScript');
        let scriptPath: string = core.getInput('scriptPath');
        let azcliversion: string = core.getInput('azcliversion').trim();

        if (!(await checkIfValidVersion(azcliversion))) {
            core.setFailed('Please enter a valid azure cli version.');
            return;
        }

        let bashCommand: string = '';
        let dockerCommand: string = `run --workdir /github/workspace -v ${process.env.GITHUB_WORKSPACE}:/github/workspace -v /home/runner/.azure:/root/.azure `;
        if (scriptPath) {
            if (!checkIfFileExists(scriptPath, 'sh')) {
                core.setFailed('Please enter a valid script file path.');
                return;
            }
            await giveExecutablePermissionsToFile(scriptPath);
            bashCommand = ` ${bashArg} /github/workspace/${scriptPath} `;
        } else if (inlineScript) {
            const { fileName, fullPath } = getScriptFileName();
            fs.writeFileSync(path.join(fullPath), `${inlineScript}`);
            await giveExecutablePermissionsToFile(fullPath);
            dockerCommand += ` -v ${pathToTempDirectory}:/_temp `;
            bashCommand = ` ${bashArg} /_temp/${fileName} `;
        }
        dockerCommand += ` mcr.microsoft.com/azure-cli:${azcliversion} ${bashCommand}`;
        await executeScript(dockerCommand);
        console.log("az script ran successfully.");
    } catch (error) {
        console.log("az CLI GitHub action failed.", error);
        core.setFailed(error.stderr);
    }
};

const executeScript = async (dockerCommand:string) => {
    const dockerPath: string = await io.which("docker", true);
    var outStream:string = '';
    var errorStream:string = '';
    try{
        await executeCommand(dockerCommand, {
        outStream: new StringWritable({ decodeStrings: false }),
        errStream: new StringWritable({ decodeStrings: false }),
        listeners: {
            stdout: (data: Buffer) => outStream += data.toString(),
            stderr: (data: Buffer) => errorStream += data.toString()
        }}, dockerPath);
        console.log(outStream);
        console.log(errorStream);
    }catch(error){
        throw new Error(`az CLI script failed, Please check the script. ${outStream}. Error = ${errorStream}. error = ${error}`);
    }
}

const checkIfValidVersion = async (azcliversion: string): Promise<boolean> => {
    const allVersions: Array<string> = await getAllAzCliVersions();
    for (let i = allVersions.length - 1; i >= 0; i--) {
        if (allVersions[i].trim() === azcliversion) {
            return true;
        }
    }
    return false;
}

const giveExecutablePermissionsToFile = async (filePath: string) => await executeCommand(`chmod +x ${filePath}`, { silent: true })

const getScriptFileName = () => {
    const fileName: string = `AZ_CLI_GITHUB_ACTION_${getCurrentTime().toString()}.sh`;
    const tempDirectory = pathToTempDirectory;
    const fullPath = path.join(tempDirectory, path.basename(fileName));
    return { fileName, fullPath };
}

const getCurrentTime = (): number => {
    return new Date().getTime();
}

const executeCommand = async (command: string, execOptions = {}, toolPath?: string) => {
    try {
        if (toolPath) {
            command = `"${toolPath}" ${command}`;
        }
        await exec.exec(command, [], execOptions);
    }
    catch (error) {
        throw new Error(error);
    }
}

const getAllAzCliVersions = async (): Promise<Array<string>> => {
    var outStream: string = '';
    try {
        await exec.exec(`curl --location -s https://mcr.microsoft.com/v2/azure-cli/tags/list`, [], {
            outStream: new StringWritable({ decodeStrings: false }),
            listeners: {
                stdout: (data: Buffer) => outStream += data.toString()
            }
        });
        if (outStream && JSON.parse(outStream).tags) {
            return JSON.parse(outStream).tags;
        }
    }
    catch (error) {
        throw new Error(`Unable to fetch all az cli versions, please report it as a issue. outputstream = ${outStream}, error = ${error}`);
    }
    return [];
}

const checkIfFileExists = (filePath: string, fileExtension: string): boolean => {
    if (fs.existsSync(filePath) && filePath.toUpperCase().match(new RegExp(`\.${fileExtension.toUpperCase()}$`))) {
        return true;
    }
    return false;
}

class StringWritable extends stream.Writable {
    private value: string = '';

    constructor(options: any) {
        super(options);
    }

    _write(data: any, encoding: string, callback: Function): void {

        this.value += data;
        if (callback) {
            callback();
        }
    }

    toString(): string {
        return this.value;
    }
};

run();