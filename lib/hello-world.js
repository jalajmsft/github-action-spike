"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
const io = __importStar(require("@actions/io"));
const { spawn } = require('child_process');
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("starting the execution...");
            const ls = spawn('ls pwd', ['-lh', '/usr']);
            ls.stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);
            });
            ls.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });
            ls.on('close', (code) => {
                console.log(`child process exited with code ${code}`);
            });
            const bash = yield io.which('bash', true);
            console.log(bash);
            //console.log(stdout);
            //await exec.exec(`"${bash}"`, ['sample.sh']);
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
            // Get the JSON webhook payload for the event that triggered the workflow
            //const payload = JSON.stringify(github.context.payload, undefined, 2)
            //console.log(`The event payload: ${payload}`);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
