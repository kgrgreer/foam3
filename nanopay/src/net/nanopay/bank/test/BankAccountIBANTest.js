/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.bank.test',
  name: 'BankAccountIBANTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BRBankAccount',
    'foam.core.ValidationException',
    'foam.nanos.logger.Logger'
  ],

  methods: [
    {
      name: 'setup',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      `
    },
    {
      name: 'teardown',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      `
    },
    {
      name: 'runTest',
      javaCode: `
      setup(x);
      try {
        BRBankAccount account = new BRBankAccount(x);
        account.setIban("BR9700360305000010009795493P1");
        test(true, "Valid IBAN");
        test("00360305".equals(account.getInstitutionNumber()), "BankCode parsed");
        test("00001".equals(account.getBranchId()), "Branch parsed");
        test("0009795493".equals(account.getAccountNumber()), "Account parsed");

        // TODO: not working as I expect.
        // try {
        //   // invalid - country mismatch
        //   account = new BRBankAccount(x);
        //   test( "BR".equals(account.getCountry()), "BRBankAccount is Country BR");
        //   account.setIban("CA9700360305000010009795493P1");
        //   test(false, "IBAN country mismatch not detected");
        // } catch (ValidationException e) {
        //   test(true, "IBAN country mismatch detected");
        // }
      } catch ( Exception e ) {
        ((foam.nanos.logger.Logger) x.get("logger")).error(e);
        test(false, e.getMessage());
      } finally {
        teardown(x);
      }
      `
    }
  ]
});
