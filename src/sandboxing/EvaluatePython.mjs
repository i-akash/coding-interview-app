import pythonShell from 'python-shell';
import { preprocess } from './PreprocessTestcases.mjs'
import { promisify } from 'util'
pythonShell.PythonShell.runString = promisify(pythonShell.PythonShell.runString)


let header = `

import sys
import json


`
let func = `
def solve(n,numArray):
    return "akash"
`

let mainCode = `

if __name__ == "__main__":
    myJson=sys.argv[1]
    loadedDict = json.loads(myJson)
    print(solve(**loadedDict))


    `

// pythonShell.PythonShell.runString(sourceCode

function runPython(sourceCode, inputContext, callback) {
    let options = {
        args: [JSON.stringify(inputContext)]
    };
    return pythonShell.PythonShell.runString(sourceCode, options).then(results => {
        if (results.length > 0) {
            let result = results[results.length - 1]
            console.log("py--> ", result);

            result = result.replace(/'/g, "\"")

            if (result[0] !== '[' && result[0] !== '{')
                return result
            console.log(JSON.parse(result));
            return JSON.parse(result)
        }
    })
        .catch(error => error.messsage)
}

export function evaluatePython({ sourceCode, inputConstraint = {}, testCases = [] }) {
    let parsedInputContexts = preprocess(inputConstraint, testCases)
    console.log("context", parsedInputContexts);
    let promises = parsedInputContexts.map(context => runPython(header + sourceCode + mainCode, context))
    return promises
}
