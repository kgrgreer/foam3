foam.CLASS({
  package: 'net.nanopay.model',
  name: 'CAPadCapture',
  documentation: 'Captures the event when a CA bank has been PAD authorizated.',
  extends: 'net.nanopay.model.PadCapture',

  javaImports: ['java.util.Date'],

  requires: [
    'foam.nanos.auth.Address',
  ],

  messages: [
    { name: 'INVALID_ACCOUNT_NUMBER', message: 'Invalid account number.' },
    { name: 'INVALID_INSTITUTION_NUMBER', message: 'Invalid institution number.' },
    { name: 'INVALID_TRANSIT_NUMBER', message: 'Invalid transit number.' }
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
      label: 'Transit No.',
      documentation: 'Transit/Branch associated with PAD capture.',
      visibility: 'DISABLED',
      gridColumns: 4,
      validateObj: function(branchId) {
        var transNumRegex = /^[0-9]{5}$/;

        if ( ! transNumRegex.test(branchId) ) {
          return this.INVALID_TRANSIT_NUMBER;
        }
      }
    },
    {
      class: 'String',
      name: 'institutionNumber',
      label: 'Inst No.',
      documentation: 'Institution associated with PAD capture.',
      visibility: 'DISABLED',
      gridColumns: 2,
      validateObj: function(institutionNumber) {
        var instNumRegex = /^[0-9]{3}$/;

        if ( ! instNumRegex.test(institutionNumber) ) {
          return this.INVALID_INSTITUTION_NUMBER;
        }
      }
    },
    {
      class: 'String',
      name: 'accountNumber',
      label: 'Account No.',
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
          return this.INVALID_ACCOUNT_NUMBER;
        }
      }
    },
    {
      class: 'net.nanopay.documents.AcceptanceDocumentProperty',
      name: 'authAgreement',
      documentation: 'Verifies if the user has authorized nanopay or afex to debit and credit accounts (CA).',
      docName: 'pad_auth_cad',
      label: ''
    },
    {
      class: 'net.nanopay.documents.AcceptanceDocumentProperty',
      name: 'recourseAgreement',
      documentation: 'Verifies user understanding of recourse and reimbursement of pad agreement.',
      docName: 'recourse_agreement',
      label: ''
    },
    {
      class: 'net.nanopay.documents.AcceptanceDocumentProperty',
      name: 'cancellationAgreement',
      documentation: 'Verifies user understanding of cancellation under pad agreement terms.',
      docName: 'cancellation_agreement',
      label: ''
    }
  ]
});
