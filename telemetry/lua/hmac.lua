local hmac = require "resty.hmac"

local hmac_sha1 = hmac:new("secret_key", hmac.ALGOS.SHA1)
if not hmac_sha1 then
	ngx.say("failed to create the hmac_sha1 object")
	return
end

local ok = hmac_sha1:update("he")
if not ok then
	ngx.say("failed to add data")
	return
end

ok = hmac_sha1:update("llo")
if not ok then
	ngx.say("failed to add data")
	return
end

local mac = hmac_sha1:final()  -- binary mac

local str = require "resty.string"
ngx.say("hmac_sha1: ", str.to_hex(mac))
-- output: "hmac_sha1: aee4b890b574ea8fa4f6a66aed96c3e590e5925a"

-- dont forget to reset after final!
if not hmac_sha1:reset() then
	ngx.say("failed to reset hmac_sha1")
	return
end

-- short version
ngx.say("hmac_sha1: ", hmac_sha1:final("world", true))
-- output: "hmac_sha1: 4e9538f1efbe565c522acfb72fce6092ea6b15e0"
