foam.CLASS({
  package: 'net.nanopay.merchant.ui',
  name: 'KeyboardView',
  extends: 'foam.u2.View',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ .grid {
          width: 100%;
          display: table;
          position: fixed;
          bottom: 72px;
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

        @media only screen and (min-height: 0px) {
          ^ .cell {
            height: 50px;
          }
        }

        @media only screen and (min-height: 682px) {
          ^ .cell {
            height: 75px;
            font-size: 28px;
          }
        }

        @media only screen and (min-height: 768px) {
          ^ .cell {
            height: 125px;
            font-size: 32px;
          }
        }

        @media only screen and (min-height: 1024px) {
          ^ .cell {
            height: 150px;
            font-size: 42px;
          }
        }

        @media only screen and (min-height: 1366px) {
          ^ .cell {
            height: 175px;
            font-size: 56px;
          }
        }
      */}
    })
  ],

  properties: [
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
            .start().addClass('cell').add('00').on('click', this.onButtonPressed).end()
            .start().addClass('cell').add('0').on('click', this.onButtonPressed).end()
            .start().addClass('cell material-icons md-dark')
              .attrs({ 'aria-hidden': true })
              .add('backspace')
              .on('click', this.onButtonPressed)
            .end()
          .end()
        .end()
    }
  ]
});