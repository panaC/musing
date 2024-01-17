
DAY="1"
P1V="54605"
P2V="55429"

echo "CPP"
clang -std=c++23 -Wall -Wextra -pedantic -lstdc++ day${DAY}.cpp
# DEBUG=1 ./a.out

p1=`./a.out 1 < in`
p2=`./a.out 2 < in`

source ../common.sh

echo "PYTHON"
p1=`python3 day${DAY}.py 1 < in`
p2=`python3 day${DAY}.py 2 < in`

source ../common.sh
