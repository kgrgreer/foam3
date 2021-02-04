/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.partner.bepay.tx',
  name: 'ScreenUsersOnTransactionCreate',

  documentation: 'Dow Jones screening for payer and payee',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'net.nanopay.meter.compliance.dowJones.DowJonesCredentials',
    'net.nanopay.meter.compliance.dowJones.DowJonesResponse',
    'net.nanopay.meter.compliance.dowJones.DowJonesService',
    'net.nanopay.meter.compliance.dowJones.PersonNameSearchData',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          Transaction tx = (Transaction) obj;
          User payer = tx.findSourceAccount(x).findOwner(x);
          User payee = tx.findDestinationAccount(x).findOwner(x);
          DowJonesCredentials creds = (DowJonesCredentials) x.get("dowJonesCredentials");
          DowJonesService dowJones = (DowJonesService) x.get("dowJonesService");
          try {
            if ( screenUser(x, payer, creds, dowJones) && screenUser(x, payee, creds, dowJones) ) {
              tx.setStatus(TransactionStatus.COMPLETED);
            } else {
              String spid = tx.findSourceAccount(x).findOwner(x).getSpid();
              String group = spid + "-fraud-ops";
              ComplianceApprovalRequest approvalRequest = new ComplianceApprovalRequest.Builder(x)
                .setDaoKey("transactionDAO")
                .setServerDaoKey("localTransactionDAO")
                .setObjId(tx.getId())
                .setGroup(group)
                .setDescription(tx.getSummary())
                .setClassification("Compliance Transaction")
                .build();

              ((DAO) x.get("approvalRequestDAO")).put(approvalRequest);
            }
          } catch (Exception e) {
            Logger logger = (Logger) x.get("logger");
            logger.error("ScreenUsersOnTransactionCreate Error: ", e);
          }
        }
      }, "Create screening for tx payer and payee rule");
      `
    },
    {
      name: 'screenUser',
      type: 'Boolean',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'user', type: 'User' },
        { name: 'creds', type: 'DowJonesCredentials' },
        { name: 'dowJones', type: 'DowJonesService' }
      ],
      javaCode: `
      PersonNameSearchData searchData1 = new PersonNameSearchData.Builder(x)
        .setSearchId(user.getId())
        .setFirstName(user.getFirstName())
        .setSurName(user.getLastName())
        .build();
      DowJonesResponse response = dowJones.personNameSearch(x, searchData1);
      return response.getResponseBody().getMatches().length == 0;
      `
    }
  ]
});