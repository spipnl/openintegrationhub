/* eslint-disable no-undef */
/* eslint-disable no-console */
process.env.AUTH_TYPE = 'basic';
const request = require('request-promise').defaults({ simple: false, resolveWithFullResponse: true });
const importToken = require('../iam/test.spec.js');


let tokenAdmin = null;
let componentID = null;
let invalidToken = "9807324598624kjhf";

describe('Component Repository', () => {
   jest.setTimeout(15000);		
	test('--- GET ALL COMPONENTS ---', async(done) => {  
		tokenAdmin = importToken.token;
		//console.log("imported token for component repo: " + tokenAdmin);
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
	
	test('--- CREATE NEW COMPONENT ---', async(done) => {   
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
				component_ID = await Promise.resolve(res.body.data.id);
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
	
	test('--- GET COMPONENT BY ID ---', async(done) => {
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
	
	
	test('--- PATCH COMPONENT BY ID ---', async(done) => {
		const getComponentData = {
			method: 'GET',
			uri: `http://component-repository.openintegrationhub.com/components/${componentID}`,
			json: true,
			headers: {
				"Authorization" : " Bearer " + tokenAdmin, 
			}
		};
		let response = await request(getComponentData);
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
		await request(patchComponent);
		expect(response.statusCode).toEqual(200);
		done();	
	done();	
	});
	
	test('--- DELETE COMPONENT BY ID ---', async (done) => { 
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
	
	test('--- GET ALL COMPONENTS - TOKEN INVALID ---', async(done) => {   
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
	
	test('--- CREATE NEW COMPONENT - TOKEN INVALID ---', async(done) => {   
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
	
	test('--- GET COMPONENT BY ID - TOKEN INVALID ---', async(done) => {
		
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
	
	test('--- GET COMPONENT BY ID - COMPONENT NOT FOUND / ID NOT FOUND ---', async(done) => {	
		const invalidComponentID = "5d09fe4a5b915f001bb4234a";
		
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
	
	test('--- GET COMPONENT BY ID - ID INVALID ---', async(done) => {	
		const invalidComponentID = "&$$%&%$§";
		
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
	
	test('--- PATCH COMPONENT BY ID - COMPONENT NOT FOUND ---', async(done) => {
		const invalidComponentID = "&$$%&%$§";

		const getComponentById = {
			method: 'PATCH',
			uri: `http://component-repository.openintegrationhub.com/components/${invalidComponentID}`,
			json: true,
			headers: {
				"Authorization" : " Bearer " + tokenAdmin, 
			}
		};
		const response = await request(getComponentById);	
		//console.log(JSON.stringify(response.body));
		expect(response.statusCode).toEqual(400);
	done();
	});
	
	test('--- DELETE COMPONENT BY ID - TOKEN INVALID ---', async (done) => { 
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
	
	test('--- DELETE COMPONENT BY ID - COMPONENT NOT FOUND / ID INVALID ---', async (done) => { 
		const invalidComponentID = "5d09fe4a5b915f001bb4234a";
		const deleteComponentById = {
			method: 'DELETE',
			uri: `http://component-repository.openintegrationhub.com/components/${invalidComponentID}`,
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
