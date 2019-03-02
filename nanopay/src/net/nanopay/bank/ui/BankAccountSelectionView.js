foam.CLASS({
  package: 'net.nanopay.bank.ui',
  name: 'BankAccountSelectionView',
  extends: 'foam.u2.View',

  css: `
    ^container {
      display: flex;
      align-items: center;
    } 
    ^container img {
      margin-right: 8px;
      width: 24px;
    }
  `,

  messages: [
    {
      name: 'DEFAULT_LABEL',
      message: 'Choose from bank accounts'
    }
  ],

  properties: [
    {
      name: 'data'
    },
    {
      name: 'fullObject'
    }
  ],

  methods: [
    function initE() {
      return this
        .addClass(this.myClass())
        .callIfElse(
          this.data,
          function() {
            this.add(this.fullObject$.map((account) => {
              if ( account ) {
                return this.E()
                  .addClass(this.myClass('container'))
                  .start('img')
                    .attrs({ src: account.flagImage })
                  .end()
                  .add(`${account.name} ****${account.accountNumber.substring(account.accountNumber.length - 4)} - ${account.denomination}`);
              }
            }));
          },
          function() {
            this.add(this.DEFAULT_LABEL);
          }
        );
    }
  ]
});
