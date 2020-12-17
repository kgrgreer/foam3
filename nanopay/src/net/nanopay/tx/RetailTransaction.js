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
  name: 'RetailTransaction',
  extends: 'net.nanopay.tx.DigitalTransaction',

  javaImports: [
    'foam.nanos.auth.User',
    'foam.nanos.notification.push.PushService',
    'foam.util.SafetyUtil',
    'java.util.HashMap',
    'java.util.Map'
  ],

  properties: [
    {
      documentation: `For retail purposes. Tip`,
      class: 'UnitValue',
      name: 'tip',
      label: 'Tip',
      visibility: 'RO',
      unitPropValueToString: async function(x, val, unitPropName) {
        var formattedAmount = val / 100;
        return '$' + x.addCommas(formattedAmount.toFixed(2));
      },
      tableCellFormatter: function(tip, X) {
        var formattedAmount = tip/100;
        this
          .start()
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
    },
    {
      class: 'UnitValue',
      name: 'total',
      visibility: 'RO',
      label: 'Total Amount',
      transient: true,
      expression: function(amount, tip) {
        return amount + tip;
      },
      javaGetter: `return getAmount() + getTip();`,
      unitPropValueToString: async function(x, val, unitPropName) {
        var formattedAmount = val / 100;
        return '$' + x.addCommas(formattedAmount.toFixed(2));
      },
      tableCellFormatter: function(total, X) {
        var formattedAmount = total / 100;
        var refund =
          (X.status == net.nanopay.tx.model.TransactionStatus.REFUNDED );

        this
          .start()
          .addClass(refund ? 'amount-Color-Red' : 'amount-Color-Green')
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
    },
    {
      documentation: 'messages/notes related to transactions for retail.',
      class: 'String',
      name: 'notes',
      label: 'Notes'
    },
    {
      documentation: `For retail purposes. DeviceId refers to the device used to display the QR code for this transaction.`,
      class: 'Reference',
      of: 'net.nanopay.retail.model.Device',
      name: 'deviceId',
      swiftType: 'Int?',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'challenge',
      visibility: 'RO',
      documentation: `Randomly generated challenge.
      Used as an identifier (along with payee/payer and amount and device id) for a retail trasnaction,
      used in the merchant app and is transfered to the mobile applications as a property of the QrCode.
      Can be moved to retail Transaction.`
    }
 ],
});
