foam.CLASS({
  package: 'net.nanopay.auth.ui',
  name: 'UserCitationView',
  extends: 'foam.u2.View',

  documentation: 'A single row in a list of users.',

  css: `
    ^ {
      background: white;
      padding: 8px 16px;
    }

    ^:hover {
      background: #f4f4f9;
      cursor: pointer;
    }

    ^row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
    }

    ^company {
      font-size: 12px;
      color: #424242;
    }

    ^name {
      color: #999;
      font-size: 10px;
    }

    ^email {
      color: #424242;
      font-size: 12px;
      margin-left: 8px;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'data',
      documentation: 'Set this to the user you want to display in this row.'
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('row'))
          .start()
            .start()
              .addClass(this.myClass('company'))
              .add(this.data.businessName || this.data.organization || '')
            .end()
            .start()
              .addClass(this.myClass('name'))
              .add(this.data.legalName)
            .end()
          .end()
          .start()
            .addClass(this.myClass('email'))
            .add(this.data.email)
          .end()
        .end();
    }
  ]
});
