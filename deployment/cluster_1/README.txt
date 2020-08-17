Run 1 Mediator, 1 Node, 1 Client on same instance - to test minimal network latency.

node:
./build.sh -uJcluster,cluster_1,mn -Nnode -W8090 -c

mediator
./build.sh -uJcluster,cluster_1,mm -c
# -DCLUSTER=true in shrc.custom

client
./build.sh -uJcluster,cluster_1 -Nclient -W8100 -Ctrue -c
