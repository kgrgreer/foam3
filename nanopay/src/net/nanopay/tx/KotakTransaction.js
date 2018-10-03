/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'KotakTransaction',
  extends: 'net.nanopay.fx.FXTransaction',

  documentation: `Hold Kotak Bank specific properties`,

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.Transfer'
  ],

  properties: [

  ],

  methods: [
    {
      name: 'accept',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        }
      ],
      javaCode: `
      //Send message to Kotak

      `
    },
    {
      name: 'createTransfers',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        }
      ],
      javaReturns: 'Transfer[]',
      javaCode: `
      Transfer [] tr = new Transfer[] {};
      Account account = findSourceAccount(x);
      TrustAccount trustAccount = TrustAccount.find(x, account);

      if ( getStatus() == TransactionStatus.PENDING ) {
        Transfer transfer = new Transfer.Builder(x)
                              .setDescription(trustAccount.getName()+" Cash-Out")
                              .setAccount(trustAccount.getId())
                              .setAmount(getTotal())
                              .build();
        tr = new Transfer[] {
          transfer,
          new Transfer.Builder(x)
            .setDescription("Cash-Out")
            .setAccount(getSourceAccount())
            .setAmount(-getTotal())
            .build()
        };
      } else if ( getStatus() == TransactionStatus.DECLINED ) {
        Transfer transfer = new Transfer.Builder(x)
                              .setDescription(trustAccount.getName()+" Cash-Out DECLINED")
                              .setAccount(trustAccount.getId())
                              .setAmount(-getTotal())
                              .build();
        tr = new Transfer[] {
          transfer,
          new Transfer.Builder(x)
            .setDescription("Cash-Out DECLINED")
            .setAccount(getSourceAccount())
            .setAmount(getTotal())
            .build()
        };
      }

      add(tr);
      return getTransfers();
      `
    }
  ]
});
