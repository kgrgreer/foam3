foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'USBankAccount',
  extends: 'net.nanopay.bank.BankAccount',

  javaImports: [
    'foam.util.SafetyUtil',
    'java.util.regex.Pattern'
  ],

  documentation: 'US Bank account information.',

  properties: [
    ['country', 'images/flags/us.png'],
    {
      name: 'branchId',
      label: 'Routing #',
      validateObj: function(branchId) {
        var accNumberRegex = /^[0-9]{9}$/;

        if ( ! accNumberRegex.test(branchId) ) {
          return 'Invalid routing number.';
        }
      }
    },
    {
      name: 'denomination',
      value: 'USD'
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'voidCheckImage',
      documentation: 'void check image for this bank account'
    },
    {
      class: 'String',
      name: 'wireRouting',
      documentation: 'The ACH wire routing number for the account, if available.'
    }
  ]
});
