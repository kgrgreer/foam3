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
  name: 'EtaSummaryTransactionLineItem',
  extends: 'net.nanopay.tx.SummaryTransactionLineItem',

  imports: [
    'theme'
  ],

  javaImports: [
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'foam.dao.DAO'
  ],

  properties: [
    {
      class: 'Long',
      name: 'eta',
      label: 'Time',
      view: function(_, x) {
        let formatted = foam.core.Duration.duration(x.data.eta);
        return foam.u2.Element.create()
        .start()
          .add(formatted)
        .end();
      }
    },
    {
      name: 'expiry',
      hidden: true
    }
  ],

  messages: [
    { name: 'ETA_MESSAGE', message: 'Estimated time until payment is received' }
  ],

  methods: [
    function toSummary() {
      return this.ETA_MESSAGE;
    },
    {
      name: 'showLineItem',
      code: function() {
        if ( this.theme.appName === 'Treviso' ) {
          return false;
        }
        return true;
      }
    }
  ]

});
