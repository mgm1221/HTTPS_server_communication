const https = require('https')
const fs = require('fs')
const sslOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
  // Enable all security features
  minVersion: 'TLSv1.2',
  // Recommended security settings
  secureOptions: require('constants').SSL_OP_NO_SSLv3 |
              require('constants').SSL_OP_NO_TLSv1 |
              require('constants').SSL_OP_NO_TLSv1_1
};

const users = []
const posts = []


const server = https.createServer(sslOptions, (request, response)=>{

    if(request.url.startsWith('/user') ){
        if(request.method === "POST"){
            let data = '';

            request.on('data',chunk =>{
                data += chunk
            });

            request.on('end',()=>{

                try{
                    const newUser = JSON.parse(data);

                    if(newUser !== null && typeof newUser === 'object' && Number.isInteger(newUser.id) ){
                        const index = users.findIndex(u => u.id === newUser.id);

                        if(index ===-1){

                            users.push(newUser);
                            console.log("user Created");
                            response.writeHead(201, {'content-type': 'text/plain'});
                            response.end('New user was created successfully');

                        }else{
                            response.writeHead(403, {'content-type': 'text/plain'});
                            response.end('User with ID already exists');
                        }
                    }else{
                        response.writeHead(400, {'content-type': 'text/plain'});
                        response.end('Invalid user data');

                    }
                    
                }catch(error){
                    response.writeHead(400, {'content-type': 'text/plain'});
                    response.end('Invalid JSON');
                }
            });

            request.on('error',(error)=>{
                response.writeHead(500, {'content-type' : 'text/plain'});
                response.end('Request could not be processed');
            });
        }else if(request.method === "GET"){
            // no consume un stream de datos solo trabaja con la url asi que no 
            // hay que ocupar on error o on end
            const indexSearch = parseInt(request.url.split("/")[2]);
        
            if(!Number.isNaN(indexSearch)){ // NaN === NaN false

                const user = users.find(u => u.id === indexSearch);

                if(user !== undefined){

                    try{
                        response.writeHead(200, {"content-type": "application/json"});
                        response.end(JSON.stringify(user));
                    }catch(error){
                        response.writeHead(400, {'content-type': 'text/plain'});
                        response.end('Invalid JSON');
                    }
                    
                }else{
                    response.writeHead(404, {"content-type" : "text/plain"});
                    response.end("User not found");
                }

            }else{
                response.writeHead(400);
                response.end();
            }
        }else if(request.method === 'PUT'){
            let data = ''
            
            request.on('data', chunk=>{
                data += chunk;
            });

            request.on('end',() =>{
                try{

                    const dataObject = JSON.parse(data);

                    const indexSearch = parseInt(request.url.split("/")[2]);
            
                    if(!Number.isNaN(indexSearch)){
                        const user = users.find(u => u.id == indexSearch);

                        if(user !== undefined){

                            const allowedFields = ['name', 'email', 'money'];

                            for (const field of allowedFields) {

                                if (dataObject[field] !== undefined && typeof dataObject[field] === typeof user[field]) {
                                    
                                    user[field] = dataObject[field];
                                
                                }
                            }

                            response.writeHead(200, {"content-type" : "text/plain"});
                            response.end("Updated user successfully");

                        }else{
                            response.writeHead(404, {"content-type" : "text/plain"});
                            response.end("User not found");
                        }

                    }else{
                        response.writeHead(400, {"content-type" :"text/plain"});
                        response.end("Bad request");
                    }
                }catch(error){
                    response.writeHead(500, {"content-type" : "text/plain"});
                    response.end("Internal Server Error");
                }
                
            });
            
        }else if(request.method === 'DELETE'){

            const id = parseInt(request.url.split("/")[2]);

            const index = users.findIndex(u=> u.id == id);

            if(index !== -1){

                users.splice(index,1);
                response.writeHead(200,{"content-type" : "text/plain"});
                response.end("User deleted");


            }else{

                response.writeHead(404, {"content-type" : "text/plain"});
                response.end("User not Found");

            }


        }


    }else if(request.url.startsWith('/post/')){

        
    }else{
        response.writeHead(404, {'content-type': 'text/plain'});

        response.end('Bad Route');
    }



});

server.on('error', (error) => {
  console.error('Server error:', error);
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0',()=> {
    console.log(`Server running at https://localhost:${PORT}`)
});

