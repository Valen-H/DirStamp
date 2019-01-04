#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const klaw = require("klaw");
const path = require("path");
const util_1 = require("util");
const os_1 = require("os");
const opts = {
    depthLimit: -1,
    preserveSymlinks: false,
    queueMethod: "shift"
}, isFalse = /^(no?|false)$/i, custom = {
    json: false
};
function remove(arr, rem) {
    let idx = arr.findIndex((v) => v === rem);
    if (idx < 0)
        return;
    return arr.splice(idx, 1);
} //remove
function ensure(pth) {
    let pths = pth.split(path.sep).slice(0, -1);
    let obj = struct, par = struct;
    for (var i of pths) {
        par = obj;
        obj = (obj[i] = obj[i] || {});
    }
    if (i) {
        par[i] = (par[i] instanceof Array) ? par[i] : [];
        par[i].push(pth.split(path.sep).pop());
    }
} //ensure
function breakdown(root = struct, offset = 0, key) {
    let tb = "\t".repeat(offset), ret = tb + key + os_1.EOL;
    tb += '\t';
    if (root instanceof Array) {
        for (let i of root) {
            ret += tb + i + os_1.EOL;
        }
    }
    else {
        for (let i in root) {
            ret += breakdown(root[i], offset + 1, i);
        }
    }
    return ret;
} //breakdown
let copy = Array.from(process.argv.slice(2)), struct = {}, pth = process.cwd();
opts.preserveSymlinks = copy.includes("-p");
custom.json = copy.includes("-j");
opts.queueMethod = (copy.includes("-P") ? "pop" : "shift");
if (copy.includes("-d")) {
    let idx;
    opts.depthLimit = Number.parseInt(copy[(idx = copy.findIndex((val) => val === "-d")) + 1]);
    if (isNaN(opts.depthLimit)) {
        console.error("INVALID DEPTH!\t-d", copy[idx + 1]);
    }
    copy.splice(idx, 2);
}
remove(copy, "-p");
remove(copy, "-P");
remove(copy, "-j");
klaw(pth = path.normalize(copy.pop() || pth), opts)
    .on("data", (item) => {
    ensure(path.relative(path.normalize(pth), item.path));
}).once("end", () => {
    if (custom.json) {
        process.stdout.write(util_1.inspect(struct, {
            compact: true,
            depth: Infinity,
            breakLength: Infinity
        }).replace(/(\B) (\B)?/gmi, "$1$2"));
    }
    else {
        process.stdout.write(breakdown(struct, 0, path.normalize(pth)));
    }
}).once("error", (err, item) => {
    console.error(item.path, os_1.EOL, err.message);
});
//# sourceMappingURL=dirstamp.js.map