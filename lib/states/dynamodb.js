const inquirer = require('inquirer');
const dynamodb = require('../../helpers/dynamodb');

const _init = async () => {
    return inquirer.prompt([
      {
        type    : 'input',
        name    : 'db_name',
        message : `\n\n========================== CREATING DYNAMODB RESOURCE ==========================\n\nWhat would you like your Dynamo DB name to be?\n\n>`,
        validate: (entry) => {
          if(!entry || entry.length === 0) {
            return 'invalid entry. try again.';
          }
          return true;
        }
      },
      {
        type    : 'input',
        name    : 'range_key',
        message : `What would you like (leave blank if none) for a range (sort) key?\n\n>`
      }
    ])
}

const _addDDB = async (args) => {
    await dynamodb.init(args);
}

exports.handler = async () => {
  const args = await _init();
  return _addDDB(args);
}