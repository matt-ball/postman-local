const chalk = require('chalk')

module.exports = {
  info: (msg) => {
    console.log(chalk.blue(msg))
  },
  success: (msg) => {
    console.log(chalk.green(msg))
  },
  error: (msg) => {
    console.log(chalk.red(msg))
  }
}
