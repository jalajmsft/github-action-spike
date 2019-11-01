import stream = require('stream');
import * as exec from '@actions/exec';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

export const TEMP_DIRECTORY: string = process.env.RUNNER_TEMP || os.tmpdir();
export const START_SCRIPT_EXECUTION: string = 'Starting script execution';

export interface ExecuteScriptModel {
    outStream: string;
    errorStream: string;
    errorCaught: any;
};

export const giveExecutablePermissionsToFile = async (filePath: string): Promise<void> => await executeCommand(`chmod +x ${filePath}`, { silent: true })

export const createScriptFile = async (inlineScript: string): Promise<string> => {
    const fileName: string = `AZ_CLI_GITHUB_ACTION_${getCurrentTime().toString()}.sh`;
    const filePath: string = path.join(TEMP_DIRECTORY, fileName);
    fs.writeFileSync(filePath, `${inlineScript}`);
    await giveExecutablePermissionsToFile(filePath);
    return fileName;
}

export const getCurrentTime = (): number => {
    return new Date().getTime();
}

export const executeCommand = async (command: string, execOptions = {}, toolPath?: string): Promise<void> => {
    // try {
        if (toolPath) {
            command = `"${toolPath}" ${command}`;
        }
        await exec.exec(command, [], execOptions);
    // }
    // catch (error) {
    //     throw new Error(error);
    // }
}

export const executeScript = async (command: string, toolPath: string = ''): Promise<ExecuteScriptModel> => {
    var outStream: string = '';
    var errorStream: string = '';
    var errorCaught: string = '';
    var options: any = {
        outStream: new OutstreamStringWritable({ decodeStrings: false }),
        errStream: new ErrorstreamStringWritable({ decodeStrings: false }),
    };

    try {
        await executeCommand(command, options, toolPath);
    }
    catch (error) {
        errorCaught = error;
    }
    finally {
        return { outStream: options.outStream.toString(), errorStream: options.errStream.toString(), errorCaught };
    }
}

export class NullOutstreamStringWritable extends stream.Writable {

    constructor(options: any) {
        super(options);
    }

    _write(data: any, encoding: string, callback: Function): void {
        if (callback) {
            callback();
        }
    }
};

class OutstreamStringWritable extends stream.Writable {
    private value: string = '';

    constructor(options: any) {
        super(options);
    }

    _write(data: any, encoding: string, callback: Function): void {

        console.log(data.toString());
        this.value += data.toString();
        if (callback) {
            callback();
        }
    }

    toString(): string {
        return this.value;
    }
};

class ErrorstreamStringWritable extends stream.Writable {
    private value: string = '';


    constructor(options: any) {
        super(options);
    }

    _write(data: any, encoding: string, callback: Function): void {

        console.log(data.toString());
        if(data.toString().trim() === START_SCRIPT_EXECUTION) {
            this.value = '';
        } 
        else {
            this.value += data.toString();
        }
        
        if (callback) {
            callback();
        }
    }

    toString(): string {
        return this.value;
    }
};
