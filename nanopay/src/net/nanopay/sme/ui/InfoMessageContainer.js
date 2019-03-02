foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'InfoMessageContainer',
  extends: 'foam.u2.View',

  css: `
    ^ {
      padding: 15px 25px;
      border-radius: 4px;
      color: #2e227f;
      border: solid 1px #604aff;
      background-color: #f5f4ff;
    }
    ^ img {
      margin-right: 15px;
    }
    ^ .info-message {
      font-size: 12px;
    }
    ^ .title-bold {
      font-weight: 600;
    }
    ^ .info-container {
      display: inline-block;
      width: 400px;
      vertical-align: middle;
    }
  `,

  properties: [
    {
      name: 'type'
    },
    {
      class: 'String',
      name: 'message'
    },
    {
      class: 'String',
      name: 'title'
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start()
          .tag({ class: 'foam.u2.tag.Image', data: 'images/information-small-purple.svg' })
          .start().addClass('info-container')
            .start().addClass('title-bold').add(this.title).end()
            .start().addClass('info-message').add(this.message).end()
          .end()
        .end();
    }
  ]
});
