import vm from "vm";

export function runJS(
  func = "let a=(d,e)=>e+d; a(c,d);",
  context = { c: 1, d: 2 }
) {
  try {
    vm.createContext(context);
    let result = vm.runInNewContext(func, context);
    return result;
  } catch (error) {
    error.stackTraceLimit = 1;
    return { message: error.message };
  }
}

export function evaluateJS({ sourceCode = "", inputContexts = [] }) {
  let outputs = inputContexts.map((context) => runJS(sourceCode, context));
  return outputs;
}
