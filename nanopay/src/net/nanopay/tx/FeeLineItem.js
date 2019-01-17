/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'FeeLineItem',
  extends: 'net.nanopay.tx.TransactionLineItem',

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.account.Account',
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      name: 'feeAccount',
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      hidden: true
    },
    {
      name: 'reversable',
      label: 'Refundable',
      class: 'Boolean',
      visibility: 'RO',
      value: true
    },
    {
      name: 'sourcePaysFees',
      class: 'Boolean',
      hidden: true
    }
 ],

  methods: [
    {
      name: 'createTransfers',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'old',
          javaType: 'Transaction'
        },
        {
          name: 'nu',
          javaType: 'Transaction'
        },
        {
          name: 'reverse',
          javaType: 'Boolean'
        }
      ],
      javaReturns: 'net.nanopay.tx.Transfer[]',
      javaCode: `
        Long value = getAmount();
        if ( value == 0 ) {
           return new Transfer[0];
        }

        DAO accountDAO = (DAO) getX().get("localAccountDAO");

        Long debit = getSourcePaysFees() ? nu.getSourceAccount() : nu.getDestinationAccount();
        Long credit = getFeeAccount() != 0 ? getFeeAccount() : getSourcePaysFees() ?  nu.getDestinationAccount() : nu.getSourceAccount();

        if ( ! reverse ) {
          return new Transfer [] {
            new Transfer.Builder(x).setAccount(debit)
              .setAmount(-value).build(),
            new Transfer.Builder(x).setAccount(credit)
              .setAmount(value).build()
          };
        } else if ( getReversable() ) {
          return new Transfer [] {
            new Transfer.Builder(x).setAccount(credit)
              .setAmount(-value).build(),
            new Transfer.Builder(x).setAccount(debit)
              .setAmount(value).build()
          };
        } else {
           return new Transfer[0];
        }
      `
    },
    // {
    //   name: 'toString',
    //   javaReturns: 'String',
    //   javaCode: `
    //     StringBuilder sb = new StringBuilder();
    //     sb.append(this.getClass().getSimpleName());
    //     sb.append("(");
    //     sb.append("name: ");
    //     sb.append(getName());
    //     sb.append(", ");
    //     sb.append("note: ");
    //     sb.append(getNote());
    //     sb.append(", ");
    //     sb.append("amount: ");
    //     sb.append(getAmount());
    //     sb.append(")");
    //     return sb.toString();
    //   `
    // }
  ]
});
