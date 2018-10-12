foam.CLASS({
    package: 'net.nanopay.bank',
    name: 'PKBankAccount',
    extends: 'net.nanopay.bank.BankAccount',
  
    javaImports: [
      'foam.util.SafetyUtil',
      'java.util.regex.Pattern'
    ],
  
    documentation: 'Pakistan Bank account information.',
  
    constants: [
      {
        name: 'NATIONAL_BANK_CODE_PATTERN',
        type: 'Pattern',
        value: 'Pattern.compile("^[0-9a-zA-Z]{4}$")'
      },
      {
        name: 'ACCOUNT_NUMBER_PATTERN',
        type: 'Pattern',
        value: 'Pattern.compile("^[0-9]{16}$")'
      }
    ],

    properties: [
        {
          class: 'String',
          name: 'nationalBankCode',
          label: 'National Bank Code'
        }
    ],
  
    methods: [
      {
        name: 'validate',
        args: [
          {
            name: 'x', javaType: 'foam.core.X'
          }
        ],
        javaReturns: 'void',
        javaThrows: ['IllegalStateException'],
        javaCode: `
          super.validate(x);
          validateAccountNumber();
        `
      },
      {
        name: 'validateNationalBankCode',
        javaReturns: 'void',
        javaThrows: ['IllegalStateException'],
        javaCode: `
        String nationalBankCode = this.getNationalBankCode();
  
        // is empty
        if ( SafetyUtil.isEmpty(nationalBankCode) ) {
          throw new IllegalStateException("Please enter a national bank code.");
        }
        if ( ! NATIONAL_BANK_CODE_PATTERN.matcher(nationalBankCode).matches() ) {
          throw new IllegalStateException("Please enter a valid national bank code.");
        }
        `
      },
      {
        name: 'validateAccountNumber',
        javaReturns: 'void',
        javaThrows: ['IllegalStateException'],
        javaCode: `
        String accountNumber = this.getAccountNumber();
  
        // is empty
        if ( SafetyUtil.isEmpty(accountNumber) ) {
          throw new IllegalStateException("Please enter an account number.");
        }
        if ( ! ACCOUNT_NUMBER_PATTERN.matcher(accountNumber).matches() ) {
          throw new IllegalStateException("Please enter a valid account number.");
        }
        `
      }
    ]
  });
  