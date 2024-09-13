
const fs = require('fs');
const unzipper = require('unzipper');
const {crc32} = require('crc');

let checksum = 0;

const fd = fs.createReadStream('test.zip')

fd.on('end', () => console.log(checksum.toString(16)));

fd.on('close', () => console.log('close'));

const zipFile = fd.pipe(unzipper.Parse());

zipFile.on('entry', (entry) => {
	checksum = crc32(entry.vars.crc32.toString(16), checksum);
	entry.autodrain();
})

zipFile.on('error', (e) => console.log(e));
