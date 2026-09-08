import { query } from '../config/database.js';

export const UserType = {
  list(includeInactive = false) {
    return query(
      "SELECT id, name, status, status = 'active' AS active, created_at, updated_at FROM user_types" +
      (includeInactive ? '' : " WHERE status = 'active'") +
      ' ORDER BY FIELD(name, \'Student\', \'Faculty / Employee\', \'Alumni\', \'Others\'), name',
    );
  },
};
