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
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
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
        try {
          agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              Transaction tx = (Transaction) obj;
              User payer = tx.findSourceAccount(ruler.getX()).findOwner(ruler.getX());
              User payee = tx.findDestinationAccount(ruler.getX()).findOwner(ruler.getX());
              DowJonesCredentials creds = (DowJonesCredentials) ruler.getX().get("dowJonesCredentials");
              DowJonesService dowJones = (DowJonesService) ruler.getX().get("dowJonesService");
              if ( screenUser(x, payer, creds, dowJones) && screenUser(x, payee, creds, dowJones) ) {
                tx.setStatus(TransactionStatus.COMPLETED);
              } else {
                tx.setStatus(TransactionStatus.DECLINED);
              }
            }
          }, "Create screening for tx payer and payee rule");
        } catch (Exception e) {
          Logger logger = (Logger) x.get("logger");
          logger.error("ScreenUsersOnTransactionCreate Error: ", e);
        }
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
      DowJonesResponse response = dowJones.beneficialOwnerNameSearch(x, searchData1);
      return response.getResponseBody().getMatches().length == 0;
      `
    }
  ]
});