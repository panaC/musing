
curl -v http://localhost:8090
curl -H "Authorization: EDRLAB " -v http://localhost:8090
curl -H "Authorization: EDRLAB rocks" -v http://localhost:8090


curl -H "Authorization: EDRLAB 51bd39a65882f1871974db762428f0620a6996f7" -d '{"os_version":"my os version","locale":"fr","timestamp":"2022-06-21T21:22:59.201Z","fresh":true,"type":"poll","current_version":"1.2.3","prev_version":"0.1.2"}' -v http://localhost:8090
