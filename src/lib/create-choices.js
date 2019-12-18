module.exports = function createChoices (arr) {
  return arr.map(({ name, id }) => { return { name, value: id } })
}
