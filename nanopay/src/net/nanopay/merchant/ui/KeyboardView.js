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
  package: 'net.nanopay.merchant.ui',
  name: 'KeyboardView',
  extends: 'foam.u2.View',

  css: `
    ^ .grid {
      width: 100%;
      display: table;
      position: fixed;
    }
    ^ .row {
      display: table-row;
    }
    ^ .cell {
      width: 33.333333%;
      width: calc(100% / 3);
      border-left: 1px solid #e5e5e5;
      border-bottom: 1px solid #e5e5e5;
      display: table-cell;
      background-color: #FFFFFF;
      color: #666666;
      vertical-align: middle;
      text-align: center;

      -o-transition:.1s;
      -ms-transition:.1s;
      -moz-transition:.1s;
      -webkit-transition:.1s;
      transition:.1s;
    }
    ^ .cell:active {
      background-color: #e5e5e5;
    }
    ^ .amount-next-wrapper {
      width: 100%;
      position: fixed;
      bottom: 0px;
    }
    ^ .amount-next-button {
      width: 100%;
      background-color: #26a96c;
    }

    @media only screen and (min-height: 568px) {
      ^ .grid {
        bottom: 50px;
      }
      ^ .cell {
        height: 50px;
      }
      .amount-next-button {
        height: 50px;
      }
    }

    @media only screen and (min-height: 667px) {
      ^ .grid {
        bottom: 75px;
      }
      ^ .cell {
        height: 75px;
        font-size: 28px;
      }
      .amount-next-button {
        height: 75px;
      }
    }

    @media only screen and (min-height: 768px) {
      ^ .grid {
        bottom: 75px;
      }
      ^ .cell {
        height: 100px;
        font-size: 32px;
      }
      .amount-next-button {
        height: 75px;
      }
    }

    @media only screen and (min-height: 1024px) {
      ^ .grid {
        bottom: 100px;
      }
      ^ .cell {
        height: 150px;
        font-size: 42px;
      }
      .amount-next-button {
        height: 100px;
        font-size: 32px;
      }
    }

    @media only screen and (min-height: 1366px) {
      ^ .grid {
        bottom: 150px;
      }
      ^ .cell {
        height: 175px;
        font-size: 56px;
      }
      .amount-next-button {
        height: 150px;
        font-size: 42px;
      }
    }
  `,

  properties: [
    'onButtonPressed',
    'onNextClicked',
    { class: 'Boolean', name: 'show00', value: true }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start().addClass('grid')
          .start().addClass('row')
            .start().addClass('cell').add('1').on('click', this.onButtonPressed).end()
            .start().addClass('cell').add('2').on('click', this.onButtonPressed).end()
            .start().addClass('cell').add('3').on('click', this.onButtonPressed).end()
          .end()
          .start().addClass('row')
            .start().addClass('cell').add('4').on('click', this.onButtonPressed).end()
            .start().addClass('cell').add('5').on('click', this.onButtonPressed).end()
            .start().addClass('cell').add('6').on('click', this.onButtonPressed).end()
          .end()
          .start().addClass('row')
            .start().addClass('cell').add('7').on('click', this.onButtonPressed).end()
            .start().addClass('cell').add('8').on('click', this.onButtonPressed).end()
            .start().addClass('cell').add('9').on('click', this.onButtonPressed).end()
          .end()
          .start().addClass('row')
            .start().addClass('cell').add(this.show00 ? '00' : '').on('click', this.show00 ? this.onButtonPressed : null).end()
            .start().addClass('cell').add('0').on('click', this.onButtonPressed).end()
            .start().addClass('cell').addClass('material-icons').addClass('md-dark')
              .attrs({ 'aria-hidden': true })
              .add('backspace')
              .on('click', this.onButtonPressed)
            .end()
          .end()
        .end()
        .start().addClass('amount-next-wrapper')
          .start('button').addClass('amount-next-button')
            .add('Next')
            .on('click', this.onNextClicked)
          .end()
        .end()
    }
  ]
});