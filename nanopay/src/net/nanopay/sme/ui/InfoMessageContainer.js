foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'InfoMessageContainer',
  extends: 'foam.u2.View',

  css: `
    ^ {
      width: 504px;
      padding: 25px 15px;
      border-radius: 4px;
      border: solid 1px #604aff;
      background-color: #f5f4ff;
    }
    ^ img {
      margin-right: 15px;
    }
    ^ .info-message {
      display: inline-block;
      vertical-align: bottom;
    }
  `,

  properties: [
    {
      name: 'type'
    },
    {
      class: 'String',
      name: 'message'
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start()
          .tag({ class: 'foam.u2.tag.Image', data: 'images/ablii/information-small-purple.svg' })
          .start().addClass('info-message').add(this.message).end()
        .end();
    }
  ]
});
