module.exports = function createChoices (arr) {
  return arr.map(({ name, id, uid }) => { return { name, value: uid || id } })
}
