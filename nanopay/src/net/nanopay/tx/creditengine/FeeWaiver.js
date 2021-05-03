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
  name: 'FeeWaiver',
  extends: 'net.nanopay.tx.creditengine.CreditCodeAccount',

  documentation: `give a credit for each fee id on the transaction at the discount percentage specified `,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.util.ArrayList',
    'net.nanopay.tx.CreditLineItem',
    'net.nanopay.tx.FeeLineItem',
    'net.nanopay.tx.InvoicedFeeLineItem',
    'net.nanopay.tx.InvoicedCreditLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.TransactionLineItem'
  ],

  implements: [
    'foam.nanos.auth.ServiceProviderAware'
  ],

  properties: [
    {
      class: 'Double',
      name: 'discountPercent',
      section: 'accountInformation',
      documentation: '1 is treated as 100%, 0.5 as 50%',
      value: 0,
      gridColumns: 6,
      order: 31,
    },
    {
      class: 'StringArray',
      name: 'applicableFees',
      label: 'Discount Will Apply To',
      section: 'accountInformation',
      order: 32,
      gridColumns: 12,
    }
  ],

  methods: [
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
        Long amount = 0l;
        for ( TransactionLineItem tli : t.getLineItems() ) {
          if ( tli instanceof CreditLineItem && SafetyUtil.equals(((CreditLineItem) tli ).getCreditCode(), getId()) ) {
            amount += ((CreditLineItem) tli).getAmount();
          }
        }
        return amount;
      `,
      documentation: 'calculates how much this promo has saved on this transaction'
    },
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
      ArrayList<CreditLineItem> credits = new ArrayList<CreditLineItem>();
      for (TransactionLineItem tli : t.getLineItems()) {
        if ( tli instanceof FeeLineItem) {
          FeeLineItem fli = (FeeLineItem) tli;
          for ( String fee : getApplicableFees()) {
            if ( SafetyUtil.equals(fee, fli.getName())) {
              if ( ! (fli instanceof InvoicedFeeLineItem) ) {
                CreditLineItem cli = new CreditLineItem();
                cli.setCreditCode(getId());
                cli.setName(getName()+" credit for "+fli.getName());
                cli.setAmount((long) (getDiscountPercent() * fli.getAmount()) );
                cli.setDestinationAccount(fli.getSourceAccount());
                cli.setSourceAccount(fli.getDestinationAccount());
                cli.setCreditCurrency(fli.getCurrency());
                credits.add(cli);
              }
              else {
                InvoicedCreditLineItem cli = new InvoicedCreditLineItem();
                cli.setCreditCode(getId());
                cli.setName(getName()+" credit for "+fli.getName());
                cli.setAmount((long) (getDiscountPercent() * fli.getAmount()) );
                cli.setDestinationAccount(fli.getSourceAccount());
                cli.setSourceAccount(fli.getDestinationAccount());
                cli.setCreditCurrency(fli.getCurrency());
                credits.add(cli);
              }
            }
          }
        }
      }
      t.addLineItems((CreditLineItem[]) credits.toArray(new CreditLineItem[credits.size()] ));
      return t;
      `,
      documentation: 'Create a credit line item for each matching fee on the transaction'
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
      documentation: 'When the Credit code is consumed on final submission of transaction increment its usage count',
      javaCode: `
        CreditCodeTransaction counter = new CreditCodeTransaction();
        counter.setAmount(-1);
        counter.setName("Counter Incrementation for " + this.getId());
        counter.setSourceAccount(this.getId());
        counter.setDestinationAccount(this.getId());
        ((DAO) x.get("localTransactionDAO")).put(counter);
      `
      },
    {
      name: 'onUpdate',
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
        if ( t.getStatus() == TransactionStatus.CANCELLED ) {
          CreditCodeTransaction counter = new CreditCodeTransaction();
          counter.setAmount(1);
          counter.setName("Counter Incrementation for " + this.getId());
          counter.setSourceAccount(this.getId());
          counter.setDestinationAccount(this.getId());
          ((DAO) x.get("localTransactionDAO")).put(counter);
        }
      `,
      documentation: 'On a successful update to the transaction, '
    }
  ]
});
