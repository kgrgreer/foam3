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
  package: 'net.nanopay.tx.ruler',
  name: 'LiquidTransactionalBlocks',

  documentation: 'blocks transactions between account types, set as ',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.ShadowAccount',
    'net.nanopay.account.SecuritiesAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.UnsupportedTransactionException'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      DAO accountDAO = (DAO) x.get("localAccountDAO");
      Transaction tx = (Transaction) obj;
      Account source = (Account) accountDAO.find(tx.getSourceAccount());
      Account dest = (Account) accountDAO.find(tx.getDestinationAccount());

      //TODO: these should be based on permissions set up within liquid.

      User user = ((Subject) x.get("subject")).getUser();
      if ( ! user.getGroup().equals("admin") ) {
        if ( ! ( source.getClass() == DigitalAccount.class || source.getClass() == SecuritiesAccount.class) ) {
          throw new UnsupportedTransactionException("Unable to send from non-digital account");
        }
      }
      else {
        if ( ! ( source.getClass() == DigitalAccount.class ||
                 source.getClass() == SecuritiesAccount.class ||
                 source.getClass() == ShadowAccount.class ) ) {
          throw new UnsupportedTransactionException("Unable to send from non-digital or non-shadow account");
        }
      }
      `
    }
  ]
});
