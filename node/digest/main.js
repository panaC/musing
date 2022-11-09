const { createHash } = require('crypto');

const username = 'pierre';
const nonce = process.argv[2];
const qop = 'auth';
const algorithm = 'MD5';
const realm = "calibre"// data.realm;
const cnonce = process.argv[3];
const uri = "/opds"; // pathname; 
const method = "GET";
const nonceCount = "00000004"; // TODO What is nc ? 

const ha1MD5 = createHash('md5').update(`${username}:${realm}:${username}`).digest("hex");
const ha1 = algorithm === "MD5-sess" ? createHash('md5').update(`${ha1MD5}:${nonce}:${cnonce}`).digest("hex") : ha1MD5;
const ha2 = createHash('md5').update(qop === "auth-int" ? '' : `${method}:${uri}`).digest("hex"); // qop === "auth-int" not supported what is entityBody?
const token = createHash('md5').update((qop === "auth" || qop === "auth-int") ? `${ha1}:${nonce}:${nonceCount}:${cnonce}:${qop}:${ha2}` : `${ha1}:${nonce}:${ha2}`).digest('hex');

const accessToken = `username="${username}", realm="${realm}", nonce="${nonce}", qop=${qop}, algorithm=${algorithm}, response="${token}", uri="${uri}", nc=${nonceCount}, cnonce="${cnonce}"`;
console.log(accessToken);
