import vm from 'vm'
import { preprocess } from './PreprocessTestcases.mjs'


//"const func=(a=10)=>a;func()"
export function runJS(func = "let a=(d,e)=>e+d; a(c,d);", context = { c: 1, d: 2 }) {
    try {
        vm.createContext(context)
        let result = vm.runInNewContext(func, context)
        console.log("js result : ", result);
        return result
    } catch (error) {
        error.stackTraceLimit = 1
        return { message: error.message }
    }
}

export function evaluateJS({ sourceCode = "", inputConstraint = {}, testCases = [] }) {
    console.log(inputConstraint, testCases);

    let parsedInputContexts = preprocess(inputConstraint, testCases)
    console.log("context", parsedInputContexts);

    let outputs = parsedInputContexts.map(context => runJS(sourceCode, context))
    console.log(outputs);

    return outputs
}

