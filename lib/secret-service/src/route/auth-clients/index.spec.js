const getPort = require('get-port');
const supertest = require('supertest');
const qs = require('qs');
const iamMock = require('../../test/iamMock');
const conf = require('../../conf');
const { ENTITY_TYPE } = require('../../constant');
const Server = require('../../server');
const token = require('../../test/tokens');
const {
    OA1_TWO_LEGGED, OA2_AUTHORIZATION_CODE,
} = require('../../constant').AUTH_TYPE;

let port;
let request;
let server;

const dummyIam = {
    middleware: (req, res, next) => {
        req.user = {
            sub: 'foo'
        };
        next();
    },

    can: requiredPermissions => (req, res, next) => {
        next();
    },
};

describe('auth-clients', () => {
    beforeAll(async (done) => {
        port = await getPort();
        request = supertest(`http://localhost:${port}${conf.apiBase}`);
        server = new Server({
            mongoDbConnection: `${global.__MONGO_URI__}-auth-client`,
            port,
            // iam: dummyIam,
        });
        iamMock.setup();
        await server.start();
        done();
    });

    afterAll(async (done) => {
        await server.stop();
        done();
    });

    test('Create clients', async () => {
        await request.post('/auth-clients')
            .set(...global.userAuth1)
            .send({
                data: {
                    name: 'string',
                    type: OA1_TWO_LEGGED,
                    consumerKey: 'string',
                    consumerSecret: 'string',
                    nonce: 'string',
                    signature: 'string',
                    signatureMethod: 'string',
                    version: 'string',
                },
            })
            .expect(200);

        const resp = await request.post('/auth-clients')
            .set(...global.userAuth1)
            .send({
                data: {
                    type: OA2_AUTHORIZATION_CODE,
                    name: 'oAuth2',
                    clientId: 'string',
                    clientSecret: 'string',
                    redirectUri: '/dev/null',
                    endpoints: {
                        auth: 'http://',
                        token: 'http://',
                        userinfo: 'http://',
                    },
                    mappings: {
                        externalId: {
                            source: 'id_token',
                            key: 'sub',
                        },
                    },
                },
            })
            .expect(200);

        expect(resp.body.data.owners.length).toEqual(1);
        expect(resp.body.data.tenant).toBeDefined();

        await request.post('/auth-clients')
            .set(...global.userAuth1)
            .send({
                data: {
                    name: 'oAuth2',
                    clientId: 'string',
                    clientSecret: 'string',
                    refreshTokenUrl: 'string',
                    type: 'foo',
                },
            })
            .expect(400);
    });

    test('Retrieve all clients created by the current user.', async () => {
        const { body } = await request.get('/auth-clients')
            .set(...global.userAuth1)
            .expect(200);

        expect(body.data.length).toBe(2);
    });

    test('Get auth client by id', async () => {
        const data = {
            type: OA2_AUTHORIZATION_CODE,
            name: 'oAuth2',
            clientId: 'string',
            clientSecret: 'string',
            redirectUri: '/dev/null',
            endpoints: {
                auth: 'http://',
                token: 'http://',
                userinfo: 'http://',
            },
            mappings: {
                externalId: {
                    source: 'id_token',
                    key: 'sub',
                },
            },
        };
        const authClient = (await request.post('/auth-clients')
            .set(...global.userAuth1)
            .send({ data })
            .expect(200)).body.data;

        const authClientById = (await request.get(`/auth-clients/${authClient._id}`)
            .set(...global.userAuth1)
            .expect(200)).body.data;

        expect(data.name).toEqual(authClientById.name);
    });

    test('Modify a platform oauth client', async () => {
        const data = {
            type: OA2_AUTHORIZATION_CODE,
            name: 'oAuth2',
            clientId: 'string',
            clientSecret: 'string',
            redirectUri: '/dev/null',
            endpoints: {
                auth: 'http://',
                token: 'http://',
                userinfo: 'http://',
            },
            mappings: {
                externalId: {
                    source: 'id_token',
                    key: 'sub',
                },
            },
        };

        let authClient = (await request.post('/auth-clients')
            .set(...global.userAuth1)
            .send({ data })
            .expect(200)).body.data;

        expect(authClient.name).toEqual('oAuth2');

        authClient = (await request.patch(`/auth-clients/${authClient._id}`)
            .set(...global.userAuth1)
            .send({
                data: {
                    ...data,
                    name: 'test',
                },
            })
            .expect(200)).body.data;

        expect(authClient.name).toEqual('test');
        expect(authClient.owners.length).toEqual(1);
        expect(authClient.tenant).toBeDefined();
    });

    test('Remove a platform oauth secret', async () => {
        const { _id } = (await request.post('/auth-clients')
            .set(...global.userAuth1)
            .send({
                data: {
                    type: OA2_AUTHORIZATION_CODE,
                    name: 'oAuth2',
                    clientId: 'string',
                    clientSecret: 'string',
                    redirectUri: '/dev/null',
                    endpoints: {
                        auth: 'http://',
                        token: 'http://',
                        userinfo: 'http://',
                    },
                    mappings: {
                        externalId: {
                            source: 'id_token',
                            key: 'sub',
                        },
                    },
                },
            })
            .expect(200)).body.data;

        await request.delete(`/auth-clients/${_id}`)
            .set(...global.userAuth1)
            .expect(204);
    });

    test('Start oauth2 authorization code flow', async () => {
        const scope = 'scope1 scope2';
        // create auth client first
        const { _id } = (await request.post('/auth-clients')
            .set(...global.userAuth1)
            .send({
                data: {
                    type: OA2_AUTHORIZATION_CODE,
                    name: 'google oAuth2',
                    clientId: 'clientId',
                    clientSecret: 'clientSecret',
                    redirectUri: `http://localhost:${conf.port}/callback`,
                    endpoints: {
                        auth: 'https://accounts.google.com/o/oauth2/v2/auth?'
                                + 'scope={{scope}}&'
                                + 'access_type=offline&'
                                + 'include_granted_scopes=true&'
                                + 'state={{state}}&'
                                + 'redirect_uri={{redirectUri}}&'
                                + 'response_type=code&'
                                + 'client_id={{clientId}}',
                        token: 'https://www.googleapis.com/oauth2/v4/token',
                        userinfo: 'https://www.googleapis.com/oauth2/v4/token',
                    },
                    mappings: {
                        externalId: {
                            source: 'id_token',
                            key: 'sub',
                        },
                    },
                },
            })
            .expect(200)).body.data;

        const { body } = await request.post(`/auth-clients/${_id}/start-flow`)
            .set(...global.userAuth1)
            .send({
                data: {
                    scope,
                },
            })
            .expect(200);

        expect(body.data.authUrl).not.toMatch('undefined');
    });


    test('Delete auth clients with service account', async () => {
        let meta = (await request.get('/auth-clients')
            .set(...global.userAuth1)
            .expect(200)).body.meta;

        expect(meta.total).toBeGreaterThan(0);
        // regular user is not allowed
        await request.delete(`/auth-clients?${qs.stringify({
            creator: token.userToken1.value.sub,
            creatorType: token.userToken1.value.role,
        })}`)
            .set(...global.userAuth1)
            .expect(403);

        // service account has permissions
        await request.delete(`/auth-clients?${qs.stringify({
            ownerId: token.userToken1.value.sub,
            type: token.userToken1.value.role,
        })}`)
            .set(...global.serviceAccount)
            .expect(200);
        // service account has permissions
        await request.delete(`/auth-clients?${qs.stringify({
            ownerId: token.userToken1.value.tenant,
            type: ENTITY_TYPE.TENANT,
        })}`)
            .set(...global.serviceAccount)
            .expect(200);

        meta = (await request.get('/auth-clients')
            .set(...global.userAuth1)
            .expect(200)).body.meta;

        expect(meta.total).toBe(0);
    });
});
