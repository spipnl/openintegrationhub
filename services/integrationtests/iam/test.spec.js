process.env.AUTH_TYPE = 'basic';
const request = require('request-promise').defaults({ simple: false, resolveWithFullResponse: true });
const username = process.env.username;
const password = process.env.password;

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
    test('--- IAM 1. LOGIN & TOKEN ---', async (done) => {
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
});

module.exports = tokenAdmin;
