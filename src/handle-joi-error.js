/**
 * Generic error for Joi validation
 * @param {string} targetName Name of the place where the error occured
 * @return {function} Throws an error on failure
 */
module.exports = targetName => (err) => {
  if (err) {
    err.message = targetName + ' config validation failed.\n' + err.message;
    throw err;
  }
};
