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
  name: 'CAPadCapture',
  documentation: 'Captures the event when a CA bank has been PAD authorizated.',
  extends: 'net.nanopay.model.PadCapture',

  javaImports: ['java.util.Date'],

  requires: [
    'foam.nanos.auth.Address',
    'net.nanopay.bank.BankAccount'
  ],

  messages: [
    { name: 'INVALID_ACCOUNT_NUMBER', message: 'Invalid account number' },
    { name: 'INVALID_INSTITUTION_NUMBER', message: 'Invalid institution number' },
    { name: 'INVALID_TRANSIT_NUMBER', message: 'Invalid transit number' }
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
      label: 'Transit',
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
      label: 'Institution',
      documentation: 'Institution associated with PAD capture.',
      visibility: 'DISABLED',
      gridColumns: 3,
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
      label: 'Account',
      documentation: 'Account associated with PAD capture.',
      visibility: 'DISABLED',
      gridColumns: 5,
      tableCellFormatter: function(str, obj) {
        this.start()
          .add(obj.BankAccount.mask(str));
      },
      validateObj: function(accountNumber) {
        var accNumberRegex = /^[0-9]{5,12}$/;

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
          "67d9a3c7-6243-4b80-a8a9-9fe0c05db6d0"
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
