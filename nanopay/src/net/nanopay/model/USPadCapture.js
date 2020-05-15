foam.CLASS({
  package: 'net.nanopay.model',
  name: 'USPadCapture',
  documentation: 'Captures the event when a US bank has been PAD authorizated.',
  extends: 'net.nanopay.model.PadCapture',

  javaImports: ['java.util.Date'],

  requires: [
    'foam.nanos.auth.Address',
  ],

  messages: [
    { name: 'INVALID_ACCOUNT_NUMBER', message: 'Invalid account number.' },
    { name: 'INVALID_BRANCH', message: 'Invalid transit number.' }
  ],

  properties: [
    // Required for correct property order rendering. TODO: apply orders on subclassed instances.
    // in sectionViews
    'firstName',
    'lastName',
    'companyName',
    'address',
    {
      class: 'String',
      name: 'branchId',
      label: 'ACH Routing Number',
      documentation: 'Transit/Branch associated with PAD capture.',
      visibility: 'DISABLED',
      gridColumns: 6,
      validateObj: function(branchId) {
        var transNumRegex = /^[0-9]{5}$/;

        if ( ! transNumRegex.test(branchId) ) {
          return this.INVALID_BRANCH;
        }
      }
    },
    {
      class: 'String',
      name: 'accountNumber',
      label: 'ACH Account Number',
      documentation: 'Account associated with PAD capture.',
      visibility: 'DISABLED',
      validateObj: function(accountNumber) {
        var accNumberRegex = /^[0-9]{1,30}$/;

        if ( ! accNumberRegex.test(accountNumber) ) {
          return this.INVALID_ACCOUNT_NUMBER;
        }
      }
    },
    {
      class: 'net.nanopay.documents.AcceptanceDocumentProperty',
      name: 'authAgreementUS',
      documentation: 'Verifies if the user has authorized nanopay or afex to debit and credit accounts (US).',
      docName: 'pad_auth_usd',
      label: ''
    },
    {
      class: 'net.nanopay.documents.AcceptanceDocumentProperty',
      name: 'cancellationAgreementUS',
      documentation: 'Verifies user understanding of cancellation under pad agreement terms and AFEX (US).',
      docName: 'cancellation_agreement_afex',
      label: ''
    }
  ]
});
