import { evaluateJS } from "./EvaluateJS.mjs";
import { evaluatePython } from "./EvaluatePython.mjs";

export const EvaluateSourceCode = function (solution) {
    this.solution = solution
}

EvaluateSourceCode.prototype.runCode = function (callback) {
    console.log(this.solution);
    let result = "This language is not yet supported"
    switch (this.solution.language) {
        case 'python':
            let promises = evaluatePython({ ...this.solution })
            Promise.all(promises).then(outputs => callback(outputs))
            break;
        case 'javascript':
            result = evaluateJS({ ...this.solution })
            callback(result)
            break;
        default:
            callback(result)
            break
    }
}