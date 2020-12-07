const inquirer = require('inquirer');
const neo4j = require('../../helpers/neo4j');

const _init = async () => {
    return inquirer.prompt([
      {
        type    : 'input',
        name    : 'bucket_name',
        message : `\n\n========================== CREATING NEO4J RESOURCE ==========================\n\nWhat would you like your Neo4J DB name to be?\n\n>`,
        validate: (entry) => {
          if(!entry || entry.length === 0) {
            return 'invalid entry. try again.';
          }
          return true;
        }
      }
    ])
}

const _addNeo4j = async (args) => {
  await neo4j.init();
}

exports.handler = async () => {
  const args = await _init();
  return _addNeo4j(args);
}