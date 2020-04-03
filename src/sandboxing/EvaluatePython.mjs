import pythonShell from 'python-shell';
import { preprocess } from './PreprocessTestcases.mjs'
import { promisify } from 'util'
pythonShell.PythonShell.runString = promisify(pythonShell.PythonShell.runString)


let header = `

import sys
import json


`

let mainCode = `

if __name__ == "__main__":
    myJson=sys.argv[1]
    loaded=list(json.loads(myJson).values())
    print(solve(loaded[0],loaded[1]))


    `


function runPython(sourceCode, inputContext, callback) {
    let options = {
        args: [JSON.stringify(inputContext)]
    };
    return pythonShell.PythonShell.runString(sourceCode, options).then(results => {
        if (!!results.length)
            return JSON.parse(results[results.length - 1])
    })
        .catch(error => error)
}

export function evaluatePython({ sourceCode, inputConstraint = {}, testCases = [] }) {
    let parsedInputContexts = preprocess(inputConstraint, testCases)
    console.log("context", parsedInputContexts);
    let promises = parsedInputContexts.map(context => runPython(header + sourceCode + mainCode, context))
    return promises
}
