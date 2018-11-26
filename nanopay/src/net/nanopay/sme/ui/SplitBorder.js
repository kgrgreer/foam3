foam.CLASS({
    package: 'net.nanopay.sme.ui',
    name: 'SplitBorder',
    extends: 'foam.u2.Element',

    css: `
      ^ {
        height: 100%;
        width: 100%;
        background: #fff;
      }
      ^ .left-block {
        float: left;
        height: 100%;
        width: 55%;
        display: inline-block;
        background: #fff;
        text-align: center;
      }
      ^ .right-block {
        float: right;
        width: 45%;
        display: inline-block;
        background: #fff;
        height: 100%;
      }
      ^content {
        width: 100%;
        width: -moz-available;
        width: -webkit-fill-available;
        width: fill-available;
        position: relative;
        padding-bottom: 40px;
      }
      ^ .wrapper {
        margin: auto;
        max-width: 1024px;
      }
    `,

    properties: [
      'leftPanel',
      'rightPanel'
    ],

    methods: [
      function init() {
        this.addClass(this.myClass())
        .start().addClass('wrapper')
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
