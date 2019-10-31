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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const utils_1 = require("./utils");
const bashArg = 'bash --noprofile --norc -eo pipefail';
const run = () => __awaiter(this, void 0, void 0, function* () {
    try {
        if (process.env.RUNNER_OS != 'Linux') {
            core.setFailed('Please use Linux OS as a runner.');
            return;
        }
        let inlineScript = core.getInput('inlineScript');
        let azcliversion = core.getInput('azcliversion').trim();
        if (!(yield checkIfValidVersion(azcliversion))) {
            core.setFailed('Please enter a valid azure cli version.');
            return;
        }
        if (!inlineScript.trim()) {
            core.setFailed('Please enter a valid script.');
            return;
        }
        const { fileName, fullPath } = utils_1.getScriptFileName();
        fs.writeFileSync(path.join(fullPath), `${inlineScript}`);
        yield utils_1.giveExecutablePermissionsToFile(fullPath);
        let bashCommand = ` ${bashArg} /_temp/${fileName} `;
        let command = `run --workdir /github/workspace `;
        command += ` -v ${process.env.GITHUB_WORKSPACE}:/github/workspace `;
        command += ` -v /home/runner/.azure:/root/.azure `;
        command += ` -v ${utils_1.pathToTempDirectory}:/_temp `;
        command += ` mcr.microsoft.com/azure-cli:${azcliversion} ${bashCommand}`;
        console.log(command);
        yield utils_1.executeDockerScript(command);
        console.log("az script ran successfully.");
    }
    catch (error) {
        console.log("az CLI GitHub action failed.\n\n", error);
        core.setFailed(error.stderr);
    }
});
const checkIfValidVersion = (azcliversion) => __awaiter(this, void 0, void 0, function* () {
    const allVersions = yield utils_1.getAllAzCliVersions();
    for (let i = allVersions.length - 1; i >= 0; i--) {
        if (allVersions[i].trim() === azcliversion) {
            return true;
        }
    }
    return false;
});
run();
