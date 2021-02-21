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
  package: 'net.nanopay.invoice.ruler',
  name: 'InvoiceRequestTransactionRule',
  implements: ['foam.nanos.ruler.RuleAction'],

  documentation: `creates request transactions when the invoice has status submit`,

  javaImports: [
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'net.nanopay.contacts.PersonalContact',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.tx.model.Transaction',
  ],
  methods: [
    {
      name: 'applyAction',
      javaCode: ` 

        Invoice invoice = (Invoice) obj;
        Transaction requestTxn = new Transaction();
        DAO transactionDAO = (DAO) x.get("localTransactionDAO");
        DAO userDAO = (DAO) x.get("localUserDAO");
        User payee = (User) userDAO.find(invoice.getPayeeId());

        invoice.setProcessPaymentOnCreate(false);

        requestTxn.setSourceAccount(invoice.getAccount());
        requestTxn.setDestinationAccount(invoice.getDestinationAccount());
        requestTxn.setSourceCurrency(null);
        requestTxn.setDestinationCurrency(invoice.getDestinationCurrency());
        requestTxn.setPayerId(invoice.getPayerId());
        requestTxn.setPayeeId(invoice.getPayeeId());
        requestTxn.setDestinationAmount(invoice.getAmount());
        requestTxn.setInvoiceId(invoice.getId());

        if ( payee instanceof PersonalContact && SafetyUtil.isEmpty(invoice.getDestinationAccount()) ) {
          requestTxn.setDestinationAccount(((PersonalContact) payee).getBankAccount());
        }

        invoice.setRequestTransaction(requestTxn);
      `
    }
  ]
 });
