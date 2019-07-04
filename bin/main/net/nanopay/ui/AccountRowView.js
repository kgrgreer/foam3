foam.CLASS({
    package: 'net.nanopay.ui',
    name: 'AccountRowView',
    extends: 'foam.u2.View',

    documentation: `The row view for a RichChoiceView for account to display id, name and currency.`,

    css: `
      ^ {
        background: white;
        padding: 8px 16px;
        font-size: 12px;
        color: #424242;
      }
  
      ^:hover {
        background: #f4f4f9;
        cursor: pointer;
      }
    `,

    properties: [
      'data', 'fullObject', 'accountDAO'
    ],

    methods: [
      async function initE() {
      return this
        .addClass(this.myClass())
        .start()
          .add(display = this.data.id + ' ' + this.data.name + ' ' + this.data.denomination)
        .end();
      }
    ]
  });
