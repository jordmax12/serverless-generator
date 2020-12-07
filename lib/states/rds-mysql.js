const inquirer = require('inquirer');
const rds_mysql = require('../../helpers/rds-mysql');

const _init = async () => {
    return inquirer.prompt([
      {
        type    : 'input',
        name    : 'db_name',
        message : `\n\n========================== CREATING RDS-MYSQL RESOURCE ==========================\n\nWhat would you like your MySQL DB name to be?\n\n>`,
        validate: (entry) => {
          if(!entry || entry.length === 0) {
            return 'invalid entry. try again.';
          }
          return true;
        }
      }
    ])
}

const _addRdsMysql = async (args) => {
    await await rds_mysql.init({ ...args, engine: 'mysql'});
}

exports.handler = async (service) => {
  const args = await _init();
  const formatted_api_name = service || `change-me-later`;
  return _addRdsMysql({...args, api_name: `${formatted_api_name}`});
}