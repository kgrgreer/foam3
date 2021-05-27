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
  package: 'net.nanopay.tx.billing',
  name: 'Bill',

  documentation: 'Bill object for Intuit Billing',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.ServiceProviderAware'
  ],

  imports: [
    'currencyDAO',
    'summaryTransactionDAO',
    'userDAO'
  ],

  tableColumns: [
    'originatingSummaryTransaction',
    'errorCode',
    'chargeToBusiness',
    'totalAmount',
    'chargeDate',
    'status'
  ],

  sections: [
    {
      name: 'billInformation'
    },
    {
      name: 'systemInformation',
      permissionRequired: true
    }
  ],

  messages: [
    { name: 'CHARGE', message: 'Charge' }
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      section: 'billInformation',
      order: 10,
      gridColumns: 6
    },
    {
      class: 'Reference',
      targetDAOKey: 'errorCodeDAO',
      name: 'errorCode',
      of: 'net.nanopay.integration.ErrorCode',
      documentation: 'Error code associated to transaction error',
      section: 'billInformation',
      order: 20,
      gridColumns: 6,
      tableWidth: 150,
      view: {
        class: 'foam.u2.view.ReferenceView'
      }
    },
    {
      class: 'FObjectArray',
      name: 'fees',
      of: 'net.nanopay.tx.billing.BillingFee',
      section: 'billInformation',
      order: 30
    },
    {
      class: 'UnitValue',
      name: 'totalAmount',
      documentation: 'Amount being charged',
      unitPropName: 'currency',
      unitPropValueToString: async function(x, val, unitPropName) {
        var unitProp = await x.currencyDAO.find(unitPropName);
        if ( unitProp )
          return unitProp.format(val);
        return val;
      },
      section: 'billInformation',
      order: 35,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'currency',
      documentation: 'Currency of amount being charged',
      section: 'billInformation',
      order: 36,
      gridColumns: 6
    },
    {
      class: 'net.nanopay.tx.model.TransactionReference',
      name: 'originatingTransaction',
      section: 'billInformation',
      order: 45,
      gridColumns: 6,
      readPermissionRequired: true
    },
    {
      class: 'String',
      name: 'externalId',
      section: 'billInformation',
      gridColumns: 6,
      order: 110
    },
    {
      class: 'Reference',
      targetDAOKey: 'businessDAO',
      name: 'chargeToBusiness',
      of: 'net.nanopay.model.Business',
      documentation: 'Business paying the fee',
      section: 'billInformation',
      order: 50,
      gridColumns: 6,
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(u) {
          if ( u && u.toSummary ) {
            this.add(u.toSummary());
          } else {
            this.add(value);
          }
        }.bind(this));
      },
      view: {
        class: 'foam.u2.view.ReferenceView'
      }
    },
    {
      class: 'Reference',
      targetDAOKey: 'userDAO',
      name: 'chargeToUser',
      of: 'foam.nanos.auth.User',
      documentation: 'User paying the fee',
      section: 'billInformation',
      order: 60,
      gridColumns: 6,
      readPermissionRequired: true,
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(u) {
          if ( u && u.toSummary ) {
            this.add(u.toSummary());
          } else {
            this.add(value);
          }
        }.bind(this));
      }
    },
    {
      class: 'Date',
      name: 'chargeDate',
      documentation: 'Calculated date of when the fees will be charged',
      section: 'billInformation',
      order: 70,
      gridColumns: 6,
      tableWidth: 150
    },
    {
      class: 'DateTime',
      name: 'created',
      visibility: 'RO',
      section: 'billInformation',
      order: 80,
      gridColumns: 6,
      tableWidth: 150
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      section: 'billInformation',
      order: 100,
      gridColumns: 6,
      tableWidth: 200
    },
    {
      class: 'Enum',
      of: 'net.nanopay.tx.ChargedTo',
      name: 'chargedTo',
      documentation: 'Determines if Payer or Payee is charged the fee',
      section: 'systemInformation',
      order: 10,
      gridColumns: 6
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid',
      section: 'systemInformation',
      order: 20,
      gridColumns: 6
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        return this.totalAmount && this.currency
          ? this.currencyDAO.find(this.currency).then(c => c ? c.format(this.totalAmount) + ' ' + this.CHARGE : this.totalAmount + ' ' + this.currency + ' ' + this.CHARGE)
          : this.CHARGE;
      }
    }
  ]
});
