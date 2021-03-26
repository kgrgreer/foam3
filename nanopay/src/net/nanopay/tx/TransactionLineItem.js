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

/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionLineItem',

  imports: [
    'currencyDAO'
  ],

  javaImports: [
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'foam.dao.DAO'
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      factory: function() {
        return foam.uuid.randomGUID();
      },
      javaFactory: `return java.util.UUID.randomUUID().toString();`,
      hidden: true,
      externalTransient: true
    },
    {
      documentation: 'Assigned when line items are added to a transaction. All lineitems add at the same time are assigned to the same group so line items can be shown together.  For example, FX rate, expiry, fee can be grouped in the output.',
      name: 'group',
      class: 'String',
      hidden: true,
      externalTransient: true
    },
    {
      name: 'sourceAccount',
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      hidden: true
    },
    {
      name: 'destinationAccount',
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      hidden: true
    },
    {
      documentation: 'By default, show Transaction Line Item class name - to distinguish sub-classes.',
      name: 'name',
      class: 'String',
      createVisibility: 'RO',
      readVisibility: 'RO',
      updateVisibility: 'RO',
      factory: function() {
        return this.cls_.name;
      },
      javaFactory: 'return getClass().getSimpleName();'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.LineItemType',
      name: 'type'
    },
    {
      name: 'note',
      class: 'String'
    },
    {
      name: 'amount',
      class: 'UnitValue',
      unitPropName: 'currency',
      view: { class: 'net.nanopay.liquidity.ui.LiquidCurrencyView' },
      unitPropValueToString: async function(x, val, unitPropName) {
        var unitProp = await x.currencyDAO.find(unitPropName);
        if ( unitProp )
          return unitProp.format(val);
        return val;
      },
      tableCellFormatter: function(value, obj) {
        obj.currencyDAO.find(obj.currency).then(function(c) {
          if ( c ) {
            this.add(c.format(value));
          }
        }.bind(this));
      },
    },
    {
      documentation: 'Used to format amount',
      name: 'currency',
      class: 'String',
      value: 'CAD',
      hidden: true
    },
    {
      name: 'reversable',
      label: 'Refundable',
      class: 'Boolean',
      createVisibility: 'RO',
      readVisibility: 'RO',
      updateVisibility: 'RO',
      value: true,
      view: { class: 'foam.u2.CheckBox', showLabel: false },
      externalTransient: true
    },
    {
      name: 'requiresUserInput',
      class: 'Boolean',
      value: false,
      hidden: true,
      externalTransient: true
    },
    {
      name: 'transaction',
      label: 'From Transaction',
      class: 'Reference',
      of: 'net.nanopay.tx.model.Transaction',
      visibility: 'HIDDEN',
      storageTransient: true,
      externalTransient: true
    },
    {
      name: 'quoteOnChange',
      class: 'Boolean',
      value: false,
      hidden: true,
      storageTransient: true,
      externalTransient: true
    }
  ],

  methods: [
    function toSummary() {
      return this.name;
    },
    {
      name: 'findFromChain',
      type: 'net.nanopay.tx.model.Transaction',
      args: [
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction'}
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
        if (txn.getId().equals(getTransaction()))
          return txn;
        Transaction [] txs = txn.getNext();
        for ( Transaction t : txs ) {
          Transaction tx = findFromChain(t);
          if ( tx != null ) return tx;
        }
        return null;
      `,
    },
    {
      name: 'validate',
      type: 'Void',
      javaCode: `
        // TODO/REVIEW : require access to parent Transaction lastModifiedTime
        // if ( getFxExpiry().getTime() < lastModifiedTime + some window ) {
        //   throw new RuntimeException("FX quote expired.");
        // }
      `
    },
    {
      name: 'deepClone',
      type: 'FObject',
      javaCode: 'return this;'
    },
    {
      name: 'showLineItem',
      code: function() {
        return true;
      }
    }
  ]
});
