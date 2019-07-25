
process.env.AUTH_TYPE = 'basic';
const request = require('request-promise').defaults({ simple: false, resolveWithFullResponse: true });
const username = process.env.username;
const password = process.env.password;
const importToken = require('../iam/test.spec.js');

let tokenUser = null; 
let tokenAdmin = null;
let flowID = null;
let flowName = null;
let flowStatus = null;
let token = null;
let status_flow = null;
let domainID = null;
let componentID = null;

describe('User Routes', () => {
   jest.setTimeout(15000);
	test('--- AUDIT LOG 9. GET ALL LOGS ---', async (done) => {
		tokenAdmin = importToken.token;
		console.log("imported token for audit log: " + tokenAdmin);
		const getAllLogs = {
			method: 'GET',
				uri: `http://auditlog.openintegrationhub.com/logs`,
				json:	true,
				headers: {
					"Authorization" : " Bearer " + tokenAdmin 
				}
		};
		const response = await request(getAllLogs);
		//console.log("get all logs: " + JSON.stringify(response.body));
		expect(response.statusCode).toEqual(200);
	done();
	});

	test('--- AUDIT LOG 10. ADD LOG ---', async (done) => { 
		process.env.IAM_AUTH_TYPE = 'basic';
		const createdLog = {
        		"service": "MyService",
  			"timeStamp": "1234567",
  			"nameSpace": "outerSpace",
  			"payload": {
    				"tenant": "1",
    				"source": "SomeSource",
    				"object": "SomeObject",
    				"action": "foo",
    				"subject": "Test Subject",
    				"details": "A human-readable detailed description"
  			}
		};    
        	const addLog = {
        		method: 'POST',
        		uri: `http://auditlog.openintegrationhub.com/logs`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin 
            		},
        		body: createdLog		
		};
		const response = await request(addLog);
		expect(response.statusCode).toEqual(201);
    	done();
	});
	
	//-----------------------------------neg-audit-----------------------------------------------------
  
	var invalidToken = tokenAdmin + "axsyfdas"
	
	test('--- MISSING AUTH ---', async (done) => {
		const getAllLogs = {
			method: 'GET',
				uri: `http://auditlog.openintegrationhub.com/logs`,
				json:	true,
				headers: {
				//	"Authorization" : " Bearer " + invalidAdmin 
				}
		};
		const response = await request(getAllLogs);
		//console.log("get all logs: " + JSON.stringify(response.body));
		expect(response.statusCode).toEqual(401);
	done();
	});
	
	
	test('--- INVALID TOKEN ---', async (done) => {
		const getAllLogs = {
			method: 'GET',
				uri: `http://auditlog.openintegrationhub.com/logs`,
				json:	true,
				headers: {
					"Authorization" : " Bearer " + invalidToken
				}
		};
		const response = await request(getAllLogs);
		//console.log("get all logs: " + JSON.stringify(response.body));
		expect(response.statusCode).toEqual(401);
	done();
	});

});
