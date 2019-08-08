foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'ActionButton',
  extends: 'foam.u2.View',

  documentation: 'View for displaying buttons on the Partners page such as Filters and Sync',

  css: `
    ^ {
      font-family: Roboto;
      width: 75px;
      height: 40px;
      border-radius: 2px;
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      display: inline-block;
      cursor: pointer;
      margin-right: 5px;
    }
    ^ .button-image {
      padding-top: 10px;
      padding-bottom: 10px;
      padding-left: 5px;
      width: 20px;
      height: 20px;
      display: inline-block;
    }
    ^ .button-text {
      pointer-events: none;
      width: 31px;
      display: inline-block;
      font-family: 'Roboto';
      font-size: 11px;
      color: /*%BLACK%*/ #1e1f21;
      padding-left: 9px;
      font-weight: 300;
      line-height: 20px;
      position: relative;
      top: -16px;
    }
  `,

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
          .start({class:'foam.u2.tag.Image', data: this.data.image}).addClass('button-image').end()
          .start('h6').addClass('button-text').add(this.data.text).end()
    }
  ]
});
