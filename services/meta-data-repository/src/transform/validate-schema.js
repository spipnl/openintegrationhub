const Ajv = require('ajv');
const { SchemaValidationError } = require('../error');

const ajv = new Ajv({
    schemaId: 'auto',
    allErrors: true,
    verbose: true,
});

ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));

module.exports = function validateSchema({ schema, filePath }) {
    schema = typeof schema === 'string' ? JSON.parse(schema) : schema;
    ajv.validateSchema(schema);
    if (ajv.errors) {
        throw new SchemaValidationError(`Validation failed for ${filePath || '/temp'} ${JSON.stringify(ajv.errors)}`);
    }
};
