local hmac = require "resty.hmac"

local authorizationHeader = ngx.req.get_headers()["Authorization"];
print(string.format("Authorization: %s", authorizationHeader));

if authorizationHeader == nil or authorizationHeader == '' then
  ngx.status = ngx.HTTP_BAD_REQUEST;
  ngx.say("ERROR: No Authorization header");
  return ngx.exit(ngx.OK);
end

local authorizationKey = string.match(authorizationHeader, "EDRLAB (.*)")
-- print(string.format("Authorization key: %s", authorizationKey));

if authorizationKey == nil or authorizationKey == '' then
  ngx.status = ngx.HTTP_BAD_REQUEST;
  ngx.say("ERROR: not a valid authorization key");
  return ngx.exit(ngx.OK);
end

local hmac_sha1 = hmac:new("hello world", hmac.ALGOS.SHA1);

if not hmac_sha1 then
	ngx.log(ngx.ERR, "failed to create the hmac_sha1 object");
  ngx.status = ngx.HTTP_INTERNAL_SERVER_ERROR;
  return ngx.exit(ngx.OK);
end

ngx.req.read_body();
local data = ngx.req.get_body_data(); -- return lua string instead table
if data == nil or data == '' then
  ngx.status = ngx.HTTP_BAD_REQUEST;
  ngx.say("ERROR: No body available");
  return ngx.exit(ngx.OK);
end

local ok = hmac_sha1:update(data)
if not ok then
	ngx.log(ngx.ERR, "failed to add body data to hmac");
  ngx.status = ngx.HTTP_INTERNAL_SERVER_ERROR;
  return ngx.exit(ngx.OK);
end

local hmacKey = hmac_sha1:final(nil, true);

if not hmac_sha1:reset() then
	ngx.log(ngx.ERR, "failed to reset hmac");
end

if hmacKey ~= authorizationKey then
	ngx.log(ngx.ERR, string.format("hmac key (%s) doesn't match with authorization key (%s)", hmacKey, authorizationKey));
  ngx.status = ngx.HTTP_UNAUTHORIZED;
  ngx.say("ERROR: Bad authorization");
  return ngx.exit(ngx.OK);
end

print("Authorization OK");
