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
  name: 'DuplicateCABankAccountRule',
  extends: 'net.nanopay.account.DuplicateEntryRule',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.util.SafetyUtil',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
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
        BankAccount newAccount = (CABankAccount) nu;
        List<BankAccount> accounts = ((ArraySink) dao
          .where(
            EQ(BankAccount.DELETED, false)
          )
          .select(new ArraySink()))
          .getArray();
        
        // Set institution number for a new account if not set
        if ( SafetyUtil.isEmpty(newAccount.getInstitutionNumber()) ) {
          Institution institution = newAccount.findInstitution(x);
          // New account doesn't have both institution and institution number
          if ( institution == null ) return;
          newAccount.setInstitutionNumber(institution.getInstitutionNumber());
        }
        
        for ( BankAccount account : accounts ) {
          Branch curBranch = account.findBranch(x);
          if ( curBranch == null ) continue;
          String curBranchId = curBranch.getBranchId();

          Institution curInstitution = curBranch.findInstitution(x);
          if ( curInstitution == null ) continue;
          String curInstNumber = curInstitution.getInstitutionNumber();

          if ( curBranchId == newAccount.getBranchId() &&
               curInstNumber == newAccount.getInstitutionNumber()
          ) {
            throw new RuntimeException(ERROR_MESSAGE);
          }
        }
      `
    },
  ]
});
