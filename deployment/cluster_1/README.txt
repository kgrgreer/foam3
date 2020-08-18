Run 1 Mediator, 1 Node, 1 Client on same instance

node:
./build.sh -uJcluster,cluster_1,mn -Nnode -W8090 -c

mediator
./build.sh -uJcluster,cluster_1,mm -Nmediator -W8070 -Ctrue -c

client
./build.sh -uJcluster,cluster_1 -Nclient -W8100 -Ctrue -c

Run TransactionBenchmark (Transaction Creation Benchmark - runs against local DAO) on 'client'.  Set the invocation count to 1 from 10000.
