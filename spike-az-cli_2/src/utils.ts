import stream = require('stream');
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as path from 'path';
import * as os from 'os';

export const pathToTempDirectory: string = process.env.RUNNER_TEMP || os.tmpdir();

export const giveExecutablePermissionsToFile = async (filePath: string) => await executeCommand(`chmod +x ${filePath}`, { silent: true })

export const getScriptFileName = () => {
    const fileName: string = `AZ_CLI_GITHUB_ACTION_${getCurrentTime().toString()}.sh`;
    const tempDirectory = pathToTempDirectory;
    const fullPath = path.join(tempDirectory, path.basename(fileName));
    return { fileName, fullPath };
}

export const getCurrentTime = (): number => {
    return new Date().getTime();
}

export const executeCommand = async (command: string, execOptions = {}, toolPath?: string) => {
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

export const getAllAzCliVersions = async (): Promise<Array<string>> => {
    var outStream: string = '';
    var errorStream: string = '';
    var error1: string = '';
    try {
        await executeCommand(`curl --location -s https://mcr.microsoft.com/v2/azure-cli/tags/list`, {
            outStream: new StringWritable({ decodeStrings: false }),
            errorStream: new StringWritable({ decodeStrings: false }),
            listeners: {
                stdout: (data: Buffer) => outStream += data.toString(),
                stderrt: (data: Buffer) => errorStream += data.toString()
            }
        });

        if (outStream && JSON.parse(outStream).tags) {
            return JSON.parse(outStream).tags;
        }
    }
    catch (error) {
        error1 = error;
        throw new Error(`Unable to fetch all az cli versions, please report it as a issue. outputstream = ${outStream}, error = ${error}`);
    }
    finally{
        
        console.log(outStream);
        console.log(errorStream);
        console.log(error1);
    }
    return [];
}

export const executeDockerScript = async (dockerCommand:string) => {
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
    }catch(error){
        console.log(outStream);
        console.log(errorStream);
        console.log(error);
        throw new Error(`az CLI script failed, Please check the script.\nPlease refer the script error at the end after docker logs.\n\n\nDocker logs...\n${errorStream}.`);
    }
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
