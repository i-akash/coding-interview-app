import { evaluateJS } from "./EvaluateJS.mjs";
import { evaluatePython } from "./EvaluatePython.mjs";
import { TestcaseParser } from "./TestcaseParser.mjs";

export const EvaluateSourceCode = function (solution) {
  this.solution = solution;
  this.solution.inputContexts = new TestcaseParser(
    solution.inputConstraint,
    solution.testCases
  ).parse();
};

EvaluateSourceCode.prototype.runCode = function (callback) {
  let result = "This language is not yet supported";
  console.log(this.testCases);

  switch (this.solution.language) {
    case "python":
      let promises = evaluatePython(this.solution);
      Promise.all(promises).then((outputs) => callback(outputs));
      break;
    case "javascript":
      result = evaluateJS(this.solution);
      callback(result);
      break;
    default:
      callback(result);
      break;
  }
};
