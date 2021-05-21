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
    'foam.mlang.sink.Count',
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
        BankAccount account = (CABankAccount) nu;
        
        // Set institution number
        if ( SafetyUtil.isEmpty(account.getInstitutionNumber()) ) {
          Institution institution = account.findInstitution(x);

          // Skip match check since neither institution nor the institution number is set
          if ( institution == null ) 
            return;

          account.setInstitutionNumber(institution.getInstitutionNumber());
        }

        // Set branch id
        if ( SafetyUtil.isEmpty(account.getBranchId()) ) {
          Branch branch = account.findBranch(x);

          // Skip match check since neither the branch nor the branch id is set
          if ( branch == null )
            return;

          account.setBranchId(branch.getBranchId());
        }
        
        // different owner, accountNumber, and denomination should already be filtered from the dao
        Count count = (Count) dao
          .where(AND(
              EQ(BankAccount.DELETED, false),
              EQ(BankAccount.BRANCH_ID, account.getBranchId()),
              EQ(BankAccount.INSTITUTION_NUMBER, account.getInstitutionNumber())
            )
          )
          .select(new Count());
        if ( count.getValue() != 0 )
          throw new RuntimeException(ERROR_MESSAGE);
      `
    },
  ]
});
