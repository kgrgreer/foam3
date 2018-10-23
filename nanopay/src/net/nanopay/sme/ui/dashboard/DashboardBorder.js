foam.CLASS({
  package: 'net.nanopay.sme.ui.dashboard',
  name: 'DashboardBorder',
  extends: 'foam.u2.Element',

  css: `
    ^ {
      display: grid;
      width: 1200px;
    }
    ^ .top-block {
      padding: 10px;
    }
    ^ .left-blockT {
      /* NOTE: width: 100% would be 50% of screen */
      //width: 100%; 
    }
    ^ .right-blockT {
      display: contents;
    }
    ^ .left-blockB {
      /* NOTE: width: 100% would be 50% of screen */
      //width: 100%; 
    }
    ^ .right-blockB {
      display: contents;
    }
    ^ .left-block {
      /* NOTE: width: 100% would be 50% of screen */
      //width: 100%; 
    }
    ^ .right-block {
      display: contents;
    }
    ^content {
      //background: white;
      //width: 100%;
      width: -moz-available;
      width: -webkit-fill-available;
      width: fill-available;
      // height: 100%;
      // position: relative;
    }
  `,

  properties: [
    'topButtons',
    'leftTopPanel',
    'leftBottomPanel',
    'rightTopPanel',
    'rightBottomPanel',
  ],

  methods: [
    function init() {
      this.addClass(this.myClass()).addClass('content')
        .start('span', null, this.topButtons$)
          .addClass('top-block')
        .end()
        .start().addClass('left-block')
          .start('div', null, this.leftTopPanel$)
            .addClass('left-blockT')
          .end()
          .start('div', null, this.leftBottomPanel$)
            .addClass('left-blockB')
          .end()
        .end()
        .start().addClass('right-block')
          .start('div', null, this.rightTopPanel$)
            .addClass('left-blockT')
          .end()
          .start('div', null, this.rightBottomPanel$)
            .addClass('left-blockB')
          .end()
        .end();
    }
  ]
});
