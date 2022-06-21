
local authorizationHeader = ngx.req.get_headers()["Authorization"];
ngx.log(ngx.DEBUG, string.format("Authorization: %s", authorizationHeader));

if authorizationHeader == nil or authorizationHeader == '' then
  ngx.status = ngx.HTTP_BAD_REQUEST;
  ngx.say("ERROR: No Authorization header");
  return ngx.exit(ngx.OK);
end

local authorizationKey = string.match(authorizationHeader, "EDRLAB (.*)")
ngx.log(ngx.DEBUG, string.format("Authorization key: %s", authorizationKey));

if authorizationKey == nil or authorizationKey == '' then
  ngx.status = ngx.HTTP_BAD_REQUEST;
  ngx.say("ERROR: not a valid authorization key");
  return ngx.exit(ngx.OK);
end
