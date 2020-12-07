const inquirer = require('inquirer');
const rds_postgres = require('../../helpers/rds-postgres');

const _init = async () => {
    return inquirer.prompt([
      {
        type    : 'input',
        name    : 'db_name',
        message : `\n\n========================== CREATING RDS-POSTGRES RESOURCE ==========================\n\nWhat would you like your Postgres DB name to be?\n\n>`,
        validate: (entry) => {
          if(!entry || entry.length === 0) {
            return 'invalid entry. try again.';
          }
          return true;
        }
      }
    ])
}

const _addRdsPostGres = async (args) => {
    await await rds_postgres.init({ ...args, engine: 'postgres'});
}

exports.handler = async (service)  => {
  const args = await _init();
  const formatted_api_name = service || `change-me-later`;
  return _addRdsPostGres({...args, api_name: `${formatted_api_name}`});
}