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
      padding: 0 2vw 15vh 2vw;
    }
    ^ .two-column-grid {
      margin: auto;
      margin-top: 32px;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      flex-basis: 100%;
      justify-content: space-between;
      width: 94%;
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
        .start().tag('div', null, this.topButtons$).end()
        .start().tag('div', null, this.line$).end()
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
