Run 2 Mediator, 2 Node on same machine
NOTE: need at least 16Gbytes free - 4Gb x 4

/etc/hosts:
127.0.0.1       mediator1
127.0.0.1       node1

node:
./build.sh -uJcluster_1,mn -Nnode1 -W8200 -c [-j]

mediator
./build.sh -uJcluster_1,mm -Nmediator1 -W8100 -m -c

mediator treviso
./build.sh -uJbr,treviso,treviso_dev,cluster_1,mm -Nmediator1 -W8100 -m -c

'User' interface at mediator:8100
'Admin' interface at localhost:8100

NOTE: If rebuilding either node or mediator after the other, perform a clean build.

To drop journals - build the node with the -j
