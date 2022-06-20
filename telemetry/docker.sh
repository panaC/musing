
CONF=`pwd`/conf.d

echo $CONF

rm -rf `pwd`/logs/*


docker run \
  --name myresty \
  -v $CONF:/etc/nginx/conf.d \
  -v `pwd`/logs:/usr/local/openresty/nginx/logs \
  -v `pwd`/lua:/lua \
  -p 8080-8100:8080-8100 \
  -d \
  openresty/openresty:alpine-fat # LuaRocks is included in the alpine-fat, centos, and xenial variants. It is excluded from alpine because it generally requires a build system and we want to keep that variant lean.

docker exec myresty "bash" "-c" "opm get jkeys089/lua-resty-hmac"

docker exec myresty "bash" "-c" "opm list"

docker ps

#docker kill myresty
#docker rm myresty

curl -v http://localhost:8080

# https://github.com/openresty/lua-nginx-module#ngxreqread_body

curl -v -d '{"foobar": "hello"}' http://localhost:8081

# https://github.com/jkeys089/lua-resty-hmac
curl -v http://localhost:8082

