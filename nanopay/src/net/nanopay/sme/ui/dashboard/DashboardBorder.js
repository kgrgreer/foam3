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
