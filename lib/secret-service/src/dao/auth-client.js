const Logger = require('@basaas/node-logger');
const AuthClient = require('../model/AuthClient');

const conf = require('./../conf');

const log = Logger.getLogger(`${conf.logging.namespace}/authClientDao`);
const auditLog = Logger.getAuditLogger(`${conf.logging.namespace}/authClientDao`);

module.exports = {

    async create(obj) {
        const client = new AuthClient[obj.type]({ ...obj });
        await client.save();
        return client.toObject();
    },

    async findWithPagination(query = {}, props) {
        return await AuthClient.full
            .find(query, 'name type', props)
            .lean();
    },

    async countByEntity() {
        return await AuthClient.full.countDocuments({});
    },

    async findById(id) {
        return await AuthClient.full.findById(id).lean();
    },

    async findOne(query) {
        return await AuthClient.full.findOne(query).lean();
    },

    async update({ id, data, partialUpdate = false }) {
        const updateOperation = partialUpdate ? { $set: data } : data;
        const result = await AuthClient.full.findOneAndUpdate({
            _id: id,
        }, updateOperation, {
            new: true,
        }).lean();

        log.debug('updated.client', { id });

        return result;
    },

    async delete({ id, ownerId }) {
        const toBeDeleted = await AuthClient.full.findOne({ _id: id });

        if (toBeDeleted.owners.length > 1) {
            toBeDeleted.owners = toBeDeleted.owners.filter(owner => owner.id !== ownerId);
            await toBeDeleted.save();
            log.info('owner.deleted.client', { id, ownerId });
        } else {
            await AuthClient.full.deleteOne({ _id: id });
            log.info('deleted.client', { id });
        }
    },

    async deleteAll({ ownerId, type }) {
        const toBeDeleted = await AuthClient.full.find({ owners: { id: ownerId, type } });
        for (const client of toBeDeleted) {
            if (client.owners.length > 1) {
                client.owners = client.owners.filter(owner => owner.id !== ownerId);
                await client.save();
                log.info('owner.deleted.client', { id: client._id, ownerId });
            } else {
                await AuthClient.full.deleteOne({ _id: client._id });
                log.info('deleted.client', { id: client._id });
            }
        }
    },

    // async delete({ id }) {
    //     await AuthClient.full.deleteOne({ _id: id });
    //     log.info('deleted.client', { id });
    // },

    // async deleteAll(query) {
    //     await AuthClient.full.deleteMany(query);
    //     auditLog.info('authClient.deleteAll', { data: { ...query } });
    // },
};