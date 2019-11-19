foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'USBankAccount',
  extends: 'net.nanopay.bank.BankAccount',

  javaImports: [
    'foam.util.SafetyUtil',
    'java.util.regex.Pattern'
  ],

  documentation: 'US Bank account information.',

  constants: [
    {
      name: 'BRANCH_ID_PATTERN',
      type: 'Regex',
      javaValue: 'Pattern.compile("^[0-9]{9}$")'
    },
    {
      name: 'ACCOUNT_NUMBER_PATTERN',
      type: 'Regex',
      javaValue: 'Pattern.compile("^[0-9]{6,17}$")'
    }
  ],

  properties: [
    {
      name: 'country',
      value: 'US'
    },
    {
      name: 'flagImage',
      value: 'images/flags/us.png'
    },
    {
      name: 'branchId',
      label: 'Routing No.',
      visibility: 'FINAL',
      view: {
        class: 'foam.u2.tag.Input',
        placeholder: '123456789',
        maxLength: 9,
        onKey: true
      },
      preSet: function(o, n) {
        if ( n === '' ) return n;
        var reg = /^\d+$/;
        return reg.test(n) ? n : o;
      },
      validateObj: function(branchId) {
        var accNumberRegex = /^[0-9]{9}$/;

        if ( branchId === '' ) {
          return 'Routing number required.';
        } else if ( ! accNumberRegex.test(branchId) ) {
          return 'Invalid routing number.';
        }
      }
    },
    {
      name: 'accountNumber',
      validateObj: function(accountNumber) {
        var accNumberRegex = /^[0-9]{6,17}$/;

        if ( accountNumber === '' ) {
          return 'Please enter an account number.';
        } else if ( ! accNumberRegex.test(accountNumber) ) {
          return 'Account number must be between 6 and 17 digits long.';
        }
      }
    },
    {
      name: 'branch',
      //visibility: 'HIDDEN'
      label: 'Routing No.',
    },
    {
      name: 'institution',
      visibility: 'HIDDEN'
    },
    {
      name: 'institutionNumber',
      visibility: 'HIDDEN',
      value: 'US0000000'
    },
    {
      name: 'denomination',
      value: 'USD'
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'voidCheckImage',
      documentation: 'void check image for this bank account',
      view: {
        class: 'foam.nanos.dig.DigFileUploadView',
        data: this.voidCheckImage$,
        acceptFormat: 'image/png'
      },
    },
    {
      //REVIEW: Set by Plaid, not read
      class: 'String',
      name: 'wireRouting',
      documentation: 'The ACH wire routing number for the account, if available.'
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
        String branchId = this.getBranchId();
        String accountNumber = this.getAccountNumber();
        
        if ( SafetyUtil.isEmpty(branchId) ) {
          throw new IllegalStateException("Please enter a routing number.");
        }
        if ( ! BRANCH_ID_PATTERN.matcher(branchId).matches() ) {
          throw new IllegalStateException("Routing number must be 9 digits long.");
        }

        if ( SafetyUtil.isEmpty(accountNumber) ) {
          throw new IllegalStateException("Please enter an account number.");
        }
        if ( ! ACCOUNT_NUMBER_PATTERN.matcher(accountNumber).matches() ) {
          throw new IllegalStateException("Account number must be between 6 and 17 digits long.");
        }
      `
    },
    {
      name: 'getBankCode',
      type: 'String',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      javaCode: `
        return "";
      `
   },
 ]
});
