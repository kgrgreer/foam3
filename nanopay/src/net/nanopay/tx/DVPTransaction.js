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
  name: 'DVPTransaction',
  extends: 'net.nanopay.tx.SummaryTransaction',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'foam.dao.DAO'
  ],

  documentation: 'Used solely to present a summary of LineItems for Securities DVP Transactions',

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'sourcePaymentAccount',
      section: 'transactionInformation',
      order: 35,
      gridColumns: 6,
      required: true
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'destinationPaymentAccount',
      section: 'transactionInformation',
      order: 75,
      gridColumns: 6,
      required: true
    },
    {
      class: 'Long',
      name: 'paymentAmount',
      required: true,
      section: 'transactionInformation',
      order: 55,
      gridColumns: 6
    },
    {
      class: 'Long',
      name: 'destinationPaymentAmount',
      required: true,
      section: 'transactionInformation',
      order: 95,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'summary',
      createVisibility: 'HIDDEN',
      visibility: function(summary) {
        return summary ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      },
      transient: true,
      documentation: `
        Used to display a lot of information in a visually compact way in table
        views of Transactions.
      `,
      tableCellFormatter: function(_, obj) {
        this.add("Delivery Versus Payment Summary");
      },
      tableWidth: 250,
    },
    {
      class: 'UnitValue',
      name: 'destinationAmount',
      label: 'Destination Amount',
      help: `This is the amount to be transfered to payees account (destination account).`,
      view: function(_, X) {
        return {
          class: 'net.nanopay.tx.ui.UnitFormatDisplayView',
          linkAmount$: X.data.amount$,
          linkCurrency$: X.data.sourceCurrency$,
          currency$: X.data.destinationCurrency$,
          linked: true
        };
      },
      documentation: 'Amount in Receiver Currency',
      unitPropValueToString: async function(x, val, unitPropName) {
        var unitProp = await x.securitiesDAO.find(unitPropName);
        if ( unitProp )
          return unitProp.format(val);
        return val;
      },
      tableCellFormatter: function(value, obj) {
        obj.securitiesDAO.find(obj.destinationCurrency).then(function(s) {
          if ( s ) {
            this.add(s.format(value));
          } else {
            this.add(value);
          }
        }.bind(this));
      },
      javaToCSV: `
        DAO securitiesDAO = (DAO) x.get("securitiesDAO");
        String dstSecurity = ((Transaction)obj).getDestinationCurrency();
        net.nanopay.exchangeable.Security security = (net.nanopay.exchangeable.Security) securitiesDAO.find(dstSecurity);

        // Outputting two columns: "amount", "Currency"
        outputter.outputValue(security.format(get_(obj)));
        outputter.outputValue(dstSecurity);
      `,
      javaToCSVLabel: `
        // Outputting two columns: "amount", "Currency"
        outputter.outputValue("Destination Amount");
        outputter.outputValue("Destination Security");
      `
    }
  ],
  methods: [
    {
      name: 'addNext',
      args: [
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
        Transaction tx = this;
        Transaction [] t = tx.getNext();
        int size = (t != null) ? t.length : 0;
        Transaction [] t2 = new Transaction [size+1];
        System.arraycopy(t,0,t2,0,t.length);
        t2[t2.length-1] = txn;
        tx.setNext(t2);
      `
    }
  ]
});
