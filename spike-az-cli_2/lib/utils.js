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
const stream = require("stream");
const exec = __importStar(require("@actions/exec"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
exports.pathToTempDirectory = process.env.RUNNER_TEMP || os.tmpdir();
;
;
exports.giveExecutablePermissionsToFile = (filePath) => __awaiter(this, void 0, void 0, function* () { return yield exports.executeCommand(`chmod +x ${filePath}`, { silent: true }); });
exports.getScriptFileName = () => {
    const fileName = `AZ_CLI_GITHUB_ACTION_${exports.getCurrentTime().toString()}.sh`;
    const tempDirectory = exports.pathToTempDirectory;
    const fullPath = path.join(tempDirectory, path.basename(fileName));
    return { fileName, fullPath };
};
exports.getCurrentTime = () => {
    return new Date().getTime();
};
exports.executeCommand = (command, execOptions = {}, toolPath) => __awaiter(this, void 0, void 0, function* () {
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
exports.executeScript = (command, toolPath = '') => __awaiter(this, void 0, void 0, function* () {
    var outStream = '';
    var errorStream = '';
    var errorCaught = '';
    try {
        yield exports.executeCommand(command, {
            outStream: new StringWritable({ decodeStrings: false }),
            errStream: new StringWritable({ decodeStrings: false }),
            listeners: {
                stdout: (data) => outStream += data.toString(),
                stderr: (data) => errorStream += data.toString()
            }
        }, toolPath);
    }
    catch (error) {
        errorCaught = error;
    }
    finally {
        return { outStream, errorStream, errorCaught };
    }
});
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
