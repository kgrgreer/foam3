foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'AbliiEmptyTopNavView',
  extends: 'foam.u2.View',

  css: `
  ^ {
    width: 100%;
    height: 64px;
    border-bottom: solid 1px #e2e2e3;
    margin: auto;
  }
  ^ img {
    height: 25px;
    margin-top: 20px;
    width: 100%;
  }
  `,

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start('img')
          .attr('src', 'images/ablii-wordmark.svg')
        .end()
      .end();
    }
  ]
});
