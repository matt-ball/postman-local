const chalk = require('chalk')

module.exports = {
  info: (msg) => {
    console.log('💭', chalk.cyan(msg))
  },
  success: (msg) => {
    console.log('🚀', chalk.green(msg))
  },
  error: (msg) => {
    console.log('💥', chalk.red(msg))
  }
}
