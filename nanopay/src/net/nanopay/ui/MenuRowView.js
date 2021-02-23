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
  package: 'net.nanopay.ui',
  name: 'MenuRowView',
  extends: 'foam.u2.View',

  documentation: 'A single row in a list of users.',

  css: `
    ^ {
      background: white;
      padding: 8px 16px;
      font-size: 14px;
      cursor: pointer;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^:hover {
      background: /*%PRIMARY5%*/ #e5f1fc;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.menu.Menu',
      name: 'data'
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start()
          .add(this.data.label)
        .end();
    }
  ]
});
