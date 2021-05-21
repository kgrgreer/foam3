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
  package: 'net.nanopay.account',
  name: 'SecurityAccount',
  extends: 'net.nanopay.account.Account',

  documentation: 'The base model for storing all individual securities.',

  javaImports: [
    'foam.core.Currency',
    'foam.dao.DAO'    
  ],

  imports: [
    'securitiesDAO'
  ],

  searchColumns: [
    'name',
    'id',
    'denomination',
    'type'
  ],

  tableColumns: [
    'id',
    'name',
    'type',
    'denomination.name',
    'balance'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.exchangeable.Security',
      targetDAOKey: 'securitiesDAO',
      name: 'denomination',
      documentation: 'The security that this account stores.',
      tableWidth: 127,
      section: 'accountInformation',
      order: 3
    },
    {
      name: 'balance',
      label: 'Balance (local)',
      section: 'balanceInformation',
      documentation: 'A numeric value representing the available funds in the bank account.',
      storageTransient: true,
      visibility: 'RO',
      tableCellFormatter: function(value, obj, axiom) {
        var self = this;
        this.add(obj.slot(function(denomination) {
          return self.E().add(foam.core.PromiseSlot.create({
            promise: this.securitiesDAO.find(denomination).then((result) => {
              return self.E().add(result.format(value));
            })
          }));
        }))
      },
      tableWidth: 145
    }
  ],
  methods: [
  {
        name: 'validateAmount',
        documentation: `Allows a specific value to be used to perform a balance operation.
          For example: Trust accounts can be negative.`,
        args: [
          {
            name: 'x',
            type: 'Context'
          },
          {
            name: 'balance',
            type: 'net.nanopay.account.Balance'
          },
          {
            name: 'amount',

            type: 'Long'
          }
        ],
        javaCode: `
          long bal = balance == null ? 0L : balance.getBalance();
        `
      },
  ]

});
