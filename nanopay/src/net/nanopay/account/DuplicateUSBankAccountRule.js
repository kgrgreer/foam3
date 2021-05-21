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
  name: 'DuplicateUSBankAccountRule',
  extends: 'net.nanopay.account.DuplicateEntryRule',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.ArraySink',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.model.Branch',
    'net.nanopay.payment.Institution',
    'java.util.List',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ'
  ],

  messages: [
    { name: 'ERROR_MESSAGE', message: 'A bank account with the same details already exists' }
  ],

  methods: [
    {
      name: 'cmd',
      javaCode: `
        BankAccount newAccount = (USBankAccount) nu;
        List<BankAccount> accounts = ((ArraySink) dao
          .where(
            EQ(BankAccount.DELETED, false)
          )
          .select(new ArraySink()))
          .getArray();
        
        for ( BankAccount account : accounts ) {
          Branch curBranch = account.findBranch(x);
          if ( curBranch == null ) continue;
          String curBranchId = curBranch.getBranchId();

          if ( curBranchId == newAccount.getBranchId() ) {
            throw new RuntimeException(ERROR_MESSAGE);
          }
        }
      `
    },
  ]
});
