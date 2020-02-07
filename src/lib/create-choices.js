module.exports = function createChoices (arr) {
  return arr.map(({ name, id, uid }) => {
    console.log('UID: ', uid)
    console.log('ID: ', id)
    return { name, value: uid || id }
  })
}
