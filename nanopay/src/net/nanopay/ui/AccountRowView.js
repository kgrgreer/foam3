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
    name: 'AccountRowView',
    extends: 'foam.u2.View',

    documentation: `The row view for a RichChoiceView for account to display id, name and currency.`,

    css: `
      ^ {
        background: white;
        padding: 8px 16px;
        font-size: 12px;
        color: #424242;
      }
  
      ^:hover {
        background: #f4f4f9;
        cursor: pointer;
      }
    `,

    properties: [
      'data', 'fullObject', 'accountDAO'
    ],

    methods: [
      async function initE() {
      return this
        .addClass(this.myClass())
        .start()
          .add(display = this.data.id + ' ' + this.data.name + ' ' + this.data.denomination)
        .end();
      }
    ]
  });
