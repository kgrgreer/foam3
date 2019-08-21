foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'PurposeCode',
  documentation: 'Purpose code for Indian payments.',

  ids: ['code'],

  properties: [
    {
      class: 'Enum',
      of: 'net.nanopay.tx.PurposeGroup',
      name: 'group'
    },
    {
      class: 'String',
      name: 'code',
      validateObj: function(code) {
        var regex = /^[PS][0-9]{4}$/;
        if ( ! regex.test(code) ) {
          return 'Please enter a valid purpose code.';
        }
      }
    },
    {
      class: 'String',
      name: 'subPurposeCode',
      validateObj: function(subPurposeCode) {
        var regex = /^[PS][0-9]{5}$/;
        if ( ! regex.test(subPurposeCode) ) {
          return 'Please enter a valid sub purpose code.';
        }
      }
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'Boolean',
      name: 'send',
      documentation: 'Whether purpose code is used in sending / receiving payment'
    },
  ]
});
