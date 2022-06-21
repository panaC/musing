local hmac = require "resty.hmac"
local cjson = require "cjson"
local mysql = require "resty.mysql"

-- https://gist.github.com/punkael/107b9fbbce47a09e9d7e
function bind(sql, ... )
  local clean = {}
  local arg={...} 
  sql = string.gsub(sql, "?", "%%s", 20) 
  for i,v in ipairs(arg) do
    clean[i] = ngx.quote_sql_str(ngx.unescape_uri(v)) 
  end
  sql = string.format(sql, unpack(clean))
    return sql
end
--

local db, err = mysql:new()
if not db then
	ngx.log(ngx.ERR, string.format("failed to instantiate mysql: %s", err));
  ngx.status = ngx.HTTP_INTERNAL_SERVER_ERROR;
  return ngx.exit(ngx.OK);
end

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

-- check timestamp

print(string.format("data: '%s'", data));
local json = cjson.decode(data);
local ts = json["timestamp"];
if not ts then
	ngx.log(ngx.ERR, "timestamp not found in body");
  ngx.status = ngx.HTTP_BAD_REQUEST;
  return ngx.exit(ngx.OK);
end

print(string.format("timestamp %s", ts));

local y, m, d, h, M, s, n = ts:match("^(.*)-(.*)-(.*)T(.*):(.*):(.*)%.(.*)Z$");
local time = os.time{year=y, month=m, day=d, hour=h, min=M, sec=s};
local currentTime = os.time(os.date("!*t"));
print(string.format("currentTime (%s), time (%s)", currentTime, time));

if currentTime - time > 60 * 60 then
  ngx.status = ngx.HTTP_BAD_REQUEST;
  ngx.say("ERROR: timestamp timeout");
  return ngx.exit(ngx.OK);
end

print("Timestamp OK");

-- mysql

local ok, err, errcode, sqlstate = db:connect{
	host = "192.168.65.2",
	port = 3306,
	database = "telemetry",
	user = "root",
	password = "hello",
	charset = "utf8",
	max_packet_size = 1024 * 1024,
}

if not ok then
	ngx.log(ngx.ERR, string.format("failed to connect: %s, : %s, %s", err, errcode, sqlstate));
  ngx.status = ngx.HTTP_INTERNAL_SERVER_ERROR;
  return ngx.exit(ngx.OK);
end

-- add a key check

print("connected to mysql");

local osVersion = json["os_version"];
local locale = json["locale"];
local osTs = json["timestamp"]; -- TODO fix mariadb timestamp format
local freshInstall = tostring(json["fresh"]); -- boolean
local entryType = json["type"] == "poll" and "poll" or "error";
local currentVersion = json["current_version"];
local previousVersion = json["prev_version"];
local newInstall = previousVersion == "null" and "true" or "false";

local query = bind("INSERT INTO logs (os_version, locale, os_ts, fresh_install, entry_type, current_version, prev_version, new_install) values (?, ?, ?, ?, ?, ?, ?, ?)", osVersion, locale, osTs, freshInstall, entryType, currentVersion, previousVersion, newInstall);
local res, err, errcode, sqlstate = db:query(query);
if not res then
	ngx.log(ngx.ERR, string.format("bad result: %s : %s : %s", err, errcode, sqlstate))
  ngx.status = ngx.HTTP_INTERNAL_SERVER_ERROR;
  return ngx.exit(ngx.OK);
end

print(string.format("mysql insert id: %s", res.insert_id));

