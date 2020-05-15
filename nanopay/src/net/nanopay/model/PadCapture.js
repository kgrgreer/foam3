foam.CLASS({
  package: 'net.nanopay.model',
  name: 'PadCapture',
  documentation: 'Captures the event when a bank has been PAD authorizated.',

  javaImports: ['java.util.Date'],

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
      visibility: 'HIDDEN',
      tableWidth: 50
    },
    {
      class: 'DateTime',
      name: 'acceptanceTime',
      label: 'Time of Acceptance',
      documentation: 'Date and time bank authorized the request.',
      visibility: 'HIDDEN',
      factory: function() {
        return new Date();
      },
      javaFactory: 'return new Date();',
    },
    {
      class: 'String',
      name: 'country',
      documentation: 'Country of origin of bank account, determines agreements.',
      visibility: 'HIDDEN'
    },
    {
      class: 'Long',
      name: 'userId',
      visibility: 'HIDDEN',
      documentation: 'User associated to PAD capture.',
    },
    foam.nanos.auth.User.FIRST_NAME.copyFrom({
      gridColumns: 6
    }),
    foam.nanos.auth.User.LAST_NAME.copyFrom({
      gridColumns: 6
    }),
    {
      class: 'String',
      name: 'companyName',
      documentation: 'Company name associated with PAD capture.',
      visibility: 'DISABLED',
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      label: 'Business Address',
    },
    {
      class: 'String',
      name: 'accountNumber',
      label: 'Account Number',
      documentation: 'Account associated with PAD capture.',
      visibility: 'DISABLED',
      gridColumns: 6,
      maxLength: 12,
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
      class: 'net.nanopay.documents.AcceptanceDocumentProperty',
      name: 'verifyOwnership',
      documentation: 'Verifies user understanding of cancellation under pad agreement terms and AFEX (US).',
      docName: 'verify_ownership_account',
      label: ''
    },
    {
      name: 'agree1',
      visibility: 'HIDDEN'
    },
    {
      name: 'agree2',
      visibility: 'HIDDEN'
    },
    {
      name: 'agree3',
      visibility: 'HIDDEN'
    },
    // TODO: Migration script for terms and agreements, REMOVE agree(1,2..) after script
  ]
});
