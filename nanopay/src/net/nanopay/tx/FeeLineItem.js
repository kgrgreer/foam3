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
  name: 'FeeLineItem',
  extends: 'net.nanopay.tx.TransactionLineItem',

  properties: [
    {
      name: 'group',
      hidden: true
    },
    {
      name: 'type',
      hidden: true
    },
    {
      name: 'reversable',
      hidden: true
    },
    {
      class: 'FObjectProperty',
      of: 'foam.core.Currency',
      name: 'feeCurrency',
      hidden: true
    },
    {
      name: 'amount',
      view: function(_, x) {
        let amount = x.data.amount;
        if ( x.data.feeCurrency ) {
           amount = x.data.feeCurrency.format(x.data.amount);
        }
        return foam.u2.Element.create()
        .start()
          .add(amount)
        .end();
      }
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.tx.fee.Rate',
      name: 'rates'
    }
  ]
});
