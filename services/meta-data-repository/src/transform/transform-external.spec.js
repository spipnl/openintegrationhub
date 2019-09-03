const getPort = require('get-port');
const supertest = require('supertest');
const mongoose = require('mongoose');
const conf = require('../conf');
const iamMock = require('../../test/iamMock');
const Server = require('../server');
const { transformExternalSchema } = require('./');

let port;
let request;
let server;

function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('process external schema', () => {
    beforeAll(async () => {
        port = await getPort();
        conf.port = port;

        request = supertest(`http://localhost:${port}${conf.apiBase}`);
        server = new Server({
            mongoDbConnection: global.__MONGO_URI__.replace('changeme', 'process-external-schema'),
            port,
        });
        iamMock.setup();


        await server.start();

        // wait until mongodb fully initialized
        await timeout(2000);
    });

    afterAll(async () => {
        await server.stop();
    });

    test('complex schema', async () => {
        // start session
        const session = await mongoose.startSession();
        const token = global.user1[1].replace('bearer ', '');

        const externalRef = 'https://raw.githubusercontent.com/openintegrationhub/Data-and-Domain-Models/master/src/main/schema/addresses/personV2.json';
        session.startTransaction();

        const domain = {
            name: 'test',
            description: 'bar',
            public: true,
        };
        // create a domain
        const result = (await request.post('/domains')
            .set(...global.user1)
            .send(domain)
            .expect(200)).body;

        const parentSchema = {
            $schema: 'http://json-schema.org/schema#',
            $id: 'https://github.com/organizationV5.json',
            title: 'Organization2',
            type: 'object',
            properties: {
                someRef: {
                    $ref: externalRef,
                },
                name: {
                    type: 'string',
                    description: 'Name of the organization',
                    example: 'Great Company',
                },
                logo: {
                    type: 'string',
                    description: 'Logo of the organization',
                    example: 'http://example.org/logo.png',
                },
            },
        };

        const externalSchema = {
            $schema: 'http://json-schema.org/schema#',
            $id: 'https://raw.githubusercontent.com/openintegrationhub/Data-and-Domain-Models/master/src/main/schema/addresses/personV2.json',
            title: 'Person',
            description: 'Describes a natural person',
            type: 'object',
            allOf: [
                {
                    $ref: '../oih-data-record.json',
                },
            ],
            properties: {
                title: {
                    type: 'string',
                    description: 'Title of the person',
                    examples: [
                        'Dr.',
                    ],
                },
                salutation: {
                    type: 'string',
                    description: 'Salutation of the person',
                    examples: [
                        'Mr.',
                    ],
                },
                firstName: {
                    type: 'string',
                    description: 'Given name of the person',
                    examples: [
                        'Max',
                    ],
                },
                middleName: {
                    type: 'string',
                    description: 'Middle name of the person',
                    examples: [
                        'Schneider',
                    ],
                },
                lastName: {
                    type: 'string',
                    description: 'Surname of the person',
                    examples: [
                        'Schneider',
                    ],
                },
                gender: {
                    type: 'string',
                    enum: [
                        'male',
                        'female',
                        'intersexual',
                        '',
                    ],
                    description: 'Gender of the person',
                },
                birthday: {
                    type: 'string',
                    description: 'Birthday of the person',
                },
                notes: {
                    type: 'string',
                    description: 'Individual notes for the person',
                },
                displayName: {
                    type: 'string',
                    description: 'Displayed name for the person within the application',
                    examples: [
                        'mscheinder',
                        'heNiha',
                    ],
                },
                language: {
                    type: 'string',
                    description: 'First language of the person',
                },
                nickname: {
                    type: 'string',
                    description: 'Nickname of the person',
                    examples: [
                        'maxschn',
                        'silSchaef',
                    ],
                },
                jobTitle: {
                    type: 'string',
                    description: 'Job title of the person',
                    examples: [
                        'Sales manager',
                        'Software architect',
                    ],
                },
                photo: {
                    type: 'string',
                    description: 'Photo related to the person',
                    examples: [
                        'http://example.org/photo.jpg',
                    ],
                },
                anniversary: {
                    type: 'string',
                    description: 'Anniversary of the person',
                },
                addresses: {
                    type: 'array',
                    description: 'Addess data of of the person',
                    items: {
                        $ref: 'sharedDefinitionsV2.json#/definitions/Address',
                    },
                },
                contactData: {
                    type: 'array',
                    items: {
                        $ref: 'sharedDefinitionsV2.json#/definitions/contactData',
                    },
                },
                calendars: {
                    type: 'array',
                    items: {
                        $ref: 'sharedDefinitionsV2.json#/definitions/calendar',
                    },
                },
                categories: {
                    type: 'array',
                    items: {
                        $ref: 'sharedDefinitionsV2.json#/definitions/category',
                    },
                },
            },
        };

        await transformExternalSchema({
            location: externalRef,
            domain,
            parentSchema,
            externalSchema,
            session,
            token,
        });

        await session.commitTransaction();
        expect(true).toBe(true);
    });
});
