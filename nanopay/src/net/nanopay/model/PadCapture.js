foam.CLASS({
  package: 'net.nanopay.model',
  name: 'PadCapture',

  documentation: 'Captures the event when a bank has been PAD authorizated.',
  javaImports: [ 'java.util.Date' ],
  requires: [
    'foam.nanos.auth.Address',
  ],
  tableColumns: [
    'id', 'firstName', 'lastName', 'acceptanceTime', 'institutionNumber', 'transitNumber', 'accountNumber'
  ],
  properties: [
    {
      class: 'Long',
      name: 'id',
      max: 999,
    },
    {
      class: 'DateTime',
      name: 'acceptanceTime',
      label: 'Time of Acceptance',
      factory: function() { return new Date(); },
      javaFactory: 'return new Date();',
    },
    {
      class:'String',
      name: 'agree1',
    },
    {
      class:'String',
      name: 'agree2',
    },
    {
      class:'String',
      name: 'agree3',
    },
    {
      class:'Long',
      name: 'userId',
    },
    {
      class:'String',
      name: 'firstName',
    },
    {
      class:'String',
      name: 'lastName',
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      factory: function () { return this.Address.create(); },
      view: { class: 'foam.nanos.auth.AddressDetailView' }
    },
    {
      class: 'String',
      name: 'institutionNumber',
      label: 'Institution No.',
      validateObj: function (institutionNumber) {
        var instNumRegex = /^[0-9]{3}$/;

        if ( ! instNumRegex.test(institutionNumber) ) {
          return 'Invalid institution number.';
        }
      }
    },
    {
      class: 'String',
      name: 'transitNumber',
      label: 'Transit No.',
      validateObj: function (transitNumber) {
        var transNumRegex = /^[0-9]{5}$/;

        if ( ! transNumRegex.test(transitNumber) ) {
          return 'Invalid transit number.';
        }
      }
    },
    {
      class: 'String',
      name: 'accountNumber',
      label: 'Account No.',
      tableCellFormatter: function (str) {
        this.start()
          .add('***' + str.substring(str.length - 4, str.length))
      },
      validateObj: function (accountNumber) {
        var accNumberRegex = /^[0-9]{1,30}$/;

        if ( ! accNumberRegex.test(accountNumber) ) {
          return 'Invalid account number.';
        }
      }
    },
  ]
})