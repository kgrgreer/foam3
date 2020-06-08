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
  name: 'ETALineItem',
  extends: 'net.nanopay.tx.InfoLineItem',

  properties: [
    {
      documentation: 'The longest estimated time of arrival or completion of Transaction.  An Alterna CI, for example, has a 2 day ETA.',
      name: 'eta',
      label: 'ETA',
      class: 'Long',
      tableCellFormatter: function(eta, X) {
        var self = this;
        this
          .start()
          .add('$', self.formatTime(eta))
          .end();
      }
    }
  ]
});
