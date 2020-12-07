const inquirer = require('inquirer');
const elasticsearch = require('../../helpers/elasticsearch');

const _init = async () => {
    return inquirer.prompt([
      {
        type    : 'input',
        name    : 'domain_name',
        message : `\n\n========================== CREATING ELASTICSEARCH RESOURCE ==========================\n\nWhat would you like your Elasticsearch domain name to be?\n\n>`,
        default: '${self:provider.stackName}-search'
      },
      {
        type    : 'input',
        name    : 'index',
        message : `What would you like the index to be? (optional)\n\n>`,
        validate: (entry) => {
          if(!entry || entry.length === 0) {
            return 'invalid entry. try again.';
          }
          return true;
        }
      },
      {
        type    : 'input',
        name    : 'type',
        message : `What would you like the type to be?  (optional)\n\n>`,
        validate: (entry) => {
          if(!entry || entry.length === 0) {
            return 'invalid entry. try again.';
          }
          return true;
        }
      }
    ])
}

const _addESDomain = async (args) => {
  const { domain_name = '${self:provider.stackName}-search', index, type } = args;
  let _domain_name = domain_name;
  if(!domain_name|| typeof domain_name !== "string" || domain_name.length === 0) _domain_name = '${self:provider.stackName}-search';
    await elasticsearch.init({
        domain_name: _domain_name,
        index,
        type
    });
}

exports.handler = async () => {
  const args = await _init();
  return _addESDomain(args);
}