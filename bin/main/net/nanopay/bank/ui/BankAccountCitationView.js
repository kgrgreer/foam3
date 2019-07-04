foam.CLASS({
  package: 'net.nanopay.bank.ui',
  name: 'BankAccountCitationView',
  extends: 'foam.u2.View',

  documentation: 'A single row in a list of bank accounts.',

  css: `
    ^ {
      background: white;
      padding: 8px 16px;
    }

    ^:hover {
      background: #f4f4f9;
      cursor: pointer;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.bank.BankAccount',
      name: 'data',
      documentation: `
        Set this to the bank account you want to display in this row.
      `
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .tag({
          class: 'net.nanopay.bank.ui.BankAccountSelectionView',
          data: this.data.id,
          fullObject: this.data
        });
    }
  ]
});
