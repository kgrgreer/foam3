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
  name: 'LoanAccount',
  extends: 'net.nanopay.account.Account',
  documentation: 'Base class/model of all LoanAccounts',

  requires: [
  'net.nanopay.account.LoanAccount',
  'net.nanopay.account.ZeroAccount',
  'net.nanopay.account.Account'
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  javaImports: [
    'net.nanopay.tx.InterestTransaction',
    'foam.dao.DAO',
    'foam.mlang.MLang'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      targetDAOKey: 'currencyDAO',
      name: 'denomination',
      documentation: 'The currency that this account stores.',
      tableWidth: 127,
      section: 'accountInformation',
      order: 3
    },
    {
      class: 'Double',
      name: 'rate',
      documentation: 'The interest rate for the loan'
    },
    {
      class: 'Long',
      name: 'principal',
      documentation: 'The maximum that can be borrowed',
      value: 0
    },
    {
      class: 'Long',
      name: 'accruedInterest',
      documentation: 'The amount of interest accumulated thus far',
      value: 0
    },
    {
      name: 'lenderAccount',
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      documentation: 'The account where the loan $ are lent from',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.accountDAO.where(
            X.data.AND(
              X.data.NOT(X.data.INSTANCE_OF(X.data.LoanAccount)),
              X.data.NOT(X.data.INSTANCE_OF(X.data.ZeroAccount))
            )
          ),
          placeholder: '--',
          objToChoice: function(lenderAccount) {
            return [lenderAccount.id, lenderAccount.name];
          }
        });
      }
    },
  ],
  methods:[
  {
    documentation: 'Allow Account to only go between -principal limit and 0',
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
      /* //Commented out to allow interest accumulation beyond the credit limit of the account.
      if ( (amount+bal) < -this.getPrincipal() ) {
        foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
        logger.debug(this, "amount", amount, "balance", bal);
        throw new RuntimeException("Cannot exceed credit limit in account " + this.getId());
      }
      */
      if ( amount+bal > 0 ) {
        foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
        logger.debug(this, "amount", amount, "balance", bal);
        throw new RuntimeException("Cannot over pay account " + this.getId());
      }
    `
  },
  {
    documentation: 'Add unapplied interest',
    name: 'addInterest',
    args: [
      {
        name: 'x',
        type: 'Context'
      },
      {
        name: 'amount',
        type: 'Long'
      }
    ],
    javaCode: `
      this.setAccruedInterest(amount+this.getAccruedInterest());
    `
  },
  {
    documentation: 'Add unapplied interest',
    name: 'compound',
    args: [
      {
        name: 'x',
        type: 'Context'
      },
    ],
    javaCode: `
      if ( this.getAccruedInterest() > 0 ) {
        LoanedTotalAccount globalLoanAccount = (LoanedTotalAccount) ((DAO) x.get("localAccountDAO")).find(
          MLang.AND(
            MLang.EQ(LoanedTotalAccount.DENOMINATION,this.getDenomination()),
            MLang.INSTANCE_OF(LoanedTotalAccount.class)
          )
        );

        if ( globalLoanAccount == null ) throw new RuntimeException(" LoanedTotalAccount not found!");
        InterestTransaction it = new InterestTransaction.Builder(x)
          .setSourceAccount(this.getId())
          .setDestinationAccount(globalLoanAccount.getId())
          .setAmount(this.getAccruedInterest())
          .build();
        ((DAO) x.get("transactionDAO")).put_(x,it);
        this.setAccruedInterest(0);
      }
    `
  },
  ]
})
