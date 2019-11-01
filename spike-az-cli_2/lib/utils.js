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
const fs = __importStar(require("fs"));
exports.TEMP_DIRECTORY = process.env.RUNNER_TEMP || os.tmpdir();
exports.START_SCRIPT_EXECUTION = 'Azure CLI GitHub Action: Starting script execution';
exports.createScriptFile = (inlineScript) => __awaiter(this, void 0, void 0, function* () {
    const fileName = `AZ_CLI_GITHUB_ACTION_${exports.getCurrentTime().toString()}.sh`;
    const filePath = path.join(exports.TEMP_DIRECTORY, fileName);
    fs.writeFileSync(filePath, `${inlineScript}`);
    yield exports.giveExecutablePermissionsToFile(filePath);
    return fileName;
});
exports.giveExecutablePermissionsToFile = (filePath) => __awaiter(this, void 0, void 0, function* () { return yield exec.exec(`chmod +x ${filePath}`, [], { silent: true }); });
exports.getCurrentTime = () => {
    return new Date().getTime();
};
class NullOutstreamStringWritable extends stream.Writable {
    constructor(options) {
        super(options);
    }
    _write(data, encoding, callback) {
        if (callback) {
            callback();
        }
    }
}
exports.NullOutstreamStringWritable = NullOutstreamStringWritable;
;
