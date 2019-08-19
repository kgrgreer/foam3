foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'PurposeCode',
  documentation: 'Purpose code in a Kotak transaction.',

  ids: ['code'],

  properties: [
    {
      class: 'String',
      name: 'code',
      validateObj: function(code) {
        var regex = /^P[0-9]{4}$/;
        if ( ! regex.test(code) ) {
          return 'Please enter a valid purpose code.';
        }
      }
    },
    {
      class: 'String',
      name: 'subPurposeCode',
      validateObj: function(subPurposeCode) {
        var regex = /^P[0-9]{5}$/;
        if ( ! regex.test(subPurposeCode) ) {
          return 'Please enter a valid sub purpose code.';
        }
      }
    },
    {
      class: 'String',
      name: 'description'
    }
  ]
});
