![prod](https://img.shields.io/badge/Status-Production-brightgreen.svg)

<p align="center">
  <img src="https://github.com/openintegrationhub/openintegrationhub/blob/master/Assets/medium-oih-einzeilig-zentriert.jpg" alt="Sublime's custom image" width="400"/>
</p>

The revolution in data synchronization — the Open Integration Hub enables simple data synchronization between any software applications and thus accelerates digitalisation

Visit the official [Open Integration Hub homepage](https://www.openintegrationhub.de/)

# Secrets-Service (working title / codename: *Lynx*)

[Documentation on Swagger Hub](https://app.swaggerhub.com/apis/basaas/secret-service/0.1.0)

## Basic usage & development

Install packages

```zsh 
yarn
```

Start local lynx

```zsh 
yarn start
```

Watch server and restart after code changes

```zsh 
yarn watch
```

Test lynx components

```zsh 
yarn test
```

## Run in local Docker container

Create env-file under "./.env.local"

```console
PORT=3000
MONGODB_CONNECTION=mongodb://host.docker.internal:27017/secrets-service
INTROSPECT_ENDPOINT_BASIC=http://iam.openintegrationhub.com/api/v1/tokens/introspect
IAM_TOKEN=YOUR_IAM_TOKEN
API_BASE=/api/v1
TTL_AUTHFLOW=2m
LOGGING_LEVEL=error
TTL_AUTHFLOW=2m
DEBUG_MODE=false
ALLOW_SELF_SIGNED=true
```

If you are using the IAM OpenId Connect feature, you can also use the following env vars for token introspection

```console
INTROSPECT_TYPE=oidc
INTROSPECT_ENDPOINT_OIDC=https://host.docker.internal:3002/op/token/introspection
OIDC_CLIENT_ID=your_client_id
OIDC_CLIENT_SECRET=your_client_secret
```

Create docker image

```console
docker build .
```

Run container

```console
docker run --env-file=".env.local" -it {containerId}
```

## General

This service is used to store and access securely client secrets/credentials (Basic Auth, OAuth tokens, etc.).
Each secret has a list of owners who can access the secret. This service can also create OAuth flows, such as 3-legged and also automatically refresh OAuth accessTokens if a valid refreshToken exists.

### Concept and docs

Current documentation of the concept can be found here: <https://github.com/openintegrationhub/openintegrationhub/blob/master/docs/services/SecretService.md>
As the implementation has changed in the last iterations, the concept isn't up-to-date anymore and will be adjusted to reflect the new implementation.

### Auth clients

An auth client is required for secrets, which require a communication with an external identity provider, e.g. in case of OAuth2 tokens.
After registering your application with the 3rd party (e.g. Google), create an auth client and add your `clientId` and `clientSecret`.
You must also register the callback URL `redirectUri` of Secrets-Service with the third party.
In case of OAuth, you should also define the `auth` and `token` in `endpoints`. See the OpenAPI spec for AuthClient model definition.

### Secrets

Secrets can be simple basic authentication secrets with `username` and `password` but also OAuth2 tokens.
Users can create and modify secrets. The sensitive value of a secret (e.g. password or token) will be masked by the service when accessing the secret via API.


### Starting an OAuth2 (3-legged) flow

* The auth client creates a full qualified URL for the identity provider and returns it via API.
* User/Client can open this URL in browser and is redirected to the 3rd party
* User consents and is redirected back to the callback URL of Secrets-Service
* Secrets-Service uses the auth code from the callback fetches automatically the tokens
* Tokens (refreshToken, accessToken and expires) are stored in a secret

### Specifics

* User authentication and authorization is done currently by introspecting the IAM token. The introspect returns user id, tenant membership and permissions.
* Sensitive data in a secret (password, accessToken, refreshToken) are masked with stars `***` and aren't displayed plain in the response. To see the raw data, the requester must have the `secrets.raw.read` permission (see IAM).
* When fetching an OAuth2 based secret, this service checks if the accessToken has expired or will expire in the next 10min (configurable). If so, the service will automatically refresh the access token, store it in the secret object and return this updated secret.
* If a secret containing an OAuth2 token is being refreshed, the `lockedAt` flag is set with the current timestamp. When secret is updated, the `lockedAt` property is set to `null`. Parallel requests to this secret will undergo a back-off strategy, until a predefined threshold is reached (see `refreshTimeout` in the config, default: 10s). If the secret has not been refreshed in the mean time, a new attempt will be started. The number of retries is limited by `TBD`.
* A secret can have more than one owner. There are two types of delete: one removes the owner from the secret owners array if there are more than one. The more privileged delete requires a special permission (see: `secretDeleteAny`). 

### Encryption

* All `sensitive fields` (listed in src/constant) of every secret will be encrypted before they get stored into database. By default `aes-256-cbc` is used to provide fast and secure encryption. Therefore, you need to specify a `key adapter` to supply users with the keys and setup encryption. Users receive decrypted secrets only if lynx is able to find the valid key.

#### Default Settings

* CRYPTO_DISABLED: __false__ - Turns on encryption.
* CRYPTO_ALG_HASH: __sha256__ - Hashing of externalId to obfuscate private data.
* CRYPTO_ALG_ENCRYPTION: __aes-256-cbc__ - Default algorithm used for encryption.
* CRYPTO_OUTPUT_ENCODING: __latin1__ - Charset of encryption output.

## Usage & Customization

### I want to use my own implementation of IAM

When instantiating the server, provide your custom implementation:

```javascript
const server = new Server({
    iam: require('my-iam-lib'),
});
```

Make sure that your IAM implementation exposes methods exported by `secret-service/src/modules/iam.js`.

### I want to use my own implementation of secret encryption

```javascript
const server = new Server({
    adapter: {
        key: require('./your-implementation'),
    },
});
```

### I want to use my own implementation to fetch user's external id

```javascript
const server = new Server({
    adapter: {
        preprocessor: {
            slack: require('./adapter/preprocessor/slack'),
            google: require('./adapter/preprocessor/google'),
            microsoft: require('./adapter/preprocessor/microsoft'),
        },
    },
});
```
