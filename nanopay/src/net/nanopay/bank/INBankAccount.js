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
      javaValue: 'Pattern.compile("^[0-9]{16,30}$")'
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
      class: 'String',
      name: 'ifscCode',
      label: 'IFSC Code',
      validateObj: function(ifscCode) {
        var accNumberRegex = /^\w{11}$/;

        if ( ifscCode === '' ) {
          return 'Please enter an IFSC Code.';
        } else if ( ! accNumberRegex.test(ifscCode) ) {
          return 'IFSC Code must be 11 digits long.';
        }
      },
      section: 'accountDetails'
    },
    {
      name: 'accountNumber',
      label: 'International Bank Account No.',
      preSet: function(o, n) {
        return /^\w*$/.test(n) ? n : o;
      },
      validateObj: function(accountNumber) {
        var accNumberRegex = /^\w{16,30}$/;

        if ( accountNumber === '' ) {
          return 'Please enter an International Bank Account No.';
        } else if ( ! accNumberRegex.test(accountNumber) ) {
          return 'International Bank Account No must be between 16 and 30 digits long.';
        }
      },
    },
    {
      name: 'purposeCode',
      class: 'Reference',
      of: 'net.nanopay.tx.PurposeCode',
      label: 'Purpose of Transfer',
      view: {
        class: 'foam.u2.view.ChoiceWithOtherView',
        choiceView: {
          class: 'foam.u2.view.ChoiceView',
          placeholder: 'Please select',
          choices: [
            'Payables for Products/Services',
            'Working Capital',
            'Bill Payments',
            'Intra Company bank transfers',
            'Government Fee and Taxes',
            'Other',
          ]
        },
        otherKey: 'Other'
      },
      section: 'accountDetails',
      validateObj: function(purposeCode) {
        if ( purposeCode === '' ) {
          return 'Please enter a Purpose of Transfer';
        }
      },
    },
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
