
import { connect } from 'net';

const client = connect({port: 8080},() => {
     console.log('connected to server!');  
});

client.on('data', (data) => {
     console.log(data.toString());
     client.end();
});

client.on('end', () => { 
     console.log('disconnected from server');
});
