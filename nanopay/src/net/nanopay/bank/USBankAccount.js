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
    ['images/flags/us.png'],
    {
      name: 'country',
      value: 'US'
    },
    {
      name: 'branchId',
      label: 'Routing #',
      final: true,
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

        if ( ! accNumberRegex.test(branchId) ) {
          return 'Invalid routing number.';
        }
      }
    },
    {
      name: 'branch',
      //visibility: 'HIDDEN'
      label: 'Routing #',
    },
    {
      name: 'institution',
      visibility: 'HIDDEN'
    },
    {
      name: 'institutionNumber',
      visbility: 'HIDDEN',
      value: 'US0000000'
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
      //REVIEW: Set by Plaid, not read
      class: 'String',
      name: 'wireRouting',
      documentation: 'The ACH wire routing number for the account, if available.'
    }
  ]
});
