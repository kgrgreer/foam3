foam.CLASS({
    package: 'net.nanopay.sme.ui',
    name: 'SplitBorder',
    extends: 'foam.u2.Element',

    css: `
      ^ {
        display: flex;
        width: 100%;
      }
      ^ .left-block {
        /* NOTE: width: 100% would be 50% of screen */
        width: 70%; 
      }
      ^ .right-block {
        display: contents;
      }
      ^content {
        background: white;
        width: 100%;
        width: -moz-available;
        width: -webkit-fill-available;
        width: fill-available;
        height: 100%;
        position: relative;
      }
    `,

    properties: [
      'leftPanel',
      'rightPanel'
    ],

    methods: [
      function init() {
        this.addClass(this.myClass())
          .start().addClass('left-block')
            .start('div', null, this.leftPanel$)
                .addClass(this.myClass('content'))
            .end()
          .end()
          .start().addClass('right-block')
            .start('div', null, this.rightPanel$)
              .addClass(this.myClass('content'))
            .end()
          .end();
      }
    ]
});
