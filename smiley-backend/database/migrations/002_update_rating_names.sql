UPDATE ratings SET
  emoji = CAST(UNHEX('F09F9884') AS CHAR CHARACTER SET utf8mb4),
  name = 'Very Satisfied',
  status = 'active'
WHERE value = 5;

UPDATE ratings SET
  emoji = CAST(UNHEX('F09F9982') AS CHAR CHARACTER SET utf8mb4),
  name = 'Satisfied',
  status = 'active'
WHERE value = 4;

UPDATE ratings SET
  emoji = CAST(UNHEX('F09F9890') AS CHAR CHARACTER SET utf8mb4),
  name = 'Neutral',
  status = 'active'
WHERE value = 3;

UPDATE ratings SET
  emoji = CAST(UNHEX('F09F9981') AS CHAR CHARACTER SET utf8mb4),
  name = 'Dissatisfied',
  status = 'active'
WHERE value = 2;

UPDATE ratings SET
  emoji = CAST(UNHEX('F09F989E') AS CHAR CHARACTER SET utf8mb4),
  name = 'Very Dissatisfied',
  status = 'active'
WHERE value = 1;
