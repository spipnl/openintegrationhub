process.env.AUTH_TYPE = 'basic';
const request = require('request-promise').defaults({ simple: false, resolveWithFullResponse: true });
const username = process.env.username;
const password = process.env.password;
const importToken = require('../iam/test.spec.js');
const fs = require('fs-extra');
const path = require('path');


let tokenUser = null; 
let tokenAdmin = null;
let flowID = null;
let flowName = null;
let flowStatus = null;
let token = null;
let status_flow = null;
let domainID = null;
let componentID = null;
let invalidToken = "034957430985";

describe('Metadata-Repository', () => {
   jest.setTimeout(15000);
	test('--- GET ALL DOMAINS ---', async (done) => {
		tokenAdmin = importToken.token;
		//console.log("imported token for meta data: " + tokenAdmin);
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
	
	test('--- CREATE NEW DOMAIN ---', async (done) => {
		const toBeUploaded = {
  					"data": {
    						"name": "string",
    						"description": "string",
    						"public": true,
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
		//console.log(`domain id: ${JSON.stringify(res.body)}`);
		console.log(JSON.stringify("domain id: " + domainID));
		expect(response.statusCode).toEqual(200);
	
	done();
	});
	
	test('--- GET DOMAIN BY ID ---', async (done) => {
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
	
	test('--- PUT DOMAIN BY ID ---', async (done) => { 	
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
		
	test('--- IMPORT DOMAIN MODEL ---', async(done) => {   
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
		expect(response.statusCode).toEqual(200);	
    	done();
	});
	
	test('--- PUT DOMAIN MODEL BY URI ---', async(done) => {   
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
	
	test('--- GET ALL DOMAIN MODEL SCHEMES ---', async(done) => {   	
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
	
	test('--- IMPORT BULK OF MODELS ---', async(done) => {   	
		const uploadBulk = {
        		method: 'POST',
        		uri: `http://metadata.openintegrationhub.com/api/v1/domains/${domainID}/schemas/import`,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin,
				contentType: 'multipart/form-data'
            		},		
		        form: fs.createReadStream(path.dirname('valid.zip'))
		};
		
		const response = await request(uploadBulk);
		expect(response.statusCode).toEqual(200);	
    	done();
	});
	
	test('--- GET DOMAIN MODEL SCHEME BY ID ---', async(done) => {   	
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
	
	test('--- DELETE DOMAIN MODEL SCHEME BY ID ---', async(done) => {   	
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
	
	test('--- GET ALL DOMAIN MODELS - INVALID TOKEN ---', async(done) => {   	
		const requestOptions = {
        		method: 'GET',
        		uri: `http://metadata.openintegrationhub.com/domains/${domainID}/schemas`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + invalidToken, 
            		}
		};
		
		const response = await request(requestOptions);
		expect(response.statusCode).toEqual(404);
		//console.log(JSON.stringify(response.body));
    	done();
	});
	
	test('--- GET ALL DOMAIN MODELS - INVALID DOMAIN ID ---', async(done) => {  
		var invalidDomainID = "034957430985";
		const requestOptions = {
        		method: 'GET',
        		uri: `http://metadata.openintegrationhub.com/domains/${invalidDomainID}/schemas`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		}
		};
		
		const response = await request(requestOptions);
		expect(response.statusCode).toEqual(404);
		//console.log(JSON.stringify(response.body));
    	done();
	});
	
	test('--- CREATE NEW DOMAIN - INVALID TOKEN ---', async (done) => {
		var invalidToken = "034957430985";
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
                		"Authorization" : " Bearer " + invalidToken, 
            		},
        		body: toBeUploaded		
		};		
		const response = await request(getAllDomains);
		expect(response.statusCode).toEqual(401);
	
	done();
	});
	
	test('--- GET DOMAIN BY ID - INVALID DOMAIN ID ---', async (done) => {
		var invalidDomainID ="lksfhdslfh";
		const getDomainByID = {
        		method: 'GET',
        		uri: `http://metadata.openintegrationhub.com/api/v1/domains/${invalidDomainID}`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		}		
		};		
		const response = await request(getDomainByID);
		expect(response.statusCode).toEqual(404);
	done();
	});
	
	test('--- PUT DOMAIN BY ID - INVALID DOMAIN ID ---', async (done) => { 	
		var invalidDomainID ="lksfhdslfh";
		const getDomainData = {
			method: 'GET',
			uri: `http://metadata.openintegrationhub.com/api/v1/domains/${domainID}`,
			json: true,
			headers: {
				"Authorization" : " Bearer " + tokenAdmin, 
			}
		};
		const response = await request(getDomainData);
		const domainDesc = "short descr update";
		const newDescription = "new description: " + domainDesc;
		response.body.data.description = newDescription;

		const patchDomain = {
        		method: 'PUT',
        		uri: `http://metadata.openintegrationhub.com/api/v1/domains/${invalidDomainID}`,
        		json: true,
				headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		},
        		body: response 		
		};
		const response2 = await request(patchDomain);
		expect(response2.statusCode).toEqual(404);
	done();
	});
});
