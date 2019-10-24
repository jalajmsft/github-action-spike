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
// src/hello-world.ts
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const io = __importStar(require("@actions/io"));
const { spawn } = require('child_process');
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const bash = yield io.which('bash', true);
        console.log(bash);
        //console.log(stdout);
        yield exec.exec(`"${bash}"`, ['docker run mcr.microsoft.com/azure-cli:2.0.69 az --version'], { 'cwd': './lib' });
        // await exec.exec(`"${bash}"`, ['sample.sh'], {'cwd':'./lib'});
        const nameToGreet = core.getInput('who-to-greet');
        if (nameToGreet == 'Octocat') {
            // the Octocat doesn't want to be greeted here!
            throw new Error("No Octocat greetings, please.");
        }
        else {
            console.log(`Hello ${nameToGreet}!`);
            const time = (new Date()).toTimeString();
            core.setOutput("time", time);
        }
    });
}
run();
