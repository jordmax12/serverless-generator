const { supported_node_versions, supported_python_versions, supported_java_versions } = require('../helpers/runtimes');
const { checkCredentials } = require('./aws-profiles');
const inquirer = require('inquirer');

const _runtimeMapper = {
  node: supported_node_versions,
  python: supported_python_versions,
  java: supported_java_versions
}

exports.default = async _this => {
  const runtime = await inquirer.prompt([
    {
      type    : 'list',
      name    : 'runtime',
      message : `What runtime would you like this project to be?`,
      choices: ['node', 'python', 'java']
    }
  ])

  const base_questions = [
    {
      type    : 'list',
      name    : 'runtime_version',
      message : 'What runtime version would you like?',
      choices: _runtimeMapper[runtime.runtime]
    }
  ];

  const serverless_questions = [    
  {
    type    : 'input',
    name    : 'service',
    message : 'What would you like to call your serverless service? Please note, try to make this as unique as possible not to conflict with other builds. (example grower-contracts, grower-fields, {ANY_STRING}-{ANY_STRING})\n\n>',
    validate: (entry) => {
      if(entry.indexOf('-') === -1) {
        return 'Your service name must consist of 2 strings, no white spaces, and a `-` between them.';
      }

      if(entry.replace(/ /g, '').length < 2) {
        return 'Your service name must consist of 2 strings, no white spaces, and a `-` between them.';
      }

      if(entry.split('-')[1].replace(/ /g, '').length === 0) {
        return 'Your service name must consist of 2 strings, no white spaces, and a `-` between them.';
      }

      return true;
    }
  }]

  const _base_questions =  await inquirer.prompt(base_questions);
  const serverless_answers = await inquirer.prompt(serverless_questions);
  await checkCredentials();

  return {
    ...runtime,
    ..._base_questions,
    ...serverless_answers
  };
}