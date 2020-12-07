const inquirer = require('inquirer');
const serverless_helper = require('../../helpers/serverless');

const _init = async () => {
    return inquirer.prompt([
      {
        type    : 'input',
        name    : 'domain_name',
        message : `\n\n========================== CREATING APIGATEWAY RESOURCE ==========================\n\n(optional) What is the domain name (example: google.com)\n\n>`,
        validate: (entry) => {
          if(!entry || entry.length === 0) {
            return 'invalid entry. try again.';
          }
          return true;
        }
      },
      {
        type    : 'input',
        name    : 'custom_uri_suffix',
        message : `(optional) Custom URI Suffix (default: api, appears after stage example: \`dev-{custom_uri_suffix}.domain-name\`))\n\n>`,
        default : 'api'
      }
    ])
}

const _addApiGateway = async (args) => {
    const _args = {};
    for(const [key, value] of Object.entries(args)) {
        if(value && typeof value === "string" && value.length > 0) _args[key] = value;
    }
    return serverless_helper.addResources(['apigateway'], _args);
}

exports.handler = async () => {
  const args = await _init();
  return _addApiGateway(args);
}