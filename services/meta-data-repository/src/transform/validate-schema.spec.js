const path = require('path');
const fs = require('fs-extra');
const readdirp = require('readdirp');
const { SchemaValidationError } = require('../error');

const validateSchema = require('./validate-schema');

describe('Validation', () => {
    test('validateSchema - valid', async () => {
        const files = await readdirp.promise(path.resolve(__dirname, '../../test/data/valid'), { fileFilter: '*.json' });

        for (const file of files) {
            validateSchema({
                schema: await fs.readFile(file.fullPath, 'utf-8'),
                filePath: file.fullPath,
            });
        }
        expect(true).toEqual(true);
    });

    test('validateSchema - invalid', async () => {
        const filePath = path.resolve(__dirname, '../../test/data/invalid/addresses/V1/person.json');
        const file = await fs.readFile(filePath, 'utf-8');
        expect(() => validateSchema({ schema: file, filePath })).toThrow(SchemaValidationError);
    });

    test('validateSchema - virtual', async () => {
        validateSchema({
            schema: {
                $schema: 'http://json-schema.org/schema#',
                $id: 'https://github.com/organizationV2.json',
                title: 'Organization',
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'Name of the organization',
                        example: 'Great Company',
                    },
                    logo: {
                        type: 'string',
                        description: 'Logo of the organization',
                        example: 'http://example.org/logo.png',
                        foo: {
                            $rel: '#/properties/name',
                        },
                    },
                },

            },
        });

        expect(true).toEqual(true);
    });
});
