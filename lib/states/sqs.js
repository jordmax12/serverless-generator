const inquirer = require('inquirer');
const sqs = require('../../helpers/sqs');
const { acceptableBoolean } = require('../helpers/boolean');

const _init = async () => {
    return inquirer.prompt([
        {
            type    : 'input',
            name    : 'queue_name',
            message : `\n\n========================== CREATING SQS RESOURCE ==========================\n\nWhat would you like queue name to be?\n\n>`,
            validate: (entry) => {
                if(!entry || entry.length === 0) {
                  return 'invalid entry. try again.';
                }
                return true;
              }
        },
        {
            type    : 'input',
            name    : 'includeDLQ',
            message : `Would you like to include a Dead Letter Queue (DLQ) (Any tickets unsuccessfully processed will end up in this queue)?`
        }
    ])
}

const _addQueue = async (queue_name, includeDLQ ) => {
    return sqs.init({
        queue_name,
        includeDLQ
    })
}

exports.handler = async () => {
    const init_response = await _init();
    const { queue_name, includeDLQ } = init_response;
    const _includeDLQ = acceptableBoolean(includeDLQ);
    return _addQueue(queue_name, _includeDLQ);
}