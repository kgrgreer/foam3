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
  name: 'CourtesyCredit',
  extends: 'net.nanopay.tx.creditengine.CreditCodeAccount',

  documentation: `One time credit from a certain account for a certain amount. `,

  //maybe give this a life cycle and generate an approval or something

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.InvoicedCreditLineItem',
    'java.util.ArrayList',
    'foam.nanos.logger.Logger',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.CreditLineItem',
    'foam.util.SafetyUtil',
   'net.nanopay.tx.model.TransactionStatus',
    'foam.dao.DAO',
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
      documentation: 'Credit account that this code pulls funds from',
      section: 'accountInformation',
      order: 32,
      gridColumns: 6,
    },
    {
      class: 'String',
      name: 'desc',
      label: 'Reason For Courtesy Credit',
      documentation: 'purpose of credit, or note from agent.',
      section: 'accountInformation'
    },
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
      type: 'net.nanopay.tx.CreditLineItem[]',
      javaCode: `
        ArrayList<CreditLineItem> credits = new ArrayList<CreditLineItem>();
        if ( ! getInvoiced() ) {
          CreditLineItem credit = new CreditLineItem();
          credit.setAmount(getAmount());
          credit.setCreditCode(getId());
          credit.setName(getName());
          credit.setNote(getDesc());
          //credit.setFeeCurrency(t.getDenomination());
          credit.setSourceAccount(getCreditAccount());
          credit.setDestinationAccount(t.getDestinationAccount());
          credits.add(credit);
          return (CreditLineItem[]) credits.toArray(new CreditLineItem[credits.size()] );
        }
        InvoicedCreditLineItem invoiceCredit = new InvoicedCreditLineItem();
        invoiceCredit.setAmount(getAmount());
        invoiceCredit.setCreditCode(getId());
        invoiceCredit.setName(getName());
        invoiceCredit.setNote(getDesc());
        //credit.setFeeCurrency(t.getDenomination());
        invoiceCredit.setSourceAccount(getCreditAccount());
        invoiceCredit.setDestinationAccount(t.getDestinationAccount());
        credits.add(invoiceCredit);
        return (CreditLineItem[]) credits.toArray(new CreditLineItem[credits.size()] );
      `,
      documentation: 'Create a credit line item array based on the transaction as a whole'
    },
    {
      name: 'totalSaved',
      args: [
        {
          name: 't',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'Long',
      javaCode: `
        return getAmount();
      `,
      documentation: 'calculates how much this promo has saved on this transaction'
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
      documentation: 'When the courtesy credit is applied on final submission of transaction mark it as used'
    },

  ]
});
