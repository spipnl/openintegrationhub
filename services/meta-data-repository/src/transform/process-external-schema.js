const url = require('url');
const validateSchema = require('./validate-schema');

module.exports = async function processExternalSchema({
    location,
    domain,
    schema,
    jsonRefsOptions,
}) {
    validateSchema({
        schema,
    });

    console.log(location);
    jsonRefsOptions.root = url.resolve(location, './');
    console.log(url.resolve(location, '../'));
    jsonRefsOptions.location = location;
    console.log(jsonRefsOptions);

    // jsonRefsOptions.root =
    // console.log(await module.exports.transformSchema({
    //     domain,
    //     schema,
    //     jsonRefsOptions,
    // }));
    console.log('schema processed');
};
