process.env.AUTH_TYPE = 'basic';
const request = require('request-promise').defaults({ simple: false, resolveWithFullResponse: true });
const username = process.env.username;
const password = process.env.password;
const importToken = require('./iam/test.spec.js');

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
	
	test('--- METADATA REPO 21. GET ALL DOMAINS ---', async (done) => {
		const getAllDomains = {
			method: 'GET',
			uri: `http://metadata.openintegrationhub.com/api/v1/domains`,
			json: true,
			headers: {
				"Authorization" : " Bearer " + tokenAdmin, 
				}
		};
		const response = await request(getAllDomains);
		expect(response.statusCode).toEqual(200); 
	done();
	});
	
	test('--- METADATA REPO 22. CREATE NEW DOMAIN ---', async (done) => {
		const toBeUploaded = {
  					"data": {
    						"name": "string",
    						"description": "string",
    						"public": true,
    						"owners": [
      							{
        						"id": "string",
        						"type": "string"
      							}
    						],
    						"id": "string",
    						"createdAt": "2019-06-03T14:58:39.897Z",
    						"updatedAt": "2019-06-03T14:58:39.897Z"
  					}					
		};
		const getAllDomains = {
        		method: 'POST',
        		uri: `http://metadata.openintegrationhub.com/api/v1/domains/`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		},
        		body: toBeUploaded		
		};		
		const response = await request(getAllDomains);
		
		const getDomainID = async res => {
			try {
				var domain_ID = await Promise.resolve(res.body.data.id);
			}
			catch (error) {
				console.log(error);
			}
			return domain_ID; 
		};
		domainID = await getDomainID(response);
		console.log(JSON.stringify("domain id: " + domainID));
		expect(response.statusCode).toEqual(200);
	
	done();
	});
	
	test('--- METADATA REPO 23. GET DOMAIN BY ID ---', async (done) => {
		const getDomainByID = {
        		method: 'GET',
        		uri: `http://metadata.openintegrationhub.com/api/v1/domains/${domainID}`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		}		
		};		
		const response = await request(getDomainByID);
		expect(response.statusCode).toEqual(200);
	
	done();
	});
	
	test('--- METADATA REPO 24. PUT DOMAIN BY ID ---', async (done) => { 	
		const getDomainData = {
			method: 'GET',
			uri: `http://metadata.openintegrationhub.com/api/v1/domains/${domainID}`,
			json: true,
			headers: {
				"Authorization" : " Bearer " + tokenAdmin, 
			}
		};
		const response = await request(getDomainData);
		const domainDesc = "short desc update";
		const newDescription = "new description: " + domainDesc;
		response.body.data.description = newDescription;

		const patchDomain = {
        		method: 'PUT',
        		uri: `http://metadata.openintegrationhub.com/api/v1/domains/${domainID}`,
        		json: true,
				headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		},
        		body: response 		
		};
		expect(response.statusCode).toEqual(200);
	
	done();
	});
		
	test('--- METADATA 25. IMPORT DOMAIN MODEL ---', async(done) => {   
		const newModel = {
    				"data": {
        				"name": "test",
        				"description": "upload test",
        				"value": {
            					"$id": "testing",
            					"properties": {
                					"first_name": {
                    						"type": "string"
                					},
                					"last_name": {
                    						"type": "string"
                						}
            						}
        					}
    				}
		};
		
		const addDomainModel = {
        		method: 'POST',
        		uri: `http://metadata.openintegrationhub.com/api/v1/domains/${domainID}/schemas`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		},
        		body: newModel		
		};
		
		const response = await request(addDomainModel);
		//console.log(JSON.stringify(response.body));
		expect(response.statusCode).toEqual(200);
		
    	done();
	});
	
	test('--- METADATA REPO 25.1 PUT DOMAIN MODEL BY URI ---', async(done) => {   
		const newModel = {
    				"data": {
        "name": "test",
        "description": "upload test",
        "value": {
            "$id": "testing",
            "properties": {
                "first_name": {
                    "type": "string"
                },
                "given_name": {
                    "type": "string"
                }
            			}
        			}
    			}
		};
		
		const addDomainModel = {
        		method: 'PUT',
        		uri: `http://metadata.openintegrationhub.com/api/v1/domains/${domainID}/schemas/testing`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		},
        		body: newModel		
		};
		
		const response = await request(addDomainModel);
		//console.log(JSON.stringify(response.body));
		expect(response.statusCode).toEqual(200);
		
    	done();
	});
	
	test('--- METADATA REPO 26. GET ALL DOMAIN MODEL SCHEMES ---', async(done) => {   	
		const requestOptions = {
        		method: 'GET',
        		uri: `http://metadata.openintegrationhub.com/api/v1/domains/${domainID}/schemas`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		}
		};
		const response = await request(requestOptions);
		//console.log(JSON.stringify(response.body));
		expect(response.statusCode).toEqual(200);
    	done();
	});
	
	test('--- METADATA REPO 26.1 GET DOMAIN MODEL SCHEME BY ID ---', async(done) => {   	
		const requestOptions = {
        		method: 'GET',
        		uri: `http://metadata.openintegrationhub.com/api/v1/domains/${domainID}/schemas/testing`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		}
		};
		const response = await request(requestOptions);
		//console.log(JSON.stringify(response.body));
		expect(response.statusCode).toEqual(200);
    	done();
	});
	
	test('--- METADATA REPO 26.2 DELETE DOMAIN MODEL SCHEME BY ID ---', async(done) => {   	
		const requestOptions = {
        		method: 'DELETE',
        		uri: `http://metadata.openintegrationhub.com/api/v1/domains/${domainID}/schemas/testing`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		}
		};
		const response = await request(requestOptions);
		expect(response.statusCode).toEqual(204);
    	done();
	});
});
