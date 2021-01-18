Run 2 Mediator, 2 Node on same machine
NOTE: need at least 16Gbytes free - 4Gb x 4

/etc/hosts:
127.0.0.1       mediator1
127.0.0.1       mediator2
127.0.0.1       node1
127.0.0.1       node2

node:
./build.sh -uJcluster_2,mn -Nnode1 -W8200 -c [-j]
./build.sh -uJcluster_2,mn -Nnode2 -W8210 [-j]

mediator
./build.sh -uJcluster_2,mm -Nmediator1 -W8100 -Ctrue -c
./build.sh -uJcluster_2,mm -Nmediator2 -W8110 -Ctrue

mediator treviso
./build.sh -uJbr,treviso,treviso_dev,cluster_2,mm -Nmediator1 -W8100 -Ctrue -c
./build.sh -uJbr,treviso,treviso_dev,cluster_2,mm -Nmediator2 -W8110 -Ctrue

'User' interface at mediator1:8100 or mediator2:8110
'Admin' interface at localhost:8100 or localhost:8110
