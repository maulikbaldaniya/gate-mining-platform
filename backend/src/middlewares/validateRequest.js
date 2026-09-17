const ApiResponse = require('../utils/apiResponse');

function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const details = error.details.map((d) => d.message);
      return ApiResponse.error(res, 'Validation error', 400, 'VALIDATION_ERROR', details);
    }
    req.body = value;
    next();
  };
}

module.exports = {
  validateBody,
};
