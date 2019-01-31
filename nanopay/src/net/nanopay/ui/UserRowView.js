foam.CLASS({
    package: 'net.nanopay.ui',
    name: 'UserRowView',
    extends: 'foam.u2.View',

    documentation: `The row view for a RichChoiceView for user to display id and legal name.`,

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
      'data',
    ],

    methods: [
      function initE() {
        return this
          .addClass(this.myClass())
          .start()
            .add(this.data.id + ' ' + this.data.legalName)
          .end();
      }
    ]
  });
