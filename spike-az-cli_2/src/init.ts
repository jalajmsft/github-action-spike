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
        const dockerPath: string = await io.which("docker", true);

        let inlineScript: string = core.getInput('inlineScript');
        let scriptPath: string = core.getInput('scriptPath');
        let azcliversion: string = core.getInput('azcliversion').trim();

        if(! (await checkIfValidVersion(azcliversion))){
            core.setFailed('Please enter a valid azure cli version.');
            return;
        }

        if(!checkIfFileExists(scriptPath, 'sh')){
            core.setFailed('Please enter a valid script file path.');
            return;
        }

        let bashCommand: string = '';
        let dockerCommand: string = `run --workdir /github/workspace -v ${process.env.GITHUB_WORKSPACE}:/github/workspace -v /home/runner/.azure:/root/.azure `;
        if (scriptPath) {
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
        await executeCommand(dockerCommand,{silent:true}, dockerPath);
        console.log("az script ran successfully.");
    } catch (error) {
        console.log("az script failed, Please check the script.", error);
        core.setFailed(error.stderr);
    }
};

const checkIfValidVersion = async (azcliversion:string): Promise<boolean> => {
    const allVersions: Array<string> = await getAllAzCliVersions();
    for (let i = allVersions.length-1; i>=0; i--){
        if (allVersions[i].trim() === azcliversion){
            return true;
        }
    }
    return false;
}

const giveExecutablePermissionsToFile = async (filePath: string) => await executeCommand(`chmod +x ${filePath}`)

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
    var outStream:string = '';
    await exec.exec(`curl --location https://mcr.microsoft.com/v2/azure-cli/tags/list -s`, [], {
                    outStream: new StringWritable({ decodeStrings: false }), 
                    listeners:{
                        stdout: (data: Buffer) => outStream += data.toString()
                    }
                });
    return JSON.parse(outStream).tags;
}

const checkIfFileExists = (filePath: string, fileExtension: string): boolean => {
    if (fs.existsSync(filePath) && filePath.toUpperCase().match(new RegExp(`\.${fileExtension.toUpperCase()}$`))) {
        return true;
    }
    return false;
}

class StringWritable extends stream.Writable {
    private value: string = '';

    constructor(options:any) {
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

// function handleExecResult(execResult: tr.IExecResult, file: string): void {
//     if (execResult.code != tl.TaskResult.Succeeded) {
//         tl.debug('execResult: ' + JSON.stringify(execResult));
//         const message: string = 'Extraction failed for file: ' + file +
//             '\ncode: ' + execResult.code +
//             '\nstdout: ' + execResult.stdout +
//             '\nstderr: ' + execResult.stderr +
//             '\nerror: ' + execResult.error;
//         throw new UnzipError(message);
//     }
// }

const getOptions = () =>  {
    const execOptions = <any> {
        outStream: new StringWritable({ decodeStrings: false })
    };

    return execOptions;
}

run();