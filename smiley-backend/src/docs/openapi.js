export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Project Smiley Face API',
    version: '1.0.0',
    description: 'API documentation for the Smiley Face voting backend.',
  },
  servers: [
    { url: 'http://localhost:4100/api', description: 'Local backend' },
  ],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Ratings' },
    { name: 'User Types' },
    { name: 'Departments' },
    { name: 'Locations' },
    { name: 'Terminals' },
    { name: 'Terminal Departments' },
    { name: 'Votes' },
    { name: 'Dashboard' },
    { name: 'Reports' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ApiSuccess: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Success' },
          data: {},
        },
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Authentication required' },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Invalid email address' },
              },
            },
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'itd-admin@mcu.edu.ph' },
          password: { type: 'string', format: 'password', example: '!mcu9922@***2026' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'ITD Admin' },
          email: { type: 'string', format: 'email', example: 'itd-admin@mcu.edu.ph' },
          password: { type: 'string', format: 'password', minLength: 12, example: '!mcu9922@***2026' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'ITD Admin' },
          email: { type: 'string', format: 'email', example: 'itd-admin@mcu.edu.ph' },
          role: { type: 'string', example: 'admin' },
        },
      },
      LoginResponseData: {
        type: 'object',
        properties: {
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          tokenType: { type: 'string', example: 'Bearer' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      Rating: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          label: { type: 'string', example: 'Very Satisfied' },
          emoji: { type: 'string', example: ':smile:' },
          score: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
          status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
        },
      },
      UserType: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Student' },
          status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
          active: { type: 'boolean', example: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Department: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Student Services' },
          description: { type: 'string', example: 'Student assistance' },
          status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
          active: { type: 'boolean', example: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      DepartmentRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', maxLength: 100, example: 'Student Services' },
          description: { type: 'string', maxLength: 500, example: 'Student assistance' },
          active: { type: 'boolean', deprecated: true, example: true },
          status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
        },
      },
      Location: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Student Center' },
          description: { type: 'string', example: 'Main kiosk area' },
          status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
          active: { type: 'boolean', example: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      LocationRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', maxLength: 100, example: 'Student Center' },
          description: { type: 'string', maxLength: 500, example: 'Main kiosk area' },
          status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
        },
      },
      Terminal: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          location_id: { type: 'integer', example: 1 },
          location_name: { type: 'string', example: 'Main Lobby' },
          terminal_code: { type: 'string', example: 'KIOSK-1' },
          name: { type: 'string', example: 'Kiosk 1' },
          status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
          active: { type: 'boolean', example: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      TerminalRequest: {
        type: 'object',
        required: ['locationId', 'terminalCode', 'name'],
        properties: {
          locationId: { type: 'integer', minimum: 1, example: 1 },
          terminalCode: { type: 'string', maxLength: 50, example: 'KIOSK-1' },
          name: { type: 'string', maxLength: 100, example: 'Kiosk 1' },
          status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
        },
      },
      TerminalDepartment: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          terminal_id: { type: 'integer', example: 1 },
          terminal_code: { type: 'string', example: 'TABLET-001' },
          terminal_name: { type: 'string', example: 'Student Center Tablet' },
          terminal_status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
          department_id: { type: 'integer', example: 1 },
          department_name: { type: 'string', example: 'Student Affairs and Services' },
          department_status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      TerminalDepartmentRequest: {
        type: 'object',
        required: ['terminalId', 'departmentId'],
        properties: {
          terminalId: { type: 'integer', minimum: 1, example: 1 },
          departmentId: { type: 'integer', minimum: 1, example: 1 },
        },
      },
      VoteRequest: {
        type: 'object',
        description: 'The voter does not choose a department. The frontend sends the configured tablet terminal code, and the backend resolves the terminal, location, and assigned departments.',
        required: ['ratingId', 'userTypeId', 'terminalCode', 'feedback'],
        properties: {
          ratingId: { type: 'integer', minimum: 1, example: 1 },
          userTypeId: { type: 'integer', minimum: 1, example: 1 },
          terminalCode: { type: 'string', minLength: 1, maxLength: 50, description: 'Configured tablet code, for example the LRC tablet code.', example: 'Tablet-01' },
          feedback: { type: 'string', minLength: 1, maxLength: 2000, example: 'Friendly service!' },
        },
      },
      Vote: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 10 },
          feedback: { type: 'string', nullable: true, example: 'Friendly service!' },
          created_at: { type: 'string', format: 'date-time' },
          user_type_id: { type: 'integer', example: 1 },
          location_id: { type: 'integer', nullable: true, example: 1 },
          terminal_id: { type: 'integer', nullable: true, example: 1 },
          rating: { type: 'string', example: 'Very Satisfied' },
          rating_emoji: { type: 'string', example: '😄' },
          score: { type: 'integer', example: 5 },
          user_type: { type: 'string', example: 'Student' },
          department: { type: 'string', nullable: true, description: 'Department names assigned to the terminal. Multiple departments are comma-separated.', example: 'Career Planning, Student Affairs Services' },
          location: { type: 'string', nullable: true, example: 'Main Lobby' },
          terminal_code: { type: 'string', nullable: true, example: 'Tablet-03' },
          terminal: { type: 'string', nullable: true, description: 'Tablet name', example: 'PGT Building' },
        },
      },
      PaginatedVotes: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/Vote' },
          },
          total: { type: 'integer', example: 30 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 25 },
        },
      },
      Dashboard: {
        type: 'object',
        properties: {
          totalVotes: { type: 'integer', example: 100 },
          averageScore: { type: 'number', example: 4.32 },
          positiveVotes: { type: 'integer', example: 84 },
          satisfactionPercent: { type: 'number', example: 84 },
          ratings: { type: 'array', items: { type: 'object' } },
          departments: { type: 'array', items: { type: 'object' } },
          daily: { type: 'array', items: { type: 'object' } },
        },
      },
    },
    parameters: {
      IdParam: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer', minimum: 1 },
      },
      FromDate: {
        name: 'from',
        in: 'query',
        schema: { type: 'string', format: 'date' },
        example: '2026-09-01',
      },
      ToDate: {
        name: 'to',
        in: 'query',
        schema: { type: 'string', format: 'date' },
        example: '2026-09-07',
      },
      SearchQuery: {
        name: 'q',
        in: 'query',
        description: 'Search feedback, rating, user type, department, location, terminal code, or tablet name.',
        schema: { type: 'string', maxLength: 100 },
        example: 'PGT',
      },
      RatingId: {
        name: 'ratingId',
        in: 'query',
        schema: { type: 'integer', minimum: 1 },
      },
      DepartmentId: {
        name: 'departmentId',
        in: 'query',
        schema: { type: 'integer', minimum: 1 },
      },
      UserTypeId: {
        name: 'userTypeId',
        in: 'query',
        schema: { type: 'integer', minimum: 1 },
      },
      LocationId: {
        name: 'locationId',
        in: 'query',
        schema: { type: 'integer', minimum: 1 },
      },
      TerminalId: {
        name: 'terminalId',
        in: 'query',
        schema: { type: 'integer', minimum: 1 },
      },
      Page: {
        name: 'page',
        in: 'query',
        schema: { type: 'integer', minimum: 1, maximum: 100000, default: 1 },
      },
      Limit: {
        name: 'limit',
        in: 'query',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Missing, invalid, or expired JWT',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
      },
      Forbidden: {
        description: 'The account is authenticated but not allowed to access this endpoint',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
      },
      ValidationFailed: {
        description: 'Request validation failed',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } },
      },
      Conflict: {
        description: 'A record with this value already exists',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Process health',
        responses: {
          200: { description: 'API process is running' },
        },
      },
    },
    '/ready': {
      get: {
        tags: ['Health'],
        summary: 'Database readiness',
        responses: {
          200: { description: 'Database is reachable' },
          503: { description: 'Database is unavailable' },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register an admin API account',
        description: 'Creates the first admin account. Additional API registration requires ALLOW_ADMIN_REGISTRATION=true.',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } },
          },
        },
        responses: {
          201: {
            description: 'Account registered',
            content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiSuccess' }] } } },
          },
          400: { $ref: '#/components/responses/ValidationFailed' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive a JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/LoginResponseData' } } },
                  ],
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationFailed' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get the current API account',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Current account',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/User' } } },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/ratings': {
      get: {
        tags: ['Ratings'],
        summary: 'List active smiley ratings',
        responses: {
          200: {
            description: 'Active ratings',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Rating' } } } },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/user-types': {
      get: {
        tags: ['User Types'],
        summary: 'List active voter user types',
        responses: {
          200: {
            description: 'Active user types',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/UserType' } } } },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/departments': {
      get: {
        tags: ['Departments'],
        summary: 'List active departments',
        responses: {
          200: {
            description: 'Active departments',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Department' } } } },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Departments'],
        summary: 'Create a department',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/DepartmentRequest' } } },
        },
        responses: {
          201: { description: 'Department created' },
          400: { $ref: '#/components/responses/ValidationFailed' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/departments/all': {
      get: {
        tags: ['Departments'],
        summary: 'List all departments including inactive',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'All departments' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/departments/{id}': {
      put: {
        tags: ['Departments'],
        summary: 'Update a department',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/DepartmentRequest' } } },
        },
        responses: {
          200: { description: 'Department updated' },
          400: { $ref: '#/components/responses/ValidationFailed' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { description: 'Department not found' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
      delete: {
        tags: ['Departments'],
        summary: 'Deactivate a department',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          200: { description: 'Department deactivated' },
          400: { $ref: '#/components/responses/ValidationFailed' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { description: 'Department not found' },
        },
      },
    },
    '/locations': {
      get: {
        tags: ['Locations'],
        summary: 'List active locations',
        responses: {
          200: {
            description: 'Active locations',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Location' } } } },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Locations'],
        summary: 'Create a location',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LocationRequest' } } },
        },
        responses: {
          201: { description: 'Location created' },
          400: { $ref: '#/components/responses/ValidationFailed' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/locations/all': {
      get: {
        tags: ['Locations'],
        summary: 'List all locations including inactive',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'All locations' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/locations/{id}': {
      put: {
        tags: ['Locations'],
        summary: 'Update a location',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LocationRequest' } } },
        },
        responses: {
          200: { description: 'Location updated' },
          400: { $ref: '#/components/responses/ValidationFailed' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { description: 'Location not found' },
        },
      },
      delete: {
        tags: ['Locations'],
        summary: 'Deactivate a location',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          200: { description: 'Location deactivated' },
          400: { $ref: '#/components/responses/ValidationFailed' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { description: 'Location not found' },
        },
      },
    },
    '/terminals': {
      get: {
        tags: ['Terminals'],
        summary: 'List active terminals',
        parameters: [{ $ref: '#/components/parameters/LocationId' }],
        responses: {
          200: {
            description: 'Active terminals',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Terminal' } } } },
                  ],
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationFailed' },
        },
      },
      post: {
        tags: ['Terminals'],
        summary: 'Create a terminal',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TerminalRequest' } } },
        },
        responses: {
          201: { description: 'Terminal created' },
          400: { $ref: '#/components/responses/ValidationFailed' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/terminals/all': {
      get: {
        tags: ['Terminals'],
        summary: 'List all terminals including inactive',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/LocationId' }],
        responses: {
          200: { description: 'All terminals' },
          400: { $ref: '#/components/responses/ValidationFailed' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/terminals/{id}': {
      put: {
        tags: ['Terminals'],
        summary: 'Update a terminal',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TerminalRequest' } } },
        },
        responses: {
          200: { description: 'Terminal updated' },
          400: { $ref: '#/components/responses/ValidationFailed' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { description: 'Terminal not found' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
      delete: {
        tags: ['Terminals'],
        summary: 'Deactivate a terminal',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          200: { description: 'Terminal deactivated' },
          400: { $ref: '#/components/responses/ValidationFailed' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { description: 'Terminal not found' },
        },
      },
    },
    '/terminal-departments': {
      get: {
        tags: ['Terminal Departments'],
        summary: 'List terminal department assignments',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/TerminalId' },
          { $ref: '#/components/parameters/DepartmentId' },
        ],
        responses: {
          200: {
            description: 'Terminal department assignments',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/TerminalDepartment' } } } },
                  ],
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationFailed' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      post: {
        tags: ['Terminal Departments'],
        summary: 'Assign a terminal to a department',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TerminalDepartmentRequest' } } },
        },
        responses: {
          201: { description: 'Terminal department created' },
          400: { $ref: '#/components/responses/ValidationFailed' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/terminal-departments/{id}': {
      put: {
        tags: ['Terminal Departments'],
        summary: 'Update a terminal department assignment',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TerminalDepartmentRequest' } } },
        },
        responses: {
          200: { description: 'Terminal department updated' },
          400: { $ref: '#/components/responses/ValidationFailed' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { description: 'Terminal department not found' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
      delete: {
        tags: ['Terminal Departments'],
        summary: 'Delete a terminal department assignment',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          200: { description: 'Terminal department deleted' },
          400: { $ref: '#/components/responses/ValidationFailed' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { description: 'Terminal department not found' },
        },
      },
    },
    '/votes': {
      post: {
        tags: ['Votes'],
        summary: 'Submit a public vote',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/VoteRequest' } } },
        },
        responses: {
          201: { description: 'Vote submitted' },
          400: { $ref: '#/components/responses/ValidationFailed' },
        },
      },
      get: {
        tags: ['Votes'],
        summary: 'List votes',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/SearchQuery' },
          { $ref: '#/components/parameters/FromDate' },
          { $ref: '#/components/parameters/ToDate' },
          { $ref: '#/components/parameters/RatingId' },
          { $ref: '#/components/parameters/DepartmentId' },
          { $ref: '#/components/parameters/UserTypeId' },
          { $ref: '#/components/parameters/LocationId' },
          { $ref: '#/components/parameters/TerminalId' },
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
        ],
        responses: {
          200: {
            description: 'Paginated votes',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/PaginatedVotes' } } },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/dashboard': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get dashboard aggregates',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/SearchQuery' },
          { $ref: '#/components/parameters/FromDate' },
          { $ref: '#/components/parameters/ToDate' },
          { $ref: '#/components/parameters/RatingId' },
          { $ref: '#/components/parameters/DepartmentId' },
          { $ref: '#/components/parameters/UserTypeId' },
          { $ref: '#/components/parameters/LocationId' },
          { $ref: '#/components/parameters/TerminalId' },
        ],
        responses: {
          200: {
            description: 'Dashboard data',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/Dashboard' } } },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/reports': {
      get: {
        tags: ['Reports'],
        summary: 'Get paginated report data',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/SearchQuery' },
          { $ref: '#/components/parameters/FromDate' },
          { $ref: '#/components/parameters/ToDate' },
          { $ref: '#/components/parameters/RatingId' },
          { $ref: '#/components/parameters/DepartmentId' },
          { $ref: '#/components/parameters/UserTypeId' },
          { $ref: '#/components/parameters/LocationId' },
          { $ref: '#/components/parameters/TerminalId' },
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
        ],
        responses: {
          200: { description: 'Paginated report data' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/reports/csv': {
      get: {
        tags: ['Reports'],
        summary: 'Export report data as CSV',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/SearchQuery' },
          { $ref: '#/components/parameters/FromDate' },
          { $ref: '#/components/parameters/ToDate' },
          { $ref: '#/components/parameters/RatingId' },
          { $ref: '#/components/parameters/DepartmentId' },
          { $ref: '#/components/parameters/UserTypeId' },
          { $ref: '#/components/parameters/LocationId' },
          { $ref: '#/components/parameters/TerminalId' },
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
        ],
        responses: {
          200: {
            description: 'CSV file',
            content: {
              'text/csv': {
                schema: { type: 'string', format: 'binary' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/reports/teams-digest/send': {
      post: {
        tags: ['Reports'],
        summary: 'Manually trigger the daily sad-votes Microsoft Teams digest',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Digest sent (or skipped if no webhook is configured)' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/public/teams-digest/report.xlsx': {
      get: {
        tags: ['Reports'],
        summary: 'Download the sad-votes Excel report for a given day (no login; signed token from the Teams digest card)',
        parameters: [
          { name: 'token', in: 'query', required: true, schema: { type: 'string' }, description: 'Signed, short-lived token embedded in the Teams digest download link' },
        ],
        responses: {
          200: {
            description: 'Excel file',
            content: {
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
                schema: { type: 'string', format: 'binary' },
              },
            },
          },
          401: { description: 'Invalid or expired download link' },
        },
      },
    },
  },
};
