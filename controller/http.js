//CURRENTLY OF NO USE.

const http = require('http')

// make a request to a tunneling proxy
const options = {
    port: 1337,
    hostname: '127.0.0.1',
    method: 'CONNECT',
    path: 'www.google.com:80'
};

const req = http.request(options);
req.end();

req.on('connect', (res, socket, head) => {
console.log('got connected!');

// make a request over an HTTP tunnel
socket.write('GET / HTTP/1.1\r\n' +
                'Host: www.google.com:80\r\n' +
                'Connection: close\r\n' +
                '\r\n');
socket.on('data', (chunk) => {
    console.log(chunk.toString());
});
socket.on('end', () => {
    proxy.close();
});
});