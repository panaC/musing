
CONF=`pwd`/conf.d

echo $CONF

rm -rf `pwd`/logs/*


docker run \
  --rm \
  -v $CONF:/etc/nginx/conf.d \
  -v `pwd`/logs:/usr/local/openresty/nginx/logs \
  -v `pwd`/lua:/lua \
  -p 8080-8100:8080-8100 \
  openresty/openresty:alpine-fat # LuaRocks is included in the alpine-fat, centos, and xenial variants. It is excluded from alpine because it generally requires a build system and we want to keep that variant lean.
