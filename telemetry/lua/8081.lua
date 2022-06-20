local cjson = require "cjson"
ngx.status  = ngx.HTTP_OK

ngx.req.read_body();
local data = ngx.req.get_body_data();

local json = cjson.decode(data);
ngx.say(cjson.encode({ data = data, foobar = json.foobar }));
return ngx.exit(ngx.HTTP_OK)

--
--
-- > curl -d '{"foobar": "hello world"}' -s http://localhost:8081 | jq                                                                                                                                                                   
-- {
--   "data": "{\"foobar\": \"hello world\"}",
--     "foobar": "hello world"
--     }
