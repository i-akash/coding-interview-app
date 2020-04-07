export const preprocess = (jsonInputFormat = {}, testCases = []) => {
    let params = Object.keys(jsonInputFormat)
    return testCases.map(test => {
        let context = {}
        let maxArrayLength = 10000000;
        let iter = 0
        let input = test.input.split(' ')

        params.forEach(param => {
            switch (jsonInputFormat[param]) {
                case "int":
                    maxArrayLength = parseInt(input[iter++])
                    context[param] = maxArrayLength
                    break;
                case "float":
                    context[param] = parseFloat(input[iter++])
                    break;
                case "string":
                    context[param] = input[iter++]
                    break;
                case "[int]":
                    context[param] = []
                    for (let index = iter; index < iter + maxArrayLength; index++) {
                        context[param].push(parseInt(input[index]))
                    }
                    iter = iter + maxArrayLength
                    break
                case "[float]":
                    context[param] = []
                    for (let index = iter; index < iter + maxArrayLength; index++) {
                        context[param].push(parseFloat(input[index]))
                    }
                    iter = iter + maxArrayLength
                    break
                case "[string]":
                    context[param] = []
                    for (let index = iter; index < iter + maxArrayLength; index++) {
                        context[param].push(input[index])
                    }
                    iter = iter + maxArrayLength
                    break
                default:
                    break;
            }
        })
        return context
    })
}