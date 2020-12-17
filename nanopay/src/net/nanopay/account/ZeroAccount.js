/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
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
  package: 'net.nanopay.account',
  name: 'ZeroAccount',
  extends: 'net.nanopay.account.DigitalAccount',
  abstract: true,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.ServiceProvider',
    'foam.nanos.logger.Logger',
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          /**
           * Find User from zeroAccountUser mapping from which the ZeroAccount is associated.
           */
          static protected User zeroAccountUser(X x, ServiceProvider sp, String currency) {
            Logger logger   = (Logger) x.get("logger");

            StringBuilder id = new StringBuilder();
            id.append(sp.getId());
            id.append(".");
            if ( currency == null ) {
              currency = "*";
            }
            id.append(currency);
            ZeroAccountUserAssociation assoc = (ZeroAccountUserAssociation)((DAO) x.get("localZeroAccountUserAssociationDAO")).find_(x, id.toString());
            if ( assoc == null ) {
              if ( "*".equals(currency) ) {
                logger.error("Trust account user not found for ServiceProvider", sp, currency);
                throw new RuntimeException("Trust account not found for ServiceProvider "+sp.getId());
              }
              return zeroAccountUser(x, sp, "*");
            }

            return assoc.findUser(x);
          }
      `);
      }
    }
  ],

  methods: [
    {
      documentation: 'Trust account is the inverse of it\'s backing account, so is always negative',
      name: 'validateAmount',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'balance',
          type: 'net.nanopay.account.Balance'
        },
        {
          name: 'amount',
          type: 'Long'
        }
      ],
      javaCode: `
        long bal = balance == null ? 0L : balance.getBalance();
        if ( amount > 0 &&
             amount > -bal) {
          throw new RuntimeException("Invalid transfer, for: "+amount +" and "+ bal+  " "+ this.getClass().getSimpleName()+" account balance must remain <= 0. " + this.getClass().getSimpleName()+"."+getName());
        }
      `
    }
  ]

});
