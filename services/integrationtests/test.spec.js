process.env.AUTH_TYPE = 'basic';
const request = require('request-promise').defaults({ simple: false, resolveWithFullResponse: true });
const username = process.env.username;
const password = process.env.password;
//let conf = null;

let tokenUser = null; 
let tokenAdmin = null;
let flowID = null;
let flowName = null;
let flowStatus = null;
let token = null;
let status_flow = null;
var start = Date.now();


describe('User Routes', () => {
    test('--- LOGIN & TOKEN ---', async (done) => {
        const jsonPayload = {
        	username,
        	password
		};
        const Login = {
        	method: 'POST',
        	uri: `http://iam.openintegrationhub.com/login`,
        	json: true,
        	body: jsonPayload
        };
		const response = await request(Login);

		const getToken = async res => {
			try {
				token = await Promise.resolve(res.body.token);
			}
			catch (error) {
				console.log(error);
			}
			return token; 
		};	

		tokenAdmin = await getToken(response); 
		expect(response.statusCode).toEqual(200);	
    	done();
    });	
		
    test('--- GET All FLOWS ---', async (done) => { 
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

    test('--- ADD NEW FLOW ---', async (done) => {
		   const createdFlow = {
   					"name":"D Testflow",
   					"description":"This flow takes actions at regular invervals based on a set timer.",
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
	    
	     	console.log(JSON.stringify(response.body));
	    	console.log(JSON.stringify(addFlow.body));
	    
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
		
		console.log("token" + tokenAdmin); //works
		console.log("name" + flowName);
		console.log("id" + flowID); //work
		console.log("status" + flowStatus); // keiner? / Null

		expect(response.statusCode).toEqual(201);
    	done();
	});
	
	test('--- GET FLOW BY ID ---', async (done) => { 
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

	test('--- START FLOW BY ID ---', async (done) => { 
		const startFlowById = {
				method: 'POST',
					uri: `http://flow-repository.openintegrationhub.com/flows/${flowID}/start`,
					//json:	true,
					headers: {
						"Authorization" : " Bearer " + tokenAdmin, 
					}
		};
		const response = await request(startFlowById);
		
		console.log(JSON.stringify(response.body)); // status = starting 
		
		done();   		
	});
	
	test('--- TIMEOUT ---', async (done) => {
        const jsonPayload = {
        	username,
        	password
		};
        const Login = {
        	method: 'POST',
        	uri: `http://iam.openintegrationhub.com/login`,
        	json: true,
        	body: jsonPayload
        };
		const response = await request(Login);

		const getToken = async res => {
			try {
				token = await Promise.resolve(res.body.token);
			}
			catch (error) {
				console.log(error);
			}
			return token; 
		};	

		tokenAdmin = await getToken(response); 
		expect(response.statusCode).toEqual(200);	
    	done();
    });	

	test('--- STOP FLOW BY ID ---', async (done) => { 
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
			console.log(JSON.stringify(response.body));
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
			console.log("flowstatus beim check: " + flowStatus);
			if (flowStatus = "active") {
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
		
			const getFlowStatus = async res6 => {
				try {
					status_flow = await Promise.resolve(res6.body);
				}
				catch (error) {
					console.log(error);
				}
				return status_flow; 
			};
			flowStatus = await getFlowStatus(response2); 
		
			 	
			expect(response2.statusCode).toEqual(200);
			console.log("flowstatus after call stop: " + flowStatus); // = null / undefined
    		done();
	});

	test('--- PATCH FLOW BY ID ---', async (done) => { 
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
		console.log(JSON.stringify(response.body));
		done();
	});
	
	test('--- DELETE FLOW BY ID ---', async (done) => { 
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
	
	//--------------------------------------------------------------------------------------
	
	// This will only return logs that pertain to the current user's tenant -> zuweisbar über Token?
	test('--- GET ALL LOGS ---', async (done) => {
		const getAllLogs = {
			method: 'GET',
				uri: `http://auditlog.openintegrationhub.com/logs`,
				json:	true,
				headers: {
					"Authorization" : " Bearer " + tokenAdmin, 
				}
		};
	const response = await request(getAllLogs);
	//console.log(response.body);
	expect(response.statusCode).toEqual(200);
	done();
	});

	test('--- ADD LOG ---', async (done) => { 
		process.env.IAM_AUTH_TYPE = 'basic';
		const createdFlow = {
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
                		"Authorization" : " Bearer " + tokenAdmin, 
            		},
        		body: createdFlow		
		};
		const response = await request(addLog);
		expect(response.statusCode).toEqual(201);
    		done();
	});
});
