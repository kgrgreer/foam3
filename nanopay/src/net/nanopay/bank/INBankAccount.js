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
      javaValue: 'Pattern.compile("^[0-9]{8,20}$")'
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
      class: 'String',
      name: 'rbiLink',
      label: '',
      value: 'https://www.rbi.org.in/Scripts/IFSCMICRDetails.aspx',
      section: 'accountDetails',
      view: {
        class: 'net.nanopay.sme.ui.Link',
        data: this.value,
        text: 'Search for your Bank',
        isExternal: false
      },
    },
    {
      class: 'String',
      name: 'ifscCode',
      label: 'IFSC Code',
      validationPredicates: [
        {
          args: ['ifscCode'],
          predicateFactory: function(e) {
            return e.REG_EXP(net.nanopay.bank.INBankAccount.IFSC_CODE, /^\w{11}$/);
          },
          errorString: 'IFSC Code must be 11 digits long.'
        }
      ],
      section: 'accountDetails'
    },
    {
      class: 'String',
      name: 'beneAccountType',
      label: 'Account Type',
      section: 'accountDetails',
      view: {
        class: 'foam.u2.view.ChoiceView',
        placeholder: 'Please select',
        choices: [
          ['CURRENT', 'Current'],
          ['SAVING', 'Savings']
        ]
      },
      validationPredicates: [
        {
          args: ['beneAccountType'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.bank.INBankAccount.BENE_ACCOUNT_TYPE, '');
          },
          errorString: 'Please select an Account Type.'
        }
      ],
    },
    {
      name: 'accountNumber',
      label: 'Bank Account No.',
      preSet: function(o, n) {
        return /^\d*$/.test(n) ? n : o;
      },
      view: {
        class: 'foam.u2.view.StringView',
      },
      validateObj: function(accountNumber) {
        var accNumberRegex = /^\w{8,20}$/;

        if ( accountNumber === '' ) {
          return 'Please enter a Bank Account No.';
        } else if ( ! accNumberRegex.test(accountNumber) ) {
          return 'Indian Bank Account No must be between 8 and 20 digits.';
        }
      },
    },
    {
      name: 'accountRelationship',
      class: 'Reference',
      of: 'net.nanopay.tx.AccountRelationship',
      label: 'Relationship with the contact',
      view: {
        class: 'foam.u2.view.ChoiceWithOtherView',
        choiceView: {
          class: 'foam.u2.view.ChoiceView',
          placeholder: 'Please Select',
          choices: [
            'Employer/Employee',
            'Contractor',
            'Vendor/Client',
            'Other'
          ]
        },
        otherKey: 'Other'
      },
      validationPredicates: [
        {
          args: ['accountRelationship'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.bank.INBankAccount.ACCOUNT_RELATIONSHIP, '');
          },
          errorString: 'Please specify your Relationship with the contact.'
        }
      ],
      section: 'accountDetails'
    },
    {
      name: 'purposeCode',
      class: 'Reference',
      of: 'net.nanopay.tx.PurposeCode',
      label: 'Purpose of Transfer',
      section: 'accountDetails',
      validationPredicates: [
        {
          args: ['purposeCode'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.bank.INBankAccount.PURPOSE_CODE, '');
          },
          errorString: 'Please enter a Purpose of Transfer.'
        }
      ],
      view: function(_, x) {
        return foam.u2.view.ChoiceWithOtherView.create({
          choiceView: foam.u2.view.ChoiceView.create({
            dao: x.purposeCodeDAO,
            placeholder: 'Please select',
            objToChoice: function(purposeCode) {
              return [purposeCode.code, purposeCode.description];
            }
          }),
          otherKey: 'Other'
        });
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
