const Joi = require('joi');

const quizSubmitSchema = Joi.object({
  topicId: Joi.number().integer().positive().required(),
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.number().integer().positive().required(),
        selectedOption: Joi.string().allow('', null).required(),
        timeSpentSeconds: Joi.number().integer().min(0).default(0),
      })
    )
    .required(),
  durationSeconds: Joi.number().integer().min(0).default(0),
});

const testSubmitSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.number().integer().positive().required(),
        selectedOption: Joi.string().allow('', null).required(),
        timeSpentSeconds: Joi.number().integer().min(0).default(0),
      })
    )
    .required(),
});

module.exports = {
  quizSubmitSchema,
  testSubmitSchema,
};
