import stream = require('stream');
import * as exec from '@actions/exec';
import * as path from 'path';
import * as os from 'os';

export const pathToTempDirectory: string = process.env.RUNNER_TEMP || os.tmpdir();

export interface ExecuteScriptModel {
    outStream: string;
    errorStream: string;
    errorCaught: any;
};

export interface FileNameModel {
    fileName: string;
    fullPath: string;
};

export const giveExecutablePermissionsToFile = async (filePath: string): Promise<void> => await executeCommand(`chmod +x ${filePath}`, { silent: true })

export const getScriptFileName = (): FileNameModel => {
    const fileName: string = `AZ_CLI_GITHUB_ACTION_${getCurrentTime().toString()}.sh`;
    const tempDirectory: string = pathToTempDirectory;
    const fullPath: string = path.join(tempDirectory, path.basename(fileName));
    return { fileName, fullPath };
}

export const getCurrentTime = (): number => {
    return new Date().getTime();
}

export const executeCommand = async (command: string, execOptions = {}, toolPath?: string): Promise<void> => {
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

export const executeScript = async (command: string, toolPath: string = ''): Promise<ExecuteScriptModel> => {
    var outStream: string = '';
    var errorStream: string = '';
    var errorCaught: string = '';
    try {
        await executeCommand(command, {
            outStream: new StringWritable({ decodeStrings: false }),
            errStream: new StringWritable({ decodeStrings: false }),
            listeners: {
                stdout: (data: Buffer) => outStream += data.toString(),
                stderr: (data: Buffer) => errorStream += data.toString()
            }
        }, toolPath);
    }
    catch (error) {
        errorCaught = error;
    }
    finally {
        return { outStream, errorStream, errorCaught };
    }
}

class StringWritable extends stream.Writable {

    constructor(options: any) {
        super(options);
    }
};
