foam.CLASS({
  package: 'net.nanopay.model',
  name: 'PadCapture',

  documentation: 'Captures the event when a bank has been PAD authorizated.',
  javaImports: [ 'java.util.Date' ],
  requires: [
    'foam.nanos.auth.Address',
  ],
  tableColumns: [
    'id', 'firstName', 'lastName', 'institutionNumber', 'branchId', 'accountNumber'
  ],
  properties: [
    {
      class: 'Long',
      name: 'id',
      tableWidth: 50,
      max: 999,
    },
    {
      class: 'DateTime',
      name: 'acceptanceTime',
      label: 'Time of Acceptance',
      documentation: 'Date and time bank authorized the request.',
      factory: function() {
        return new Date();
      },
      javaFactory: 'return new Date();',
    },
    {
      class: 'String',
      name: 'agree1',
      documentation: '1st part of agreement terms.',
    },
    {
      class: 'String',
      name: 'agree2',
      documentation: '2nd part of agreement terms.',
    },
    {
      class: 'String',
      name: 'agree3',
      documentation: '3rd part of agreement terms.',
    },
    {
      class: 'Long',
      name: 'userId',
      documentation: 'User associated to PAD capture.',
    },
    {
      class: 'String',
      name: 'firstName',
      documentation: 'First name of user associated to PAD  capture.',
    },
    {
      class: 'String',
      name: 'lastName',
      documentation: 'Last name of user associated to PAD capture.',
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      documentation: 'Address of user associated with PAD capture.',
      factory: function() {
        return this.Address.create();
      },
    },
    {
      class: 'String',
      name: 'institutionNumber',
      label: 'Institution No.',
      documentation: 'Institution associated with PAD capture.',
      validateObj: function(institutionNumber) {
        var instNumRegex = /^[0-9]{3}$/;

        if ( ! instNumRegex.test(institutionNumber) ) {
          return 'Invalid institution number.';
        }
      }
    },
    {
      class: 'String',
      name: 'branchId',
      label: 'Transit No.',
      documentation: 'Transit/Branch associated with PAD capture.',
      validateObj: function(transitNumber) {
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
      documentation: 'Account associated with PAD capture.',
      tableCellFormatter: function(str) {
        this.start()
          .add('***' + str.substring(str.length - 4, str.length));
      },
      validateObj: function(accountNumber) {
        var accNumberRegex = /^[0-9]{1,30}$/;

        if ( ! accNumberRegex.test(accountNumber) ) {
          return 'Invalid account number.';
        }
      }
    },
    {
      class: 'String',
      name: 'companyName',
      documentation: 'Company name associated with PAD capture.'
    }
  ]
});
