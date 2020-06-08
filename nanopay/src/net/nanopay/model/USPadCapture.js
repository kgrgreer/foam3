/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
