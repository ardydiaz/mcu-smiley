UPDATE ratings
SET status = 'inactive'
WHERE value = 1
  OR name IN ('Very Dissatisfied', 'Very poor');
