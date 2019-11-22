foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'CABankAccountSimplifiedDetailView',
  extends: 'foam.u2.detail.SectionedDetailView',

  implements: [
    'net.nanopay.bank.BankAccountSimplifiedDetailView'
  ],

   requires: [
    'net.nanopay.bank.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount'
  ],

  messages: [
    {
      name: 'ACCOUNT_NAME_PLACEHOLDER',
      message: 'ex. TD Bank, Bank of Montreal'
    },
  ],

  properties: [
    {
      name: 'voidChequeImage',
      class: 'String',
      label: '',
      value: 'images/Canada-Check@2x.png',
      visibility: 'RO',
      view: function(_, X) {
        return {
          class: 'foam.u2.tag.Image'
        };
      },
    },
    {
      name: 'propertyWhitelist',
      factory: function() {
        return [
          this.Account.ID,
          this.Account.NAME,
          this.Account.DESC,
          this.Account.COUNTRY,
          this.Account.FLAG_IMAGE,
          this.Account.DENOMINATION,
          this.CABankAccount.INSTITUTION_NUMBER,
          this.CABankAccount.BRANCH_ID,
          this.BankAccount.ACCOUNT_NUMBER,
          this.BankAccount.IS_DEFAULT
        ];
      }
    }
  ],

  methods: [
     function initE() {
      var self = this;

      this.addClass(this.myClass())
        .start({ class: 'foam.u2.tag.Image', data: self.voidChequeImage$ })
          .addClass('check-image')
        .end()
                .start()
                  .addClass('check-margin')
                  .addClass('flex')
                  .start()
                    .addClass('transit-container')
                    .start()
                      .addClass('field-label')
                      .add(self.BRANCH_ID.label)
                    .end()
                    .tag(self.BRANCH_ID)
                  .end()
                  .start()
                    .addClass('institution-container')
                    .start()
                      .addClass('field-label')
                      .add(self.INSTITUTION_NUMBER.label)
                    .end()
                    .tag(self.INSTITUTION_NUMBER)
                  .end()
                  .start()
                    .addClass('account-container')
                    .start()
                      .addClass('field-label')
                      .add(self.ACCOUNT_NUMBER.label)
                    .end()
                    .tag(self.ACCOUNT_NUMBER)
                  .end()
                .end()
                .start()
                  .start()
                    .addClass('field-label')
                    .add(self.NAME_LABEL)
                  .end()
                  .start(self.NAME)
                    .setAttribute('placeholder', this.ACCOUNT_NAME_PLACEHOLDER)
                  .end()
         .end();
    }
  ]
});
