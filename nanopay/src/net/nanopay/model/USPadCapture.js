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
    { name: 'INVALID_ACCOUNT_NUMBER', message: 'Account number must be between 6 and 17 digits long' },
    { name: 'ACCOUNT_NUMBER_REQUIRED', message: 'Account number required' },
    { name: 'INVALID_BRANCH', message: 'Transit number must be 9 digits long' },
    { name: 'BRANCH_REQUIRED', message: 'Transit number required' }
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
        if ( branchId === '' ) return this.BRANCH_REQUIRED;

        var transNumRegex = /^[0-9]{9}$/;
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
        if ( accountNumber === '' ) return this.ACCOUNT_NUMBER_REQUIRED;

        var accNumberRegex = /^[0-9]{6,17}$/;
        if ( ! accNumberRegex.test(accountNumber) ) {
          return this.INVALID_ACCOUNT_NUMBER;
        }
      }
    },
    {
      class: 'StringArray',
      name: 'capabilityIds',
      section: 'capabilityInformation',
      factory: () => {
        return [
          "crunch.acceptance-document.us-pad-capture"
        ];
      }
    },
    {
      name: 'capablePayloads',
      visibility: 'HIDDEN',
    },
    {
      name: 'userCapabilityRequirements',
      visibility: 'HIDDEN'
    }
  ]
});
