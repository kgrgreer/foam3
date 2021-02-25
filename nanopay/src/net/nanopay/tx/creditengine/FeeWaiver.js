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
  name: 'FeeWaiver',
  extends: 'net.nanopay.tx.creditengine.AbstractCreditCode',

  documentation: `give a credit for each fee id on the transaction at the discount percentage specified `,

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.CreditLineItem',
    'java.util.ArrayList',
    'foam.nanos.logger.Logger',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.CreditLineItem',
    'foam.util.SafetyUtil',
    'foam.dao.DAO',
  ],

  implements: [
    'foam.nanos.auth.ServiceProviderAware'
  ],

  properties: [
    {
      name: 'usage',
      class: 'Long',
      value: 0
    },
    {
      class: 'StringArray',
      name: 'applicableFees'
    },
    {
      class: 'Double',
      name: 'discountPercent',
      documentation: '1 is treated as 100%, 0.5 as 50%',
      value: 0
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
      name: 'createOnFee',
      args: [
        {
          name: 'fli',
          type: 'net.nanopay.tx.FeeLineItem'
        }
      ],
      type: 'net.nanopay.tx.CreditLineItem',
      javaCode: `
        for ( String fee : getApplicableFees()) {
          if ( SafetyUtil.equals(fee, fli.getName())) {
            CreditLineItem cli = new CreditLineItem();
            cli.setCreditCode(getId());
            cli.setName(getName()+" credit for "+fli.getName());
            cli.setAmount((long) (getDiscountPercent() * fli.getAmount()) );
            cli.setDestinationAccount(fli.getSourceAccount());
            cli.setSourceAccount(fli.getDestinationAccount());
            return cli;
          }
        }
        return null;
      `,
      documentation: 'Create a credit line item based on a other credit line item'
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
        setUsage(getUsage()+1);
        // do we want to add a link to transaction that consumed this? maybe not rn.
        try {
          ((DAO) x.get("localCreditCodeDAO")).put(this);
        }
        catch( Exception E ) {
          Logger logger = (Logger) x.get("logger");
          logger.error("Credit Code "+getName()+" with id "+getId()+" failed to increment usage on Transaction "+t.getId()+ " with the following exception: "+E);
        }
      `,
      documentation: 'When the Credit code is consumed on final submission of transaction increment its usage count'
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
          setUsage(getUsage()-1);
          try {
            ((DAO) x.get("localCreditCodeDAO")).put(this);
          }
          catch( Exception E ) {
            Logger logger = (Logger) x.get("logger");
            logger.error("Credit Code "+getName()+" with id "+getId()+" failed to decrement usage on Cancelled of Transaction "+t.getId()+ " with the following exception: "+E);
          }
        }
      `,
      documentation: 'On a successful update to the transaction, '
    },
  ]
});
