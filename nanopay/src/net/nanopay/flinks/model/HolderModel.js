foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'HolderModel',

  documentation: 'model for Flinks account holder',

  properties: [
    {
      class: 'String',
      name: 'Name'
    },
    {
      // type: 'net.nanopay.flinks.model.AddressModel',
      // javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      // javaJSONParser: 'new foam.lib.json.FObjectParser(net.nanopay.flinks.model.AddressModel.class)',
      class: 'FObjectProperty',
      of: 'net.nanopay.flinks.model.AddressModel',
      name: 'Address'
    },
    {
      class: 'String',
      name: 'Email',
      validateObj: function(Email) {
        var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if ( ! emailRegex.test(Email) ) {
          return this.EmailError;
        }
      }
    },
    {
      class: 'String',
      name: 'PhoneNumber',
      validateObj: function(PhoneNumber) {
        var hasOkLength = PhoneNumber.length >= 10 && PhoneNumber.length <= 30;

        if ( ! PhoneNumber || ! hasOkLength ) {
          return this.PhoneError;
        }
      }
    }
  ],

  messages: [
    { name: 'EmailError', message: 'Invalid email address' },
    { name: 'PhoneError', message: 'Invalid phone number' }
  ]
});