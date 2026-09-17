const MISTAKE_TYPES = {
  M1: {
    code: 'M1',
    name: 'Concept Not Understood',
    description: 'Fundamental theoretical concept was unclear or misunderstood',
  },
  M2: {
    code: 'M2',
    name: 'Formula Forgotten',
    description: 'Forgot the relevant formula, variable definitions, or units',
  },
  M3: {
    code: 'M3',
    name: 'Calculation Error',
    description: 'Arithmetical, decimal, or algebraic computation error',
  },
  M4: {
    code: 'M4',
    name: 'Question Misread',
    description: 'Did not notice key keywords like NOT, EXCEPT, maximum, minimum, or unit conversions',
  },
  M5: {
    code: 'M5',
    name: 'Time Management Error',
    description: 'Rushed the solution or ran out of time',
  },
  M6: {
    code: 'M6',
    name: 'Careless / Silly Mistake',
    description: 'Marked wrong option accidentally or miscalculated simple values',
  },
};

module.exports = {
  MISTAKE_TYPES,
  MISTAKE_CODES: Object.keys(MISTAKE_TYPES),
};
