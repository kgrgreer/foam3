Run 2 Mediator, 2 Node on same machine
NOTE: need at least 16Gbytes free - 4Gb x 4

/etc/hosts:
127.0.0.1       mediator1
127.0.0.1       mediator2
127.0.0.1       node1
127.0.0.1       node2

node:
./build.sh -uJcluster,cluster_2,mn -Nnode1 -W8200 -c
./build.sh -uJcluster,cluster_2,mn -Nnode2 -W8210

mediator
./build.sh -uJcluster,cluster_2,mm -Nmediator1 -W8100 -Ctrue -c
./build.sh -uJcluster,cluster_2,mm -Nmediator2 -W8110 -Ctrue

mediator treviso
./build.sh -uJbr,treviso,treviso_dev,cluster,cluster_2,mm -Nmediator1 -W8100 -Ctrue -c
./build.sh -uJbr,treviso,treviso_dev,cluster,cluster_2,mm -Nmediator2 -W8110 -Ctrue

Instructions
You’ll notice the capability store is not working (issue 1), so go through
1. Sign up
2. Get Email Message token
3. Signing Officer Privileges
4. Approve the Approval Request
5. Complete your Signing Officer information
6. Approve the Approval Request
7. Register your Business
8. Add Contact
9. Add Bank Account
10. Enable International Payments
That’s as far as I can get.

Signup at mediator1:8080 or mediator2:8080
and login as admin@nanopay/adminAb1 on same instance to perform the Approval Requests and get Email signup token.
Regarding the email signup token, as admin find the email message, copy out the http.... url and paste it into the 'user' sign up site, then proceed.

NOTE:
EmailMessageDAO is not clustered.
