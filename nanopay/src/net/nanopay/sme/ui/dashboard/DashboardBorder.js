foam.CLASS({
  package: 'net.nanopay.sme.ui.dashboard',
  name: 'DashboardBorder',
  extends: 'foam.u2.Element',

  css: `
    ^ {
      display: grid;
      grid-template-areas:
      'header header'
      'leftT rightT'
      'leftB rightB';
      grid-gap: 30px;
      padding: 10px;
      text-align: left;
      width: 930px;
      font-size: 20px;
      margin: auto;
      
    }
    ^ .top-block {
      grid-area: header;
      margin: auto;
    }
    ^ .left-blockT {
      /* NOTE: width: 100% would be 50% of screen */
      grid-area: leftT;
      font-size: 18px;
    }
    ^ .right-blockT {
      grid-area: rightT;
      font-size: 18px;
    }
    ^ .title-left-bottom{
      font-size: 18px;
    }
    ^ .left-blockB {
      grid-area: leftB;
      font-size: 18px;
      overflow:scroll;
      height: 400px;
    }
    ^ .right-blockB {
      grid-area: rightB;
      font-size: 18px;
    }
  `,

  properties: [
    'topButtons',
    'leftTopPanel',
    'leftBottomPanel',
    'rightTopPanel',
    'rightBottomPanel',
    'leftBottomTitle'
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
          .start('div', null, this.leftBottomTitle$)
            .addClass('title-left-bottom')
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
