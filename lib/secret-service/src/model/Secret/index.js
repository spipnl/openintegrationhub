const mongoose = require('mongoose');
const AuthClient = require('../AuthClient');
const owner = require('../schema/owner');
const { AUTH_TYPE } = require('../../constant');

const {
    SIMPLE,
    MIXED,
    API_KEY,
    OA1_TWO_LEGGED,
    OA2_AUTHORIZATION_CODE,
} = AUTH_TYPE;

const { Schema } = mongoose;

const secretBaseSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    owners: {
        type: [owner],
        required: true,
    },
    tenant: String,
    type: {
        type: String,
        enum: Object.keys(AUTH_TYPE),
        required: true,
    },
    domain: {
        type: String,
    },
    lockedAt: Date,
    encryptedFields: {
        type: [String],
        default: [],
    },
    mixedProperties: {
        type: Object,
    },
    value: {},
}, {
    timestamps: true,
});

const Secret = mongoose.model('secret', secretBaseSchema);

module.exports = {
    full: Secret,
    [SIMPLE]:
        Secret.discriminator(`S_${SIMPLE}`, new Schema({
            value: {
                username: {
                    type: String,
                    required: true,
                },
                passphrase: {
                    type: String,
                    required: true,
                },
            },
        })),
    [MIXED]:
        Secret.discriminator(`S_${MIXED}`, new Schema({
            value: {
                type: Schema.Types.Mixed,
            },
            subType: String, // e.g. IMAP
        })),
    [API_KEY]:
        Secret.discriminator(`S_${API_KEY}`, new Schema({
            value: {
                key: {
                    type: String,
                    required: true,
                },
                headerName: String,
            },
        })),
    [OA1_TWO_LEGGED]:
        Secret.discriminator(`S_${OA1_TWO_LEGGED}`, new Schema({
            value: {
                expiresAt: String,
            },
        })),
    [OA2_AUTHORIZATION_CODE]: Secret.discriminator(`S_${OA2_AUTHORIZATION_CODE}`, new Schema({
        value: {
            authClientId: {
                type: Schema.Types.ObjectId,
                required: true,
                validate: {
                    isAsync: true,
                    validator(v, cb) {
                        AuthClient.full.findOne({ _id: v }, (err, doc) => {
                            if (err || !doc) {
                                cb(false);
                            } else {
                                cb(true);
                            }
                        });
                    },
                    // Default error message, overridden by 2nd argument to `cb()` above
                    message: 'Auth client is not existing',
                },
            },
            refreshToken: {
                type: String,
            },
            accessToken: {
                type: String,
                required: true,
            },
            scope: String,
            expires: String,
            externalId: String,
        },
    })),

};
