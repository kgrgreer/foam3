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
  extends: 'net.nanopay.tx.creditengine.AbstractCreditCode',

  documentation: `One time credit from a certain account for a certain amount. `,

  //maybe give this a life cycle and generate an approval or something

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.CreditLineItem',
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
      name: 'used',
      class: 'Boolean',
    },
    {
      name: 'invoiced',
      class: 'Boolean',
      documentation: 'this indicates whether the credit is applied on this transaction, or if we credit during monthly billing'
    },
    {
      class: 'Long',
      name: 'amount',
      documentation: 'credit value',
      value: 0
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'creditAccount',
      documentation: 'credit value',
    },
    {
      class: 'String',
      name: 'note',
      documentation: 'purpose of credit, or note from agent.',
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
        if ( getInvoiced() ) {
          CreditLineItem credit = new CreditLineItem();
          credit.setAmount(getAmount());
          credit.setCreditCode(getId());
          credit.setName(getName());
          credit.setNote(getNote());
          //credit.setFeeCurrency(t.getDenomination());
          credit.setSourceAccount(getCreditAccount());
          credit.setDestinationAccount(t.getDestinationAccount());
          return credit;
        }
        InvoicedCreditLineItem invoiceCredit = new InvoicedCreditLineItem();
        invoiceCredit.setAmount(getAmount());
        invoiceCredit.setCreditCode(getId());
        invoiceCredit.setName(getName());
        invoiceCredit.setNote(getNote());
        //credit.setFeeCurrency(t.getDenomination());
        invoiceCredit.setSourceAccount(getCreditAccount());
        invoiceCredit.setDestinationAccount(t.getDestinationAccount());
        return invoiceCredit;
      `,
      documentation: 'Create a credit line item based on the transaction as a whole'
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
        setUsed(true);
        // do we want to add a link to transaction that consumed this? maybe not rn.
        try {
          ((DAO) x.get("localCreditCodeDAO")).put(this);
        }
        catch( Exception E ) {
          Logger logger = (Logger) x.get("logger");
          logger.error("Credit Code "+getName()+" with id "+getId()+" failed to consume on transaction "+t.getId()+ " with the following exception: "+E);
        }
      `,
      documentation: 'When the courtesy credit is applied on final submission of transaction mark it as used'
    },

  ]
});
