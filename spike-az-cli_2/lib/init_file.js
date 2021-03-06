"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const io = __importStar(require("@actions/io"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const stream = require("stream");
const bashArg = 'bash --noprofile --norc -eo pipefail';
const pathToTempDirectory = process.env.RUNNER_TEMP || os.tmpdir();
const run = () => __awaiter(this, void 0, void 0, function* () {
    try {
        if (process.env.RUNNER_OS != 'Linux') {
            core.setFailed('Please use Linux OS as a runner.');
            return;
        }
        let inlineScript = core.getInput('inlineScript');
        let scriptPath = core.getInput('scriptPath');
        let azcliversion = core.getInput('azcliversion').trim();
        if (!(yield checkIfValidVersion(azcliversion))) {
            core.setFailed('Please enter a valid azure cli version.');
            return;
        }
        let bashCommand = '';
        let dockerCommand = `run --workdir /github/workspace -v ${process.env.GITHUB_WORKSPACE}:/github/workspace -v /home/runner/.azure:/root/.azure `;
        if (scriptPath) {
            if (!checkIfFileExists(scriptPath, 'sh')) {
                core.setFailed('Please enter a valid script file path.');
                return;
            }
            yield giveExecutablePermissionsToFile(scriptPath);
            bashCommand = ` ${bashArg} /github/workspace/${scriptPath} `;
        }
        else if (inlineScript) {
            const { fileName, fullPath } = getScriptFileName();
            fs.writeFileSync(path.join(fullPath), `${inlineScript}`);
            yield giveExecutablePermissionsToFile(fullPath);
            dockerCommand += ` -v ${pathToTempDirectory}:/_temp `;
            bashCommand = ` ${bashArg} /_temp/${fileName} `;
        }
        dockerCommand += ` mcr.microsoft.com/azure-cli:${azcliversion} ${bashCommand}`;
        yield executeScript(dockerCommand);
        console.log("az script ran successfully.");
    }
    catch (error) {
        console.log("az CLI GitHub action failed.\n\n", error);
        core.setFailed(error.stderr);
    }
});
const executeScript = (dockerCommand) => __awaiter(this, void 0, void 0, function* () {
    const dockerPath = yield io.which("docker", true);
    var outStream = '';
    var errorStream = '';
    try {
        yield executeCommand(dockerCommand, {
            outStream: new StringWritable({ decodeStrings: false }),
            errStream: new StringWritable({ decodeStrings: false }),
            listeners: {
                stdout: (data) => outStream += data.toString(),
                stderr: (data) => errorStream += data.toString()
            }
        }, dockerPath);
        console.log(outStream);
    }
    catch (error) {
        console.log(outStream);
        throw new Error(`az CLI script failed, Please check the script.\nPlease refer the script error at the end after docker logs.\n\n\nDocker logs...\n${errorStream}.`);
    }
});
const checkIfValidVersion = (azcliversion) => __awaiter(this, void 0, void 0, function* () {
    const allVersions = yield getAllAzCliVersions();
    for (let i = allVersions.length - 1; i >= 0; i--) {
        if (allVersions[i].trim() === azcliversion) {
            return true;
        }
    }
    return false;
});
const giveExecutablePermissionsToFile = (filePath) => __awaiter(this, void 0, void 0, function* () { return yield executeCommand(`chmod +x ${filePath}`, { silent: true }); });
const getScriptFileName = () => {
    const fileName = `AZ_CLI_GITHUB_ACTION_${getCurrentTime().toString()}.sh`;
    const tempDirectory = pathToTempDirectory;
    const fullPath = path.join(tempDirectory, path.basename(fileName));
    return { fileName, fullPath };
};
const getCurrentTime = () => {
    return new Date().getTime();
};
const executeCommand = (command, execOptions = {}, toolPath) => __awaiter(this, void 0, void 0, function* () {
    try {
        if (toolPath) {
            command = `"${toolPath}" ${command}`;
        }
        yield exec.exec(command, [], execOptions);
    }
    catch (error) {
        throw new Error(error);
    }
});
const getAllAzCliVersions = () => __awaiter(this, void 0, void 0, function* () {
    var outStream = '';
    try {
        yield exec.exec(`curl --location -s https://mcr.microsoft.com/v2/azure-cli/tags/list`, [], {
            outStream: new StringWritable({ decodeStrings: false }),
            listeners: {
                stdout: (data) => outStream += data.toString()
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
});
const checkIfFileExists = (filePath, fileExtension) => {
    if (fs.existsSync(filePath) && filePath.toUpperCase().match(new RegExp(`\.${fileExtension.toUpperCase()}$`))) {
        return true;
    }
    return false;
};
class StringWritable extends stream.Writable {
    constructor(options) {
        super(options);
        this.value = '';
    }
    _write(data, encoding, callback) {
        this.value += data;
        if (callback) {
            callback();
        }
    }
    toString() {
        return this.value;
    }
}
;
run();
