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
  package: 'net.nanopay.tx',
  name: 'InvoiceTransaction',
  extends: 'net.nanopay.tx.DigitalTransaction',

  javaImports: [
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.model.Transaction',
    'java.util.List',
    'java.util.ArrayList'
  ],

  requires: [
    'net.nanopay.tx.InfoLineItem'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'payable',
      documentation: 'Represents payable/receivable invoice. Receivable is default.'
    },
    {
      class: 'Double', // REVIEW
      // TODO: rename to percentComplete
      name: 'serviceCompleted',
      value: 100,
      javaValue: '100',
      documentation: 'Percentage of how much work was done.'
    },
    {
      class: 'Long',
      name: 'serviceId',
      documentation: 'Reference to service that is being paid'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'initialStatus',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;'
    },
    {
      name: 'statusChoices',
      hidden: true,
      documentation: 'Returns available statuses for each transaction depending on current status',
      factory: function() {
        if ( this.status == this.TransactionStatus.PENDING ) {
          return [
            'choose status',
            ['COMPLETED', 'COMPLETED']
          ];
        }
        return ['No status to choose'];
      }
    },
    {
      // REVIEW: why do we have total and amount?
      class: 'UnitValue',
      name: 'total',
      visibility: 'RO',
      label: 'Total Amount',
      transient: true,
      expression: function(amount) {
        var value = 0;
        for ( var i = 0; i < this.lineItems.length; i++ ) {
          if ( ! this.InfoLineItem.isInstance( this.lineItems[i] ) ) {
            value += this.lineItems[i].amount;
          }
        }
        value = value * this.serviceCompleted/100;
        return value;
      },
      javaGetter: `
        Long value = 0L;
        TransactionLineItem[] lineItems = getLineItems();
        for ( int i = 0; i < lineItems.length; i++ ) {
          TransactionLineItem lineItem = lineItems[i];
          if ( ! ( lineItem instanceof InfoLineItem ) ) {
            value += (Long) lineItem.getAmount();
          }
        }
        Double percent = getServiceCompleted()/100.0;
        return Math.round(value * percent);
      `,
      unitPropValueToString: async function(x, val, unitPropName) {
        var formattedAmount = val / 100;
        return '$' + x.addCommas(formattedAmount.toFixed(2));
      },
      tableCellFormatter: function(total, X) {
        var formattedAmount = total / 100;
        this
          .start()
          .addClass('amount-Color-Green')
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
    },
  ],

  methods: [
    {
      name: 'limitedCopyFrom',
      args: [
        {
          name: 'other',
          javaType: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
      super.limitedCopyFrom(other);
      setInvoiceId(other.getInvoiceId());
      setStatus(other.getStatus());
      setExternalData(other.getExternalData());
      setExternalInvoiceId(other.getExternalInvoiceId());
      if ( other instanceof InvoiceTransaction ) {
        setServiceCompleted(((InvoiceTransaction)other).getServiceCompleted());
      }
      `
    }
  ]
});
