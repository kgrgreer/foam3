foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'INBankAccount',
  label: 'Indian Bank Account',
  extends: 'net.nanopay.bank.BankAccount',

  javaImports: [
    'foam.util.SafetyUtil',
    'java.util.regex.Pattern'
  ],

  imports: [
    'purposeCodeDAO'
  ],

  documentation: 'Indian Bank account information.',

  constants: [
    {
      name: 'ACCOUNT_NUMBER_PATTERN',
      type: 'Regex',
      javaValue: 'Pattern.compile("^[0-9]{1,20}$")'
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
      label: 'Relation to the contact',
      view: {
        class: 'foam.u2.view.ChoiceWithOtherView',
        choiceView: {
          class: 'foam.u2.view.ChoiceView',
          placeholder: '--',
          choices: [
            'Employer/Employee',
            'Contractor',
            'Vendor/Client',
            'Other'
          ]
        },
        otherKey: 'Other'
      },
      validateObj: function(accountRelationship) {
        if ( accountRelationship === '' ) {
          return 'Please specify your relation to the contact.';
        }
      },
      section: 'accountDetails'
    },
    {
      class: 'String',
      name: 'ifscCode',
      label: 'IFSC Code',
      validateObj: function(ifscCode) {
        var accNumberRegex = /^\w{1,11}$/;

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
      label: 'Bank Account No.',
      preSet: function(o, n) {
        return /^\d*$/.test(n) ? n : o;
      },
      validateObj: function(accountNumber) {
        var accNumberRegex = /^\w{1,20}$/;

        if ( accountNumber === '' ) {
          return 'Please enter an International Bank Account No.';
        } else if ( ! accNumberRegex.test(accountNumber) ) {
          return 'Indian Bank Account No cannot exceed 20 digits.';
        }
      },
    },
    {
      name: 'purposeCode',
      class: 'Reference',
      of: 'net.nanopay.tx.PurposeCode',
      label: 'Purpose of Transfer',
      section: 'accountDetails',
      validateObj: function(purposeCode) {
        if ( purposeCode === '' ) {
          return 'Please enter a Purpose of Transfer.';
        }
      },
      view: function(_, x) {
        return foam.u2.view.ChoiceWithOtherView.create({
          choiceView: foam.u2.view.ChoiceView.create({
            dao: x.purposeCodeDAO,
            placeholder: '--',
            objToChoice: function(purposeCode) {
              return [purposeCode.code, purposeCode.description];
            }
          }),
          otherKey: 'Other'
        });
      }
    },
    {
      class: 'String',
      name: 'beneAccountType',
      labe: 'Account Type',
      section: 'accountDetails',
      view: {
        class: 'foam.u2.view.ChoiceWithOtherView',
        choiceView: {
          class: 'foam.u2.view.ChoiceView',
          placeholder: '--',
          choices: [
            ['CHEQUING', 'Chequing'],
            ['SAVING', 'Savings']
          ]
        },
      },
      validateObj: function(beneAccountType) {
        if ( beneAccountType === '' ) {
          return 'Please enter a Account Type';
        }
      }
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
