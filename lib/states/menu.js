const inquirer = require('inquirer');

exports.default = () => {
    // return _this.prompt([
    //   {
    //     type    : 'input',
    //     name    : 'menu',
    //     message : `========================== \n\n What would you like to do? \n\n ========================== \n Type the corresponding number and press enter:\n\n 1) Add service \n 2) Finish \n 3) Dismiss changes\n\n`
    //   }
    // ])
  const menu = {
      type: 'list',
      name: 'menu',
      message: "What would you like to do?",
      choices: ['Add Service', 'Finish', 'Dismiss & Exit'],
  }

  return inquirer.prompt(menu);
}