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

  test('--- FLOW REPO 2. GET All FLOWS ---', async (done) => {
		   
	tokenAdmin = importToken.token;
	console.log("imported token for flow repo: " + tokenAdmin);
	   
	const getAllFlows = {
            	method: 'GET',
            	uri: `http://flow-repository.openintegrationhub.com/flows`,
            	headers: {
                	"Authorization" : " Bearer " + tokenAdmin, 
            	}
      	};
     	const response = await request(getAllFlows);
     	expect(response.statusCode).toEqual(200);
     	done();
     });

  test('--- FLOW REPO 3. ADD NEW FLOW ---', async (done) => {
	          const createdFlow = {
   					"name":"D Testflow",
   					"description":"This flow takes actions at regular invervals based on a set timer",
   					"graph":{
     						 "nodes":[
         						{
            						"id":"step_1",
            						"componentId":"5cb87489df763a001a54c7de",
            						"function":"timer",
            						"name":"step_1",
            						"description":"string",
            						"fields":{
               							"intervall":"minute"
            						}
        				 		},
         						{
            						"id":"step_2",
            						"componentId":"5cdaba4d6474a5001a8b2588",
            						"function":"execute",
            						"fields":{
               							"code":"function* run() {console.log('Calling external URL');yield request.post({uri: 'http://requestbin.fullcontact.com/12os6ec1', body: msg, json: true});}"
            						}
         						}
      							],
      						"edges":[
         					{
            					"source":"step_1",
            					"target":"step_2"
         					}
      						]
   					},
   					"type":"ordinary",
   					"cron":"*/2 * * * *",
   					"owners":[]
   		};
        	const addFlow = {
        	method: 'POST',
        	uri: `http://flow-repository.openintegrationhub.com/flows`,
        	json: true,
			headers: {
                	"Authorization" : " Bearer " + tokenAdmin, 
            		},
        		body: createdFlow		
		};
		const response = await request(addFlow);
	    	    
		const getFlowId = async res => {
			try {
				id = await Promise.resolve(res.body.data.id);
			}
			catch (error) {
				console.log(error);
			}
			return id; 
		};
		flowID = await getFlowId(response);

		const getFlowName = async res2 => {
			try {
				name = await Promise.resolve(res2.body.data.name);
			}
			catch (error) {
				console.log(error);
			}
			return name; 
		};
		const getFlowStatus = async res3 => {
			try {
				status = await Promise.resolve(res3.body.data.status);
			}
			catch (error) {
				console.log(error);
			}
			return status; 
		};

		flowName = await getFlowName(response);
		flowStatus = await getFlowStatus(response); 
		
		console.log("token: " + tokenAdmin);
		//console.log("name: " + flowName);
		//console.log("id: " + flowID);

		expect(response.statusCode).toEqual(201);
    	done();
	});
	
	test('--- FLOW REPO 4. GET FLOW BY ID ---', async (done) => { 
		const getFlowById = {
				method: 'GET',
					uri: `http://flow-repository.openintegrationhub.com/flows/${flowID}`,
					headers: {
						"Authorization" : " Bearer " + tokenAdmin, 
					}
			};
		const response = await request(getFlowById);
		expect(response.statusCode).toEqual(200);
		done();
	});
	// patch here

	test('--- FLOW REPO 5. START FLOW BY ID ---', async (done) => { 
		const startFlowById = {
				method: 'POST',
					uri: `http://flow-repository.openintegrationhub.com/flows/${flowID}/start`,
					//json:	true,
					headers: {
						"Authorization" : " Bearer " + tokenAdmin, 
					}
		};
		const response = await request(startFlowById);	
		expect(response.statusCode).toEqual(200); 
	done();   		
	});

	test('--- FLOW REPO 6. STOP FLOW BY ID ---', async (done) => { 
		var status = false;
		while (status != true) {	
			const checkStatus = {
        			method: 'GET',
        			uri: `http://flow-repository.openintegrationhub.com/flows/${flowID}`,
        			json: true,
				headers: {
                			"Authorization" : " Bearer " + tokenAdmin 
            			}		
			};
			const response = await request(checkStatus);
			const getFlowStatus = async res3 => {
			try {
				status = await Promise.resolve(res3.body.data.status);
			}
			catch (error) {
				console.log(error);
			}
			return status; 
			};
			flowStatus = await getFlowStatus(response);
			if (flowStatus == "active") {
				status = true;
			}
		};
			
		const stopFlowById = {
				method: 'POST',
					uri: `http://flow-repository.openintegrationhub.com/flows/${flowID}/stop`,
					json:	true,
					headers: {
						"Authorization" : " Bearer " + tokenAdmin, 
					}
		};
		const response2 = await request(stopFlowById);	
		expect(response2.statusCode).toEqual(200); 
    	done();
	});

	test('--- FLOW REPO 7. PATCH FLOW BY ID ---', async (done) => { 
		var status2 = false;
		while (status2 != true) {	
			const checkStatus = {
        			method: 'GET',
        			uri: `http://flow-repository.openintegrationhub.com/flows/${flowID}`,
        			json: true,
				headers: {
                			"Authorization" : " Bearer " + tokenAdmin 
            			}		
			};
			const response = await request(checkStatus);
			const getFlowStatus = async res3 => {
			try {
				status = await Promise.resolve(res3.body.data.status);
			}
			catch (error) {
				console.log(error);
			}
			return status; 
			};
			flowStatus = await getFlowStatus(response);
			if (flowStatus == "inactive") {
				status2 = true;
			}
		};
		const getFlowData = {
			method: 'GET',
			uri: `http://flow-repository.openintegrationhub.com/flows/${flowID}`,
			json: true,
			headers: {
				"Authorization" : " Bearer " + tokenAdmin, 
			}
		};
		var response = await request(getFlowData);

		const newName = "new given name " + flowName;

		response.body.data.name = newName;

		const patchFlow = {
        		method: 'PATCH',
        		uri: `http://flow-repository.openintegrationhub.com/flows/${flowID}`,
        		json: true,
				headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		},
        		body: response 		
		};
		
		expect(response.statusCode).toEqual(200);
		done();
	});
	
	test('--- FLOW REPO 8. DELETE FLOW BY ID ---', async (done) => { 
		var status3 = false;
		while (status3 != true) {	
			const checkStatus = {
        			method: 'GET',
        			uri: `http://flow-repository.openintegrationhub.com/flows/${flowID}`,
        			json: true,
				headers: {
                			"Authorization" : " Bearer " + tokenAdmin 
            			}		
			};
			const response = await request(checkStatus);
			const getFlowStatus = async res3 => {
			try {
				status = await Promise.resolve(res3.body.data.status);
			}
			catch (error) {
				console.log(error);
			}
			return status; 
			};
			flowStatus = await getFlowStatus(response);
			if (flowStatus == "inactive") {
				status3 = true;
			}
		};
		const deleteFlowById = {
				method: 'DELETE',
					uri: `http://flow-repository.openintegrationhub.com/flows/${flowID}`,
					json:	true,
					headers: {
						"Authorization" : " Bearer " + tokenAdmin, 
					}
		};
		const response = await request(deleteFlowById);
		expect(response.statusCode).toEqual(200);
	done();
	});
});
  
