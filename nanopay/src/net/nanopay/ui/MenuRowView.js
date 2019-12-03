foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'MenuRowView',
  extends: 'foam.u2.View',

  documentation: 'A single row in a list of users.',

  css: `
    ^ {
      background: white;
      padding: 8px 16px;
      font-size: 16px;
      cursor: pointer;
    }
    ^:hover {
      background: /*%PRIMARY5%*/ #e5f1fc;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.menu.Menu',
      name: 'data'
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start()
          .add(this.data.label)
        .end();
    }
  ]
});
