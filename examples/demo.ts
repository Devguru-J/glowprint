import { log, error, success, info, warn } from '../src/index.ts'

info('Fetching users…')
log({ user: 'kim', age: 30, active: true, tags: ['dev', 'ai'], meta: null })
warn('cache miss')
success('Deployed to production')
error(new Error('Boom: connection refused'))
