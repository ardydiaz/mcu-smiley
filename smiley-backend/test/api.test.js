import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-secret-at-least-32-characters-long';
const { default: app } = await import('../src/app.js');
const { pool } = await import('../src/config/database.js');
const { User } = await import('../src/models/User.js');
const { voteSchema, filterSchema } = await import('../src/validations/voteValidation.js');
const { departmentSchema } = await import('../src/validations/departmentValidation.js');
const { locationSchema } = await import('../src/validations/locationValidation.js');
const { terminalSchema, terminalQuerySchema } = await import('../src/validations/terminalValidation.js');
const { terminalAssignmentSchema, terminalAssignmentQuerySchema } = await import('../src/validations/terminalAssignmentValidation.js');
const { voteFilter } = await import('../src/models/Vote.js');
const { submitVote } = await import('../src/services/voteService.js');
const { createDepartment, updateDepartment } = await import('../src/controllers/departmentController.js');
const { Department } = await import('../src/models/Department.js');
const { createLocation, updateLocation } = await import('../src/controllers/locationController.js');
const { Location } = await import('../src/models/Location.js');
const { createTerminal, updateTerminal } = await import('../src/controllers/terminalController.js');
const { Terminal } = await import('../src/models/Terminal.js');
const { csvCell, toCsv } = await import('../src/services/reportService.js');
let server, base;
before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
});
after(async () => {
  await new Promise(resolve => server.close(resolve));
  await pool.end();
});
test('health and unknown routes return JSON', async () => {
  assert.equal((await fetch(base + '/api/health')).status, 200);
  const response = await fetch(base + '/missing');
  assert.equal(response.status, 404);
  assert.equal((await response.json()).success, false);
});
test('swagger docs and OpenAPI JSON are available', async () => {
  const docs = await fetch(base + '/api/docs/');
  assert.equal(docs.status, 200);
  assert.match(await docs.text(), /swagger-ui-bundle\.js/);
  const response = await fetch(base + '/api/docs.json');
  assert.equal(response.status, 200);
  const document = await response.json();
  assert.equal(document.openapi, '3.0.3');
  assert.ok(document.paths['/auth/login']);
  assert.ok(document.paths['/user-types']);
  assert.ok(document.paths['/locations']);
  assert.ok(document.paths['/terminal-departments']);
  assert.ok(document.components.securitySchemes.bearerAuth);
});
test('admin endpoints reject missing or forged credentials', async () => {
  for (const route of ['/api/auth/me', '/api/votes', '/api/departments/all', '/api/locations/all', '/api/terminals/all', '/api/terminal-departments', '/api/feedback-options/all', '/api/dashboard', '/api/reports', '/api/reports/csv']) {
    assert.equal((await fetch(base + route)).status, 401);
    assert.equal((await fetch(base + route, { headers: { authorization: 'Bearer forged' } })).status, 401);
  }
  assert.equal((await fetch(base + '/api/departments', { method: 'POST' })).status, 401);
  assert.equal((await fetch(base + '/api/locations', { method: 'POST' })).status, 401);
  assert.equal((await fetch(base + '/api/terminals', { method: 'POST' })).status, 401);
  assert.equal((await fetch(base + '/api/terminal-departments', { method: 'POST' })).status, 401);
  assert.equal((await fetch(base + '/api/feedback-options', { method: 'POST' })).status, 401);
});
test('valid token loads current administrator and disabled users are rejected', async () => {
  const original = User.findById;
  const token = jwt.sign({}, process.env.JWT_SECRET, { subject: '1', issuer: 'smiley-api', audience: 'smiley-admin', expiresIn: '1h' });
  const headers = { authorization: 'Bearer ' + token };
  try {
    User.findById = async () => ({ id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin', active: 1 });
    assert.equal((await fetch(base + '/api/auth/me', { headers })).status, 200);
    User.findById = async () => ({ id: 1, role: 'admin', active: 0 });
    assert.equal((await fetch(base + '/api/auth/me', { headers })).status, 401);
  } finally { User.findById = original; }
});
test('valid authenticated non-admin users cannot access admin endpoints', async () => {
  const original = User.findById;
  const token = jwt.sign({}, process.env.JWT_SECRET, { subject: '2', issuer: 'smiley-api', audience: 'smiley-admin', expiresIn: '1h' });
  const headers = { authorization: 'Bearer ' + token };
  try {
    User.findById = async () => ({ id: 2, name: 'Viewer', email: 'viewer@example.com', role: 'viewer', active: 1 });
    assert.equal((await fetch(base + '/api/auth/me', { headers })).status, 200);
    assert.equal((await fetch(base + '/api/dashboard', { headers })).status, 403);
  } finally { User.findById = original; }
});
test('registration creates the first admin account with a hashed password', async () => {
  const originalCountAdmins = User.countAdmins;
  const originalFindByEmail = User.findByEmail;
  const originalCreate = User.create;
  const password = '!mcu9922@***2026';
  let created;
  try {
    User.countAdmins = async () => 0;
    User.findByEmail = async () => null;
    User.create = async ({ name, email, passwordHash }) => {
      created = { name, email, passwordHash };
      return { id: 3, name, email, role: 'admin' };
    };
    const response = await fetch(base + '/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'ITD Admin', email: 'itd-admin@mcu.edu.ph', password }),
    });
    assert.equal(response.status, 201);
    assert.equal(created.email, 'itd-admin@mcu.edu.ph');
    assert.notEqual(created.passwordHash, password);
    assert.equal(await bcrypt.compare(password, created.passwordHash), true);
  } finally {
    User.countAdmins = originalCountAdmins;
    User.findByEmail = originalFindByEmail;
    User.create = originalCreate;
  }
});
test('invalid votes and malformed JSON return 400 before database access', async () => {
  for (const body of ['{}', '{"ratingId":1,', '{"ratingId":1,"userTypeId":1,"terminalCode":"Tablet-01","feedback":123}', '{"ratingId":1,"feedback":"Helpful staff"}', '{"ratingId":1,"userTypeId":1,"feedback":"Helpful staff"}', '{"ratingId":1,"userTypeId":1,"terminalCode":"","feedback":"Helpful staff"}', '{"ratingId":1,"userTypeId":1,"terminalCode":"Tablet-01","feedback":""}', '{"ratingId":1,"userTypeId":1,"terminalCode":"Tablet-01","feedback":"   "}', '{"ratingId":1,"userTypeId":1,"terminalCode":"Tablet-01","departmentId":2,"feedback":"Helpful staff"}']) {
    const response = await fetch(base + '/api/votes', { method: 'POST', headers: { 'content-type': 'application/json' }, body });
    assert.equal(response.status, 400);
  }
});
test('validation bounds IDs, feedback, pagination and date ranges', () => {
  assert.equal(voteSchema.safeParse({ ratingId: -1, userTypeId: 1, terminalCode: 'Tablet-01', feedback: 'Helpful staff' }).success, false);
  assert.equal(voteSchema.safeParse({ ratingId: 1, feedback: 'Helpful staff' }).success, false);
  assert.equal(voteSchema.safeParse({ ratingId: 1, userTypeId: 1 }).success, false);
  assert.equal(voteSchema.safeParse({ ratingId: 1, userTypeId: 1, terminalCode: '', feedback: 'Helpful staff' }).success, false);
  assert.equal(voteSchema.safeParse({ ratingId: 1, userTypeId: 1, terminalCode: 'Tablet-01', feedback: 'Helpful staff' }).success, false);
  assert.equal(voteSchema.safeParse({ ratingId: 1, userTypeId: 1, terminalCode: 'Tablet-01', feedbackOptionId: 1, feedback: 'x'.repeat(2001) }).success, false);
  assert.equal(voteSchema.safeParse({ ratingId: 1, userTypeId: 1, terminalCode: 'Tablet-01', feedbackOptionId: 1 }).success, true);
  assert.equal(voteSchema.safeParse({ ratingId: 1, userTypeId: 1, terminalCode: 'Tablet-01', feedbackOptionId: 1, feedback: 'Helpful staff' }).success, true);
  assert.equal(voteSchema.safeParse({ ratingId: 1, userTypeId: 1, terminalCode: 'Tablet-01', feedbackOptionId: 1, departmentId: 1, feedback: 'Helpful staff' }).success, false);
  assert.equal(voteSchema.safeParse({ ratingId: 1, userTypeId: 1, terminalCode: 'Tablet-01', feedbackOptionId: 1, feedback: 'Helpful staff', admin: true }).success, false);
  assert.equal(filterSchema.safeParse({ from: '2026-02-30' }).success, false);
  assert.equal(filterSchema.safeParse({ from: '2026-09-02', to: '2026-09-01' }).success, false);
  assert.equal(filterSchema.safeParse({ q: 'PGT', ratingId: '1' }).success, true);
  assert.equal(filterSchema.safeParse({ q: 'x'.repeat(101) }).success, false);
  assert.equal(filterSchema.safeParse({ userTypeId: '1' }).success, true);
  assert.equal(filterSchema.safeParse({ limit: '101' }).success, false);
  assert.equal(filterSchema.parse({}).limit, 25);
});
test('department, location and terminal validation require IDs and names', () => {
  assert.equal(departmentSchema.safeParse({ name: 'Student Services', description: 'Student services office' }).success, true);
  assert.equal(departmentSchema.safeParse({ name: 'Student Services' }).success, false);
  assert.equal(departmentSchema.safeParse({ name: '' }).success, false);
  assert.equal(departmentSchema.safeParse({ name: 'Student Services', code: 'SAS' }).success, false);
  assert.equal(locationSchema.safeParse({ name: 'Student Center', description: 'Main kiosk area' }).success, true);
  assert.equal(locationSchema.safeParse({ name: 'Student Center' }).success, false);
  assert.equal(locationSchema.safeParse({ name: '' }).success, false);
  assert.equal(locationSchema.safeParse({ name: 'Student Center', extra: true }).success, false);
  assert.equal(terminalSchema.safeParse({ locationId: 1, terminalCode: 'KIOSK-1', name: 'Kiosk 1' }).success, true);
  assert.equal(terminalSchema.safeParse({ locationId: 1, terminalCode: '', name: 'Kiosk 1' }).success, false);
  assert.equal(terminalQuerySchema.safeParse({ locationId: '1' }).success, true);
});

test('duplicate department names return field validation errors', async () => {
  const originalFindDuplicateName = Department.findDuplicateName;
  const originalFindById = Department.findById;
  const originalCreate = Department.create;
  const originalUpdate = Department.update;
  const responses = [];
  const res = {
    status(code) {
      responses.push({ code });
      return this;
    },
    json(payload) {
      responses[responses.length - 1].payload = payload;
      return payload;
    },
  };

  try {
    Department.findDuplicateName = async () => ({ id: 1 });
    Department.findById = async () => ({ id: 2 });
    Department.create = async () => { throw new Error('create should not run'); };
    Department.update = async () => { throw new Error('update should not run'); };

    await createDepartment({ validated: { body: { name: 'SAS', description: 'Student Affairs Services' } } }, res);
    await updateDepartment({ validated: { params: { id: 2 }, body: { name: 'SAS', description: 'Student Affairs Services' } } }, res);

    assert.deepEqual(responses, [
      { code: 400, payload: { success: false, message: 'Validation failed', errors: [{ field: 'name', message: 'Department name already exists' }] } },
      { code: 400, payload: { success: false, message: 'Validation failed', errors: [{ field: 'name', message: 'Department name already exists' }] } },
    ]);
  } finally {
    Department.findDuplicateName = originalFindDuplicateName;
    Department.findById = originalFindById;
    Department.create = originalCreate;
    Department.update = originalUpdate;
  }
});

test('duplicate location names return field validation errors', async () => {
  const originalFindDuplicateName = Location.findDuplicateName;
  const originalFindById = Location.findById;
  const originalCreate = Location.create;
  const originalUpdate = Location.update;
  const responses = [];
  const res = {
    status(code) {
      responses.push({ code });
      return this;
    },
    json(payload) {
      responses[responses.length - 1].payload = payload;
      return payload;
    },
  };

  try {
    Location.findDuplicateName = async () => ({ id: 1 });
    Location.findById = async () => ({ id: 2 });
    Location.create = async () => { throw new Error('create should not run'); };
    Location.update = async () => { throw new Error('update should not run'); };

    await createLocation({ validated: { body: { name: 'LRC Ground Floor', description: 'Main kiosk area' } } }, res);
    await updateLocation({ validated: { params: { id: 2 }, body: { name: 'LRC Ground Floor', description: 'Main kiosk area' } } }, res);

    assert.deepEqual(responses, [
      { code: 400, payload: { success: false, message: 'Validation failed', errors: [{ field: 'name', message: 'Location name already exists' }] } },
      { code: 400, payload: { success: false, message: 'Validation failed', errors: [{ field: 'name', message: 'Location name already exists' }] } },
    ]);
  } finally {
    Location.findDuplicateName = originalFindDuplicateName;
    Location.findById = originalFindById;
    Location.create = originalCreate;
    Location.update = originalUpdate;
  }
});

test('duplicate terminal code and name return field validation errors', async () => {
  const originalFindDuplicateFields = Terminal.findDuplicateFields;
  const originalFindById = Terminal.findById;
  const originalCreate = Terminal.create;
  const originalUpdate = Terminal.update;
  const responses = [];
  const res = {
    status(code) {
      responses.push({ code });
      return this;
    },
    json(payload) {
      responses[responses.length - 1].payload = payload;
      return payload;
    },
  };

  try {
    Terminal.findDuplicateFields = async () => [
      { terminal_code: 'Tablet-01', name: 'Different name' },
      { terminal_code: 'Tablet-99', name: 'LRC Ground Floor Table - 01' },
    ];
    Terminal.findById = async () => ({ id: 2 });
    Terminal.create = async () => { throw new Error('create should not run'); };
    Terminal.update = async () => { throw new Error('update should not run'); };

    const body = { locationId: 1, terminalCode: 'Tablet-01', name: 'LRC Ground Floor Table - 01' };
    await createTerminal({ validated: { body } }, res);
    await updateTerminal({ validated: { params: { id: 2 }, body } }, res);

    assert.deepEqual(responses, [
      { code: 400, payload: { success: false, message: 'Validation failed', errors: [
        { field: 'terminalCode', message: 'Terminal code already exists' },
        { field: 'name', message: 'Terminal name already exists' },
      ] } },
      { code: 400, payload: { success: false, message: 'Validation failed', errors: [
        { field: 'terminalCode', message: 'Terminal code already exists' },
        { field: 'name', message: 'Terminal name already exists' },
      ] } },
    ]);
  } finally {
    Terminal.findDuplicateFields = originalFindDuplicateFields;
    Terminal.findById = originalFindById;
    Terminal.create = originalCreate;
    Terminal.update = originalUpdate;
  }
});

test('terminal department validation requires terminal and department IDs', () => {
  assert.equal(terminalAssignmentSchema.safeParse({ terminalId: 1, departmentId: 1 }).success, true);
  assert.equal(terminalAssignmentSchema.safeParse({ terminalId: 0, departmentId: 1 }).success, false);
  assert.equal(terminalAssignmentSchema.safeParse({ terminalId: 1, departmentId: 0 }).success, false);
  assert.equal(terminalAssignmentSchema.safeParse({ terminalId: 1 }).success, false);
  assert.equal(terminalAssignmentSchema.safeParse({ terminalId: 1, departmentId: 1, extra: true }).success, false);
  assert.equal(terminalAssignmentQuerySchema.safeParse({ terminalId: '1', departmentId: '2' }).success, true);
});
test('report filters parameterize input and include the entire end date', () => {
  const filter = voteFilter({ q: 'PGT', from: '2026-09-01', to: '2026-09-07', ratingId: 4, departmentId: 1, userTypeId: 2 });
  assert.deepEqual(filter.parameters, ['PGT', 'PGT', 'PGT', 'PGT', 'PGT', 'PGT', 'PGT', 'PGT', 'PGT', '2026-09-01', '2026-09-07', 4, 1, 1, 2]);
  assert.match(filter.where, /DATE_ADD\(\?, INTERVAL 1 DAY\)/);
  assert.ok(!filter.where.includes('2026'));
  assert.ok(!filter.where.includes('PGT'));
});
test('CSV quotes commas, quotes and newlines and neutralizes spreadsheet formulas', () => {
  assert.equal(csvCell('a,"b"'), '"a,""b"""');
  assert.equal(csvCell('=1+1'), '"' + "'=1+1" + '"');
  assert.equal(csvCell('  @SUM(A1)'), '"' + "'  @SUM(A1)" + '"');
  assert.ok(toCsv([{ id: 1, feedback: 'first\nsecond' }]).includes('"first\nsecond"'));
});
test('vote submission commits valid votes and rolls back unavailable choices', async () => {
  const original = pool.getConnection;
  const calls = [];
  let available = true;
  pool.getConnection = async () => ({
    beginTransaction: async () => calls.push('begin'),
    execute: async (sql, params) => {
      if (sql.includes('FROM ratings') || sql.includes('FROM user_types')) return [available ? [{ id: 1 }] : []];
      if (sql.includes('FROM feedback_options')) return [[{ id: 5, label: 'Timely assistance', requires_text: 0 }]];
      if (sql.includes('FROM terminals')) return [[{ id: 9, location_id: 3 }]];
      if (sql.includes('FROM terminal_departments')) return [[{ department_id: 4 }, { department_id: 7 }]];
      if (sql.startsWith('INSERT INTO votes')) return [{ insertId: 42 }];
      if (sql.startsWith('INSERT IGNORE INTO vote_departments')) {
        calls.push('vote_department:' + params[1]);
        return [{}];
      }
      return [{}];
    },
    commit: async () => calls.push('commit'),
    rollback: async () => calls.push('rollback'),
    release: () => calls.push('release'),
  });
  try {
    assert.deepEqual(await submitVote({ ratingId: 1, userTypeId: 1, terminalCode: 'Tablet-01', feedbackOptionId: 5, feedback: 'Helpful staff' }), { id: 42 });
    assert.deepEqual(calls, ['begin', 'vote_department:4', 'vote_department:7', 'commit', 'release']);
    calls.length = 0;
    available = false;
    await assert.rejects(submitVote({ ratingId: 1, userTypeId: 1, terminalCode: 'Tablet-01', feedbackOptionId: 5, feedback: 'Helpful staff' }), /Rating is unavailable/);
    assert.deepEqual(calls, ['begin', 'rollback', 'release']);
  } finally { pool.getConnection = original; }
});
