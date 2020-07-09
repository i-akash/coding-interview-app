import pythonShell from "python-shell";
import { promisify } from "util";
pythonShell.PythonShell.runString = promisify(
  pythonShell.PythonShell.runString
);

let header = `

import sys
import json


`;
let func = `
def solve(n,numArray):
    return "akash"
`;

let mainCode = `

if __name__ == "__main__":
    myJson=sys.argv[1]
    loadedDict = json.loads(myJson)
    print(solve(**loadedDict))


    `;

function runPython(sourceCode, inputContext, callback) {
  let options = {
    args: [JSON.stringify(inputContext)],
  };
  return pythonShell.PythonShell.runString(sourceCode, options)
    .then((results) => {
      if (results.length > 0) {
        let result = results[results.length - 1];
        result = result.replace(/'/g, '"');
        if (result[0] !== "[" && result[0] !== "{") {
          return result;
        } else {
          return JSON.parse(result);
        }
      }
    })
    .catch((error) => error.messsage);
}

export function evaluatePython({ sourceCode, inputContexts = [] }) {
  let promises = inputContexts.map((context) =>
    runPython(header + sourceCode + mainCode, context)
  );
  return promises;
}
