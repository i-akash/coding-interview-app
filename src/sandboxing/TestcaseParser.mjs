export const TestcaseParser = function (jsonInputFormat = {}, testcases = []) {
  this.jsonInputFormat = jsonInputFormat;
  this.testcases = testcases;

  this.params = Object.keys(this.jsonInputFormat);
};

TestcaseParser.prototype.parse = function () {
  return this.testcases.map((t) => this.lex(t));
};

TestcaseParser.prototype.lex = function (test) {
  this.initializeState(test);
  this.params.forEach((param) => {
    console.log(this.state);
    switch (this.jsonInputFormat[param]) {
      case "int": {
        this.parseSingleElement(parseInt, param);
        break;
      }
      case "float": {
        this.parseSingleElement(parseFloat, param);
        break;
      }
      case "string": {
        this.parseSingleElement((s) => s, param);
        break;
      }
      case "[int]": {
        this.parseArrayElement(parseInt, param);
        break;
      }
      case "[float]": {
        this.parseArrayElement(parseFloat, param);
        break;
      }
      case "[string]": {
        this.parseArrayElement((s) => s, param);
        break;
      }
      default:
        break;
    }
  });
  return this.state.context;
};

TestcaseParser.prototype.initializeState = function (test) {
  this.state = {
    context: {},
    maxArrayLength: 10000000,
    iter: 0,
    input: test.input.split(" "),
  };
};

TestcaseParser.prototype.setState = function (newState) {
  this.state = {
    ...this.state,
    ...newState,
  };
};

TestcaseParser.prototype.parseSingleElement = function (parseFunc, param) {
  let { maxArrayLength, input, iter, context } = this.state;
  maxArrayLength = parseFunc(input[iter++]);
  context[param] = maxArrayLength;
  this.setState({
    maxArrayLength,
    iter,
    context,
  });
};

TestcaseParser.prototype.parseArrayElement = function (parseFunc, param) {
  let { context, iter, maxArrayLength, input } = this.state;
  context[param] = [];
  for (let index = iter; index < iter + maxArrayLength; index++) {
    context[param].push(parseFunc(input[index]));
  }
  iter = iter + maxArrayLength;
  this.setState({
    iter,
    context,
  });
};
