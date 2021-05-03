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
  package: 'net.nanopay.tx.creditengine',
  name: 'FeeRefund',
  extends: 'net.nanopay.tx.creditengine.FeeWaiver',

  documentation: `Gives a credit for each lineItem at the discount percentage specified, credit is deposited into the
  transaction destination account regardless of who was charged`,

  javaImports: [
    'foam.dao.DAO',
    'foam.util.SafetyUtil',
    'foam.nanos.logger.Logger',
    'java.util.ArrayList',
    'net.nanopay.tx.CreditLineItem',
    'net.nanopay.tx.FeeLineItem',
    'net.nanopay.tx.InvoicedFeeLineItem',
    'net.nanopay.tx.InvoicedCreditLineItem',
    'net.nanopay.ticket.RefundTicket',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.TransactionLineItem'
  ],

  implements: [
    'foam.nanos.auth.ServiceProviderAware'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.ticket.RefundTicket',
      name: 'ticket'
    },
    {
      class: 'Class',
      name: 'ofTxn',
      javaFactory: `
        return net.nanopay.tx.model.Transaction.getOwnClassInfo();
      `
    }
  ],

  methods: [
    {
      name: 'createLineItems',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 't',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
      if ( ! (t.getClassInfo() == this.getOfTxn()) ) {
        return null;
      }
      RefundTicket ticket = (RefundTicket) ((DAO) x.get("localTicketDAO")).find(getTicket());
      ArrayList<CreditLineItem> array = new ArrayList<CreditLineItem>();
      for ( TransactionLineItem lineItem : ticket.getFeeLineItemsSelected() ) {
        if (lineItem instanceof InvoicedFeeLineItem) {
          InvoicedCreditLineItem invoicedFeeRefund = new InvoicedCreditLineItem();
          invoicedFeeRefund.setSourceAccount(lineItem.getDestinationAccount());
          invoicedFeeRefund.setDestinationAccount(t.getDestinationAccount());
          invoicedFeeRefund.setCreditCurrency(lineItem.getCurrency());
          invoicedFeeRefund.setAmount(lineItem.getAmount());
          array.add(invoicedFeeRefund);
        } else if (lineItem instanceof FeeLineItem) {
          CreditLineItem feeRefund = new CreditLineItem();
          feeRefund.setCreditCurrency(lineItem.getCurrency());
          feeRefund.setSourceAccount(lineItem.getDestinationAccount());
          feeRefund.setDestinationAccount(t.getDestinationAccount());
          feeRefund.setAmount(lineItem.getAmount());
          array.add(feeRefund);
        }
      }
      t.addLineItems(array.toArray(new CreditLineItem[array.size()]));
      return t;
      `,
      documentation: 'Create a credit line items based on the lineItems'
    },
  ]
});
