foam.CLASS({
    package: 'net.nanopay.sme.ui',
    name: 'SplitBorder',
    extends: 'foam.u2.Element',

    css: `
      ^ {
        height: 100%;
        width: 100%;
      }
      ^ .left-block {
        float: left;
        height: 100%;
        width: calc(100% - 600px);
        display: inline-block;
        background: #f9f9f9;
      }
      ^ .right-block {
        float: right;
        width: 600px;
        display: inline-block;
        background: #fff;
        height: 100%;
        overflow-y: scroll;
      }
      ^content {
        width: 100%;
        width: -moz-available;
        width: -webkit-fill-available;
        width: fill-available;
        position: relative;
        padding-bottom: 40px;
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
