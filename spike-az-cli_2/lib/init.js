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
var dockerPath;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let inlineScript = core.getInput('inlineScript');
            let scriptPath = core.getInput('scriptPath');
            let azcliversion = core.getInput('azcliversion');
            if (process.env.RUNNER_OS != 'Linux') {
                core.warning('Please use Linux as a runner.');
                return;
            }
            dockerPath = yield io.which("docker", true);
            let dockerCommand = `run -i --workdir /github/workspace -v ${process.env.GITHUB_WORKSPACE}:/github/workspace -v /home/runner/.azure:/root/.azure mcr.microsoft.com/azure-cli:${azcliversion}`;
            if (scriptPath) {
                yield executeCommand(`chmod +x ${scriptPath}`);
                dockerCommand += ` bash /github/workspace/${scriptPath}`;
            }
            else if (inlineScript) {
                dockerCommand += ` bash -c \"${inlineScript}\"`;
            }
            yield executeCommand(dockerCommand, dockerPath);
            console.log("az script ran successfully.");
        }
        catch (error) {
            console.log("az script failed, Please check the script.", error);
            core.setFailed(error.stderr);
        }
    });
}
function executeCommand(command, toolPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (toolPath) {
                command = `"${toolPath}" ${command}`;
            }
            yield exec.exec(command, [], {});
        }
        catch (error) {
            throw new Error(error);
        }
    });
}
run();
