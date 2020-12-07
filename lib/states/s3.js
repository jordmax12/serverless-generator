const inquirer = require('inquirer');
const s3 = require('../../helpers/s3');
const { acceptableBoolean } = require('../helpers/boolean');

const _init = async () => {
    return inquirer.prompt([
      {
        type    : 'input',
        name    : 'bucket_name',
        message : `\n\n========================== CREATING S3 RESOURCE ==========================\n\nWhat would you like your S3 bucket name to be?\n\n>`,
        validate: (entry) => {
          if(!entry || entry.length === 0) {
            return 'invalid entry. try again.';
          }
          return true;
        }
      },
      {
        type    : 'input',
        name    : 'is_public',
        message : `Do you want this to be a public policy bucket?\n\n>`
      }
    ])
}

const _addBucket = async (args) => {
  const _is_public = acceptableBoolean(args.is_public);
    await s3.init({
        bucket_name: args.bucket_name,
        isPublic: _is_public
    })
}

exports.handler = async () => {
  const args = await _init();
  return _addBucket(args);
}