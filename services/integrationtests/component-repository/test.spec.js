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
let invalidToken = "9807324598624kjhf";

describe('User Routes', () => {
   jest.setTimeout(15000);	
	//---------------------------------------component-repository---------------------------------------------------
	
	test('--- COMPONENT REPO 27. GET ALL COMPONENTS ---', async(done) => {  
		tokenAdmin = importToken.token;
		console.log("imported token for component repo: " + tokenAdmin);
		const getAllComponents = {
        		method: 'GET',
        		uri: `http://component-repository.openintegrationhub.com/components/`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		}
		};
		const response = await request(getAllComponents);
		expect(response.statusCode).toEqual(200);
    	done();
	});
	
	test('--- COMPONENT REPO 28. CREATE NEW COMPONENT ---', async(done) => {   
		const newComponent = {
  					"data": {
    					"name": "My Component",
    					"description": "My Component",
    					"access": "public",
    					"descriptor": {},
    					"distribution": {
      						"type": "docker",
      						"image": "openintegrationhub/email",
      						"registrySecretId": "5b62c919fd98ea00112d52e7"
    					},
    					"owners": [
      						{
        					"id": "123",
        					"type": "user"
      						}
    					]
  					}
		};
		const createNewComponent = {
        		method: 'POST',
        		uri: `http://component-repository.openintegrationhub.com/components/`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		},
			body: newComponent
		};
		
		const response = await request(createNewComponent);
		
		const getComponentID = async res => {
			try {
				var component_ID = await Promise.resolve(res.body.data.id);
			}
			catch (error) {
				console.log(error);
			}
			return component_ID; 
		};
		componentID = await getComponentID(response);
		expect(response.statusCode).toEqual(201);
    	done();
	});
	
	test('--- COMPONENT REPO 29. GET COMPONENT BY ID ---', async(done) => {
		const getComponentById = {
			method: 'GET',
			uri: `http://component-repository.openintegrationhub.com/components/${componentID}`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		}
		};
		const response = await request(getComponentById);	
		expect(response.statusCode).toEqual(200);
		
	done();
	});	
	
	
	test('--- COMPONENT REPO 30. PATCH COMPONENT BY ID ---', async(done) => {
		const getComponentData = {
			method: 'GET',
			uri: `http://component-repository.openintegrationhub.com/components/${componentID}`,
			json: true,
			headers: {
				"Authorization" : " Bearer " + tokenAdmin, 
			}
		};
		var response = await request(getComponentData);
		const newDescription = "new given desc ";

		response.body.data.description = newDescription;
			
		const patchComponent = {
        		method: 'PATCH',
        		uri: `http://component-repository.openintegrationhub.com/components/${componentID}`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		},
			body: response
		};
		const patchedComponent = await request(patchComponent);
		expect(response.statusCode).toEqual(200);
		done();	
	done();	
	});
	
	test('--- COMPONENT REPO 31. DELETE COMPONENT BY ID ---', async (done) => { 
		const deleteComponentById = {
			method: 'DELETE',
			uri: `http://component-repository.openintegrationhub.com/components/${componentID}`,
			json:	true,
			headers: {
				"Authorization" : " Bearer " + tokenAdmin, 
				}
			};
		const response = await request(deleteComponentById);
		expect(response.statusCode).toEqual(204);
	done();
	});
	
	//---------------------------------------------------------------------------------------------------------
	
	test('--- COMPONENT REPO 32. GET ALL COMPONENTS - TOKEN INVALID ---', async(done) => {   
		const getAllComponents = {
        		method: 'GET',
        		uri: `http://component-repository.openintegrationhub.com/components/`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + invalidToken, 
            		}
		};
		const response = await request(getAllComponents);
		expect(response.statusCode).toEqual(401);
    	done();
	});
	
	test('--- COMPONENT REPO 33. CREATE NEW COMPONENT - TOKEN INVALID ---', async(done) => {   
		const newComponent = {
  					"data": {
    					"name": "My Component",
    					"description": "My Component",
    					"access": "public",
    					"descriptor": {},
    					"distribution": {
      						"type": "docker",
      						"image": "openintegrationhub/email",
      						"registrySecretId": "5b62c919fd98ea00112d52e7"
    					},
    					"owners": [
      						{
        					"id": "123",
        					"type": "user"
      						}
    					]
  					}
		};
		const createNewComponent = {
        		method: 'POST',
        		uri: `http://component-repository.openintegrationhub.com/components/`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + invalidToken, 
            		},
			body: newComponent
		};
		
		const response = await request(createNewComponent);
		//console.log("component id: " + componentID);
		expect(response.statusCode).toEqual(401);
    	done();
	});
	
	test('--- COMPONENT REPO 34. GET COMPONENT BY ID - TOKEN INVALID ---', async(done) => {
		
		const getComponentById = {
			method: 'GET',
			uri: `http://component-repository.openintegrationhub.com/components/${componentID}`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + invalidToken, 
            		}
		};
		const response = await request(getComponentById);	
		expect(response.statusCode).toEqual(401);		
	done();
	});
	
	test('--- COMPONENT REPO 35. GET COMPONENT BY ID - COMPONENT NOT FOUND / ID NOT FOUND ---', async(done) => {	
		var invalidComponentID = "5d09fe4a5b915f001bb4234a";
		
		const getComponentById = {
			method: 'GET',
			uri: `http://component-repository.openintegrationhub.com/components/${invalidComponentID}`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		}
		};
		
		const response = await request(getComponentById);	
		expect(response.statusCode).toEqual(404);
	done();
	});
	
	test('--- COMPONENT REPO 36. GET COMPONENT BY ID - ID INVALID ---', async(done) => {	
		var invalidComponentID = "&$$%&%$§";
		
		const getComponentById = {
			method: 'GET',
			uri: `http://component-repository.openintegrationhub.com/components/${invalidComponentID}`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		}
		};
		
		const response = await request(getComponentById);	
		expect(response.statusCode).toEqual(400);
	done();
	});
	
	test('--- COMPONENT REPO 37. PATCH COMPONENT BY ID - COMPONENT NOT FOUND ---', async(done) => {	
		const getComponentById = {
			method: 'GET',
			uri: `http://component-repository.openintegrationhub.com/components/${componentID}`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + invalidToken, 
            		}
		};
		const response = await request(getComponentById);	
		//console.log(JSON.stringify(response.body));
		expect(response.statusCode).toEqual(401);
	done();
	});
	
	test('--- COMPONENT REPO 38. DELETE COMPONENT BY ID - TOKEN INVALED ---', async (done) => { 
		const deleteComponentById = {
			method: 'DELETE',
			uri: `http://component-repository.openintegrationhub.com/components/${componentID}`,
			json:	true,
			headers: {
				"Authorization" : " Bearer " + invalidToken, 
			}
		};
		const response = await request(deleteComponentById);
		expect(response.statusCode).toEqual(401);
	done();
	});
	
	test('--- COMPONENT REPO 39. DELETE COMPONENT BY ID - COMPONENT NOT FOUND / ID INVALID ---', async (done) => { 
		var invalidComponentID = "5d09fe4a5b915f001bb4234a";
		const deleteComponentById = {
			method: 'DELETE',
			uri: `http://component-repository.openintegrationhub.com/components/${componentID}`,
			json:	true,
			headers: {
				"Authorization" : " Bearer " + tokenAdmin, 
			}
		};
		const response = await request(deleteComponentById);
		expect(response.statusCode).toEqual(404);
	done();
	});
});
