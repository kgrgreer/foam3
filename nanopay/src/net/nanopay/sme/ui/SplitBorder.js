foam.CLASS({
    package: 'net.nanopay.sme.ui',
    name: 'SplitBorder',
    extends: 'foam.u2.Element',

    css: `
      ^ { 
        display: flex;
        width: 100%;
        height: 85%;
        margin: 5px;
      }
      ^ .left-block {
        /* NOTE: width: 100% would be 50% of screen */ 
        width: 70%; 
      }
      ^ .right-block {
        display: contents;
      }
      ^content { 
        margin: 4px; 
        padding: 6px; 
        background: white;
        width: 100%;
        width: -moz-available;
        width: -webkit-fill-available;
        width: fill-available;
        height: 100%;
      }
    `,

    properties: [
      'leftPanel',
      'rightPanel'
    ],

    methods: [
      function init() {
        this.start().addClass(this.myClass())
          .start().addClass('left-block')
            .start('div', null, this.leftPanel$)
                .addClass(this.myClass('content'))
            .end()
          .end()
          .start().addClass('right-block')
            .start('div', null, this.rightPanel$)
              .addClass(this.myClass('content'))
            .end()
          .end()
        .end();
      }
    ]
});
