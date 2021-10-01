
import { createServer } from 'net';

const server = createServer((connection) => { 
  console.log('client connected');

  connection.on('end', () => {
    console.log('client disconnected');
  });

  connection.write('Hello World!\r\n');
  connection.pipe(connection);
});

server.listen(8080, () => { 
  console.log('server is listening');
});
