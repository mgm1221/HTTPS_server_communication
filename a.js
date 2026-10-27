const https = require('https');
const fs = require('fs');
const { URL } = require('url');

const sslOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
  minVersion: 'TLSv1.2',
  secureOptions: require('constants').SSL_OP_NO_SSLv3 |
              require('constants').SSL_OP_NO_TLSv1 |
              require('constants').SSL_OP_NO_TLSv1_1
};



const Create = {
    hostname: 'localhost',
    port: 3001,
    path: '/user',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/plain',
    },
    ca: fs.readFileSync('cert.pem'),
};
const Update = {
    hostname: 'localhost',
    port: 3001,
    path: '/user/',
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/plain',
    },
    ca: fs.readFileSync('cert.pem'),
};
const Get = {
    hostname: 'localhost',
    port: 3001,
    path: '/user/',
    method: 'GET',
    ca: fs.readFileSync('cert.pem'),
};
const Delete = {
    hostname: 'localhost',
    port: 3001,
    path: '/user/',
    method: 'DELETE',
    ca: fs.readFileSync('cert.pem'),
};

const server = https.createServer(sslOptions,(request,response) =>{

    if(request.url.startsWith("/usuario")){

        if(request.method === 'POST'){
            let data = '';
            request.on('data', chunk =>{
                data += chunk;
            });

            request.on('end',()=>{

                const req = https.request(Create,(res)=>{
                    const {statusCode} = res;

                    if(statusCode === 201){
                        response.writeHead(201, {'content-type': 'text/plain'});
                        response.end('New user was created successfully');
                    }else{
                        response.writeHead(400, {'content-type': 'text/plain'});
                        response.end('Error at Create');
                    }
                });

                req.end(data);

            })

        }

    }

});


server.on('error', (error) => {
  console.error('Server error:', error);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at https://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
});