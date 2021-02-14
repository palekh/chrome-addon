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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function requestToken(id, secret, refresh) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('=== Requesting token ===');
        console.log('Making call to request token...');
        const response = yield axios_1.default.post('https://www.googleapis.com/oauth2/v4/token', {
            client_id: id,
            client_secret: secret,
            refresh_token: refresh,
            grant_type: 'refresh_token'
        });
        console.log('=== Requesting token finished ===');
        return response.data.access_token;
    });
}
function createAddon(zip, token) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('=== Creating addon ===');
        const endpoint = `https://www.googleapis.com/upload/chromewebstore/v1.1/items?uploadType=media`;
        console.log('Reading zip file...');
        const body = fs_1.default.readFileSync(path_1.default.resolve(zip));
        console.log('Uploading zip file...');
        const response = yield axios_1.default.post(endpoint, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-goog-api-version': '2'
            },
            maxContentLength: Infinity
        });
        console.log(`Response: ${JSON.stringify(response.data)}`);
        console.log('=== Creating addon finished ===');
    });
}
function updateAddon(id, zip, token) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('=== Updating addon ===');
        const endpoint = `https://www.googleapis.com/upload/chromewebstore/v1.1/items/${id}?uploadType=media`;
        console.log('Reading zip file...');
        const body = fs_1.default.readFileSync(path_1.default.resolve(zip));
        console.log('Uploading zip file...');
        const response = yield axios_1.default.put(endpoint, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-goog-api-version': '2'
            },
            maxContentLength: Infinity
        });
        console.log(`Response: ${JSON.stringify(response.data)}`);
        console.log('=== Updating addon finished ===');
    });
}
function publishAddon(id, token, publishTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('=== Publishing addon ===');
        const endpoint = `https://www.googleapis.com/chromewebstore/v1.1/items/${id}/publish`;
        console.log('Making call to update addon...');
        const response = yield axios_1.default.post(endpoint, { target: publishTarget }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-goog-api-version': '2'
            }
        });
        console.log(`Response: ${JSON.stringify(response.data)}`);
        console.log('=== Publishing addon finished ===');
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('= Start @palekh/chrome-adddon action =');
            console.log('Reading environment variables...');
            const clientId = core.getInput('client-id', { required: true });
            const clientSecret = core.getInput('client-secret', { required: true });
            const refresh = core.getInput('refresh-token', { required: true });
            const zip = core.getInput('zip', { required: true });
            const extension = core.getInput('extension');
            const publishTarget = core.getInput('publish-target');
            const token = yield requestToken(clientId, clientSecret, refresh);
            core.debug(`Token: ${token}`);
            if (extension && extension.length > 0) {
                yield updateAddon(extension, zip, token);
                yield publishAddon(extension, token, publishTarget);
            }
            else {
                yield createAddon(zip, token);
                yield publishAddon(extension, token, publishTarget);
            }
            console.log('= Finish @palekh/chrome-adddon action =');
        }
        catch (error) {
            core.setFailed(error);
            console.log('= Fail @palekh/chrome-adddon action =');
        }
    });
}
run();
