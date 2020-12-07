const aws_config_helper = require('../../helpers/aws');
const inquirer = require('inquirer');
const { aws_credentials_route, path_exists } = require('../../helpers/file');
const fs = require('fs');
const chalk = require('chalk');

let STATE = "INIT";


const _config_questions = [
    {
      type    : 'input',
      name    : 'profile_name',
      message : 'What\'s the profile name (example: dev, tools, dns)?'
    },
    {
      type    : 'input',
      name    : 'region',
      message : 'What\'s the region? (default: us-east-2)',
      validate : (entry) => {
        const region_regex = '(us(-gov)?|ap|ca|cn|eu|sa)-(central|(north|south)?(east|west)?)-\\d';
        const regex = RegExp(region_regex, 'g');
        if(!regex.test(entry)) {
            return `Seemingly invalid region: ${entry}`;
        }
        return true;
      }
    },
    {
      type    : 'input',
      name    : 'account_id',
      message : 'What\'s the account id (12 digit account ID found in AWS)?',
      validate : (entry) => {
        if(!entry || entry.length !== 12) {
            return 'Account ID should be 12 digits found in your AWS UI.'
        } 
        return true;
      }
    },
    {
      type    : 'input',
      name    : 'role_name',
      message : 'What\'s the role name (found at the end of the IAM role ARN: arn:aws:iam::ACCOUNT_ID:role/ROLE_NAME_HERE)?',
      validate : (entry) => {
        if(entry.indexOf('arn:aws:iam::') > -1) {
            return 'Dont include the fule role arn, only the role name.'
        } else if(entry.indexOf(':mfa/') > -1) {
            return 'Dont include the fule role arn, only the role name.'
        }
        return true;
      }
    },
    {
      type    : 'input',
      name    : 'mfa_serial',
      message : 'Provide a valid MFA serial (it should look like this: arn:aws:iam::YOUR_ACCOUNT_ID_HERE:mfa/YOUR_MFA_EMAIL_HERE)',
      validate : (entry) => {
        if(entry.indexOf('arn:aws:iam::') === -1) {
            return 'invalid MFA serial. Example: arn:aws:iam::YOUR_ACCOUNT_ID_HERE:mfa/YOUR_MFA_EMAIL_HERE'
        } else if(entry.indexOf(':mfa/') === -1) {
            return 'invalid MFA serial. Example: arn:aws:iam::YOUR_ACCOUNT_ID_HERE:mfa/YOUR_MFA_EMAIL_HERE'
        }
        return true;
      }
    }
  ];

  const _credentials_questions = [
    {
      type    : 'input',
      name    : 'profile_name',
      message : `\n\nWhat's the profile name (example: default)?\n\n>`,
      validate : (entry) => {
        if(!entry || entry.trim().length === 0) {
            return 'Please provide a profile name.'
        } 
        return true;
      }
    },
    {
      type    : 'input',
      name    : 'access_key',
      message : `\n\nWhat's the access key id?\n\n>`,
      validate : (entry) => {
        const access_key_regex = '(^|[^A-Z0-9])[A-Z0-9]{20}(?![A-Z0-9])';
        const regex = RegExp(access_key_regex, 'g');
        if(!regex.test(entry)) {
          return 'Please provide a real Access Key.'
        } 
        return true;
      }
    },
    {
      type    : 'input',
      name    : 'secret_key',
      message : `\n\nWhat's the secret access key?\n\n>`,
      validate : (entry) => {
        const secret_key_regex = '^[A-Z0-9/+=]{40}';
        const regex = RegExp(secret_key_regex, 'gi');
        if(!regex.test(entry) || entry.length > 40) {
            return 'Please provide a real Secret Key.'
        } 
        return true;
      }
    },
    {
      type    : 'input',
      name    : 'region',
      message : `\n\nWhat's the region? (default: us-east-2)\n\n>`,
      validate : (entry) => {
        const region_regex = '(us(-gov)?|ap|ca|cn|eu|sa)-(central|(north|south)?(east|west)?)-\\d';
        const regex = RegExp(region_regex, 'g');
        if(!regex.test(entry)) {
            return `Seemingly invalid region: ${entry}`;
        }
        return true;
      }
    }
  ];

const _profile_loop  = async () => {
  const main_menu_choice = await inquirer.prompt([
    {
      type    : 'list',
      name    : 'configuring_aws_option',
      message : 'CONFIGURING AWS',
      choices: ['Add config profile', 'Exit AWS Configuration']
    }
  ]);

  if(main_menu_choice.configuring_aws_option === "Add config profile") {


    const responses = await inquirer.prompt(_config_questions);

    const { profile_name, account_id, role_name, region = 'us-east-2', mfa_serial = false } = responses;
    await aws_config_helper.addProfile(profile_name, account_id, role_name, mfa_serial, region);

  } else {
    STATE = "AWS_PROFILE_COMPLETE";
  }

  return true;
}

exports.checkCredentials = async () => {
  const exists = await path_exists(aws_credentials_route());
  if(!exists) {
    // here we ask credentials questions and add base credential.
    console.log(chalk.bgRed(`\nWe did not detect a credentials file in your root AWS folder. We need this file for this process to work. We will create it for you:`))
    const responses = await inquirer.prompt(_credentials_questions);
      const { access_key, secret_key, profile_name, region = 'us-east-2' } = responses;
      const test = await aws_config_helper.addCredentials(access_key, secret_key, profile_name, region);
      console.log('logging test', test);
      return test;
  }

  console.log(chalk.black.bgGreen(`\nWe've detected a credentials file in your root AWS folder. Skipping credentials setup.`))

}

exports.default = async () => {
  const aws_profiles_questions = [
    {
      type    : 'input',
      name    : 'aws_profiles',
      message : `Would you like to add any AWS profiles to your config?`
    }
  ]

  const aws_profiles_answer = await inquirer.prompt(aws_profiles_questions);
  console.log('logging aws profile answers', aws_profiles_answer)

  const aws_profiles = acceptableBoolean(aws_profiles_answer.aws_profiles);

  if(aws_profiles) {
    STATE = "SET_UP_PROFILE";
    while(STATE === "SET_UP_PROFILE") {
      await _profile_loop(_this);
    }
  }

  return {
    ...runtime,
    ..._base_questions,
    ...serverless_answers
  };
}