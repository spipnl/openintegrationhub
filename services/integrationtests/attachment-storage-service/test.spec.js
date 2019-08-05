process.env.AUTH_TYPE = 'basic';
const request = require('request-promise').defaults({ simple: false, resolveWithFullResponse: true });
const username = process.env.username;
const password = process.env.password;
const importToken = require('../iam/test.spec.js');
Token = require('../iam/test.spec.js');
const path = require('path');

let tokenUser = null; 
let tokenAdmin = null;
let token = null;
const invalidToken = "034957430985";
const testUuid = "67f718b9-0b36-40b8-89d6-1899ad86f97e";
let batchId = null;

describe('Attachment-Storage-Service', () => {
   jest.setTimeout(15000);
	
  /*
	test('--- CREATE A MESSAGE ---', async (done) => {
		const toBeUploaded = {
  					"data": {
    						"name": "string",
    						"description": "string",
    						"public": true,
  					}					
		};
		const createMessage = {
        		method: 'POST',
        		uri: `http://attachment-storage-service.openintegrationhub.com/objects/${testUuid}`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		},
        		body: toBeUploaded		
		};		
		const response = await request(createMessage);
		
		const getMessageID = async res => {
			try {
				var message_ID = await Promise.resolve(res.body.data.id);
			}
			catch (error) {
				console.log(error);
			}
			return message_ID; 
		};
		messageID = await getDomainID(response);
		//console.log(`message id: ${JSON.stringify(res.body)}`);
		console.log(JSON.stringify(`message id: ${messageID}`));
		expect(response.statusCode).toEqual(200);
	
	done();
	});
  
  test('--- GET MESSAGE BY ID ---', async (done) => {
		tokenAdmin = importToken.token;
		console.log("imported token for meta data: " + tokenAdmin);
		const getMessageByID = {
			method: 'GET',
			uri: `http://attachment-storage-service.openintegrationhub.com/objects/${testUuid}`,
			json: true,
			headers: {
				"Authorization" : " Bearer " + tokenAdmin, 
				}
		};
		const response = await request(getMessageByID);
		expect(response.statusCode).toEqual(200); 
	done();
	});
	
	test('--- DELETE A MESSAGE ---', async (done) => {
		const deleteMessageById = {
        		method: 'GET',
        		uri: `http://attachment-storage-service.openintegrationhub.com/objects/${testUuid}`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		}		
		};		
		const response = await request(deleteMessageById);
		expect(response.statusCode).toEqual(200);
	
	done();
	});
	
	test('--- CREATE REQUEST FOR MESSAGE BATCH DELETION ---', async (done) => { 	
		const batchDelete = {
			method: 'GET',
			uri: `http://attachment-storage-service.openintegrationhub.com/batch/delete`,
			json: true,
			headers: {
				"Authorization" : " Bearer " + tokenAdmin, 
			}
		};
		const response = await request(batchDelete);
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
		
	test('--- GET BATCH DELETE REQUEST STATUS ---', async(done) => {   
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
		
		const batchDeleteStatus = {
        		method: 'POST',
        		uri: `http://attachment-storage-service.openintegrationhub.com/batch/delete/{batchId}`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		},
        		body: newModel		
		};
		
		const response = await request(batchDeleteStatus);
		expect(response.statusCode).toEqual(200);	
    	done();
	});
  
  ---
  
  	test('--- GET MESSAGE BY ID - INVALID ID ---', async (done) => {
		tokenAdmin = importToken.token;
		console.log("imported token for meta data: " + tokenAdmin);
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
  
  test('--- GET MESSAGE BY ID - INVALID TOKEN ---', async (done) => {
		tokenAdmin = importToken.token;
		console.log("imported token for meta data: " + tokenAdmin);
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
	
	test('--- CREATE A MESSAGE - INVALID TOKEN ---', async (done) => {
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
	
	test('--- DELETE A MESSAGE - INVALID ID---', async (done) => {
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
  
  test('--- DELETE A MESSAGE - INVALID TOKEN---', async (done) => {
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
	
	test('--- CREATE REQUEST FOR MESSAGE BATCH DELETION - INVALID ID ---', async (done) => { 	
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
  
  test('--- CREATE REQUEST FOR MESSAGE BATCH DELETION - INVALID TOKEN ---', async (done) => { 	
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
		
	test('--- GET BATCH DELETE REQUEST STATUS - INVALID ID ---', async(done) => {   
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
  
  test('--- GET BATCH DELETE REQUEST STATUS - INVALID TOKEN ---', async(done) => {   
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
  */
  
  console.log('tbd');
});
