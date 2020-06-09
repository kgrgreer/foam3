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
  package: 'net.nanopay.sme.ui.dashboard',
  name: 'DashboardBorder',
  extends: 'foam.u2.Element',

  css: `
    ^ {
      max-width: 1024px;
      margin: auto;
      padding: 12px 24px 24px 24px;
    }
    ^ .two-column-grid {
      margin-top: 32px;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      flex-basis: 100%;
      justify-content: space-between;
    }
    ^ .left-column {
      width: 500px;
      grid-column-start: 1;
      grid-row-start: 1;
    }
    ^ .right-column {
      width: 500px;
      grid-column-start: 2;
      grid-row-start: 1;
    }
  `,

  properties: [
    'topButtons',
    'line',
    'leftTopPanel',
    'leftBottomPanel',
    'rightTopPanel',
    'rightBottomPanel'
  ],

  methods: [
    function init() {
      this
        .addClass(this.myClass())
        .tag('div', null, this.topButtons$)
        .tag('div', null, this.line$)
        .start()
          .addClass('two-column-grid')
          .start()
            .addClass('left-column')
            .tag('div', null, this.leftTopPanel$)
            .tag('div', null, this.leftBottomPanel$)
          .end()
          .start()
            .addClass('right-column')
            .tag('div', null, this.rightTopPanel$)
            .tag('div', null, this.rightBottomPanel$)
          .end()
        .end();
    }
  ]
});
