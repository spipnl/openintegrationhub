const fs = require('fs');
const moment = require('moment');

const timestamp = moment().format('YYYYMMDDHHmm');
const data = fs.readFileSync(`${__dirname}/../gitchanges.txt`).toString('utf8');
const readjson = fs.readdirSync(`${__dirname}/../services`);
const result = [];

readjson.forEach((service) => {
    
    const directMatch = data.match(new RegExp(`services/${service}/`, 'i'));
    const matcher = (directMatch && directMatch.length > 0);
    if (matcher) {

        console.log(service);
        const temp = JSON.parse(fs.readFileSync(`${__dirname}/../services/${service}/package.json`));

        result.push({
            name: service,
            build: true,
            buildversion: `${temp.version}-${timestamp}`,
        });
    }
});
fs.writeFileSync(`${__dirname}/toBuild.json`, JSON.stringify(result));