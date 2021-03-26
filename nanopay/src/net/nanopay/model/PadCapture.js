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
  name: 'PadCapture',
  documentation: 'Captures the event when a bank has been PAD authorizated.',

  implements: [
    'foam.nanos.crunch.lite.Capable'
  ],

  javaImports: ['java.util.Date'],

  requires: [
    'foam.nanos.auth.Address',
    'net.nanopay.bank.BankAccount'
  ],

  tableColumns: [
    'id', 'firstName', 'lastName', 'institutionNumber', 'branchId', 'accountNumber'
  ],

  properties: [
    // IDEA: model axiom inheritance
    ...(foam.nanos.crunch.lite.CapableObjectData
      .getOwnAxiomsByClass(foam.core.Property)
      .map(p => p.clone())),
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
      documentation: 'Account associated with PAD capture.',
      visibility: 'DISABLED',
      gridColumns: 6,
      tableCellFormatter: function(str, obj) {
        this.start()
          .add(obj.BankAccount.mask(str));
      },
      validateObj: function(accountNumber) {
        var accNumberRegex = /^[0-9]{1,30}$/;

        if ( ! accNumberRegex.test(accountNumber) ) {
          return 'Invalid account number.';
        }
      }
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
    {
      class: 'StringArray',
      name: 'capableRequirements',
      storageTransient: true,
      networkTransient: true,
      visibility: 'HIDDEN',
      documentation: `
        Capable object requirements, defined by a subclass of PadCapture.
      `
    },
    {
      class: 'StringArray',
      name: 'capabilityIds',
      visibility: 'HIDDEN',
    },
    {
      class: 'String',
      name: 'daoKey',
      visibility: 'HIDDEN',
    }
  ],

  methods: [
    ...(foam.nanos.crunch.lite.CapableObjectData
      .getOwnAxiomsByClass(foam.core.Method)
      .map(m => m.clone()))
  ]
});
