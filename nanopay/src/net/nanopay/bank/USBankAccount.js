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
    }
  ]
});
