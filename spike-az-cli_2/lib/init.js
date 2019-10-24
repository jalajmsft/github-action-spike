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
const utility_1 = require("./utility");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let sampleInput = core.getInput('sampleInput', { required: true });
            console.log(sampleInput);
            let option = {
                silent: true,
                outStream: process.stdout,
                errStream: process.stderr
            };
            // throwIfError(execSync("az", "--version", option));
            throwIfError(utility_1.execSync("docker", "run mcr.microsoft.com/azure-cli:2.0.69 az --version", option));
            // throwIfError(execSync("az", "account set --subscription \"" + subscriptionId + "\"", option));
            console.log("successful.");
        }
        catch (error) {
            console.log("please cehck the command.", error);
            core.setFailed(error);
        }
        finally {
            core.warning('update your workflows to use the new action.');
        }
    });
}
function throwIfError(resultOfToolExecution, errormsg) {
    if (resultOfToolExecution.code != 0) {
        core.error("Error Code: [" + resultOfToolExecution.code + "]");
        if (errormsg) {
            core.error("Error: " + errormsg);
        }
        throw resultOfToolExecution;
    }
}
run();
