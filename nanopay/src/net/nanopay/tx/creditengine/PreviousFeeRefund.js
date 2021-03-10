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
  package: 'net.nanopay.tx.creditengine',
  name: 'PreviousFeeRefund',
  extends: 'net.nanopay.tx.creditengine.AbstractCreditCodeAccount',

  documentation: `One time credit to refund fees`,

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.tx.ComplianceTransaction',
    'net.nanopay.tx.CreditLineItem',
    'net.nanopay.tx.InvoicedCreditLineItem',
    'net.nanopay.tx.SummaryTransaction'
  ],

  implements: [
    'foam.nanos.auth.ServiceProviderAware'
  ],

  properties: [
    {
      class: 'UnitValue',
      name: 'amount',
      label: 'Credit Value',
      documentation: 'credit value',
      section: 'accountInformation',
      value: 0,
      gridColumns: 6,
      order: 31
    },
    {
      name: 'invoiced',
      class: 'Boolean',
      label: 'Apply credit on monthly invoice?',
      documentation: 'this indicates whether the credit is applied on this transaction, or if we credit during monthly billing',
      section: 'accountInformation',
      order: 33,
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'creditAccount',
      label: 'Credit Source Account',
      section: 'accountInformation',
      order: 32,
      gridColumns: 6,
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'refundAccount',
      label: 'Credit destination Account',
      section: 'accountInformation',
      order: 32,
      gridColumns: 6,
    }
  ],

  methods: [
    {
      name: 'createOnTransaction',
      args: [
        {
          name: 't',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'net.nanopay.tx.CreditLineItem',
      javaCode: `
        if ( t instanceof SummaryTransaction
            || t instanceof ComplianceTransaction
            || t.getSourceAccount() != getRefundAccount() ) {
          return null;
        }

        if ( ! getInvoiced() ) {
          CreditLineItem credit = new CreditLineItem();
          credit.setAmount(getAmount());
          credit.setCreditCode(getId());
          credit.setName(getName());
          credit.setNote(getDesc());
          credit.setSourceAccount(getCreditAccount());
          credit.setDestinationAccount(getRefundAccount());
          return credit;
        }
        InvoicedCreditLineItem invoiceCredit = new InvoicedCreditLineItem();
        invoiceCredit.setAmount(getAmount());
        invoiceCredit.setCreditCode(getId());
        invoiceCredit.setName(getName());
        invoiceCredit.setNote(getDesc());
        invoiceCredit.setSourceAccount(getCreditAccount());
        invoiceCredit.setDestinationAccount(getRefundAccount());
        return invoiceCredit;
      `,
      documentation: 'Create a credit line item based on the transaction as a whole'
    },
    {
      name: 'consume',
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
      javaCode: `
        CreditCodeTransaction counter = new CreditCodeTransaction();
        counter.setAmount(-1);
        counter.setName("Counter Incrementation for " + this.getId());
        counter.setSourceAccount(this.getId());
        counter.setDestinationAccount(this.getId());
        ((DAO) x.get("localTransactionDAO")).put(counter);
      `,
      documentation: 'When the fee credit is applied on final submission of transaction mark it as used'
    },

  ]
});
