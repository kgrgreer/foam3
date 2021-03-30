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
  package: 'net.nanopay.sme.ui',
  name: 'BusinessJunctionRowView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
    A single row in a list of businesses.
    It needs to pass in the user-business junction as data
  `,

  imports: [
    'businessDAO',
    'user'
  ],

  requires: [
    'foam.nanos.auth.AgentJunctionStatus',
    'net.nanopay.model.Business'
  ],

  css: `
    ^ {
      background: white;
      background-color: #ffffff;
      border-radius: 3px;
      box-shadow: 0 1px 1px 0 #dae1e9;
      box-sizing: border-box;
      border: solid 1px #e2e2e3;
      height: 78px;
      margin-bottom: 8px;
      padding: 0 24px;
    }
    ^:hover {
      cursor: pointer;
    }
    ^:hover ^select-icon {
      background: url(images/ablii/selectcompanyarrow-active.svg);
    }
    ^row {
      align-items: center;
      display: flex;
      justify-content: space-between;
    }
    ^business-name {
      font-size: 16px;
      font-weight: 800;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: normal;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^select-icon {
      background: url(images/ablii/selectcompanyarrow-resting.svg);
      height: 32px;
      width: 32px;
    }
    ^status {
      color: #f91c1c;
      margin-right: 27px;
      font-size: 11px;
    }
    ^status-dot {
      background-color: #f91c1c;
      margin-right: 6px;
      height: 4px;
      width: 4px;
      border-radius: 999px;
      margin-top: 1px;
    }
  `,

  messages: [
    { name: 'DISABLED', message: 'Disabled' }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.UserUserJunction',
      name: 'data',
      documentation: 'Set this to the business you want to display in this row.'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.model.Business',
      name: 'business'
    }
  ],

  methods: [
    function init() {
      this.businessDAO
      .find(this.data.targetId).then((business) => {
        this.business = business;
      });
    },

    function initE() {
      this.start()
        .addClass(this.myClass())
        .addClass(this.myClass('row'))
        .start('span')
          .addClass(this.myClass('business-name'))
          .add(this.slot(function(business) {
            return business ? business.toSummary() : '';
          }))
        .end()
        .start()
          .addClass(this.myClass('row'))
          .start()
            .addClass(this.myClass('row'))
            .show(this.data$.map((data) => {
              return data.status === this.AgentJunctionStatus.DISABLED;
            }))
            .start()
              .addClass(this.myClass('status-dot'))
            .end()
            .start()
              .addClass(this.myClass('status'))
              .add(this.DISABLED)
            .end()
          .end()
          .start()
            .addClass(this.myClass('select-icon'))
          .end()
        .end()
      .end();
    }
  ]
});
