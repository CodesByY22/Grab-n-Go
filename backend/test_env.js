const dotenv = require('dotenv');
const result = dotenv.config();
console.log('--- Dotenv Debug ---');
console.log('Result error:', result.error);
console.log('Parsed values:', result.parsed);
console.log('MONGO_URI from process.env:', process.env.MONGO_URI);
console.log('Current directory:', process.cwd());
