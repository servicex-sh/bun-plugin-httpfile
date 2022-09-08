const {basename} = require('path');
const {parseHttpfile} = require('./httpfile');
const {readFileSync} = require("fs");

const name = 'httpfile'

let loggingVerbose = false;

const setup = (builder) => {
    // Run this function on any import that ends with .yaml or .yml
    builder.onLoad({filter: /\.(http)$/}, (args) => {
        let originalPath = args.path;
        const httpfileText = readFileSync(originalPath, "utf8");
        const targets = parseHttpfile(httpfileText);
        // generate javascript stub code
        let contents = targets.map(target => {
            return target.toCode();
        }).join("\n\n");
        if (loggingVerbose) {
            // generate typescript declaration file
            let declareFileName = basename(originalPath);
            let declaredApiList = targets.map(target => {
                return target.toApiDeclare();
            }).join("\n    ");
            let moduleDeclareCode = `declare module '*${declareFileName}' {\n    ${declaredApiList}\n}`;
            // logging
            let declaredFileName = declareFileName.replace(".http", "-http.d.ts");
            console.log("=====================" + declaredFileName + "==========================================");
            console.log(moduleDeclareCode);
            console.log("=====================" + declareFileName + ".js========================================");
            console.log(contents);
            console.log("=======================================================================================");

        }
        return {contents, loader: "js"};
    });
}

/**
 * build Bun httpfile plugin
 * @param {boolean=} verbose - enable verbose logging
 * @returns {{name: string, setup: function}} Bun plugin object
 */
export default function buildHttpFilePlugin(verbose) {
    if (verbose) {
        loggingVerbose = true;
    }
    return {name, setup};
}




