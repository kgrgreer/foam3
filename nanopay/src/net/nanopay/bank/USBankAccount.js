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
      name: 'routingNumber',
      class: 'String',
      label: 'Routing #',
      validateObj: function(routingNumber) {
        var accNumberRegex = /^[0-9]{1,30}$/;

        if ( ! accNumberRegex.test(routingNumber) ) {
          return 'Invalid routing number.';
        }
      }
    }
  ]
});
