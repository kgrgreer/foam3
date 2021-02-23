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
  package: 'net.nanopay.auth.ui',
  name: 'UserCitationView',
  extends: 'foam.u2.View',

  documentation: 'A single row in a list of users.',

  css: `
    ^ {
      background: white;
      padding: 8px 16px;
    }

    ^:hover {
      background: #f4f4f9;
      cursor: pointer;
    }

    ^company {
      font-size: 12px;
      color: #424242;
    }

    ^name {
      color: #999;
      font-size: 10px;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'data',
      documentation: 'Set this to the user you want to display in this row.'
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start()
          .start()
            .addClass(this.myClass('company'))
            .add(this.data.toSummary())
          .end()
          .start()
            .addClass(this.myClass('name'))
            .add(this.data.legalName)
          .end()
        .end();
    }
  ]
});
