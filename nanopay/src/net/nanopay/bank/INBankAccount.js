foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'INBankAccount',
  label: 'Indian Bank Account',
  extends: 'net.nanopay.bank.BankAccount',

  javaImports: [
    'foam.util.SafetyUtil',
    'java.util.regex.Pattern'
  ],

  documentation: 'Indian Bank account information.',

  constants: [
    {
      name: 'ACCOUNT_NUMBER_PATTERN',
      type: 'Regex',
      javaValue: 'Pattern.compile("^[0-9]{9,18}$")'
    }
  ],

  properties: [
     {
      name: 'country',
      value: 'IN',
      createMode: 'HIDDEN'
    },
    {
      name: 'flagImage',
      label: '',
      value: 'images/flags/india.png',
      createMode: 'HIDDEN'
    },
    {
      name: 'desc',
    },
    {
      name: 'denomination',
      value: 'INR'
    },
    { // REVIEW: remove
      name: 'institutionNumber',
      hidden: true
    },
    { // REVIEW: remove
      name: 'branchId',
      hidden: true
    },
    {
      name: 'accountRelationship',
      class: 'Reference',
      of: 'net.nanopay.tx.AccountRelationship',
      value: 'Employer/Employee',
      label: 'Relation to the contact',
      view: {
        class: 'foam.u2.view.ChoiceWithOtherView',
        choiceView: {
          class: 'foam.u2.view.ChoiceView',
          placeholder: 'Please select',
          choices: [
            'Employer/Employee',
            'Contractor',
            'Vendor/Client',
            'Other'
          ]
        },
        otherKey: 'Other'
      },
      section: 'accountDetails'
    },
    {
      name: 'accountNumber',
      label: 'International Bank Account No.',
      validateObj: function(accountNumber) {
        var accNumberRegex = /^[0-9]{9,18}$/;

        if ( accountNumber === '' ) {
          return 'Please enter an account number.';
        } else if ( ! accNumberRegex.test(accountNumber) ) {
          return 'Account number must be between 8 and 18 digits long.';
        }
      },
    }
  ],

  methods: [
    {
      name: 'validate',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        super.validate(x);
        validateAccountNumber();
      `
    },
    {
      name: 'validateAccountNumber',
      type: 'Void',
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
