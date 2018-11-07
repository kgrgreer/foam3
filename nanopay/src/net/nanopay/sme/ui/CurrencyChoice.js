foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'CurrencyChoice',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'currencyDAO',
    'currentAccount',
    'stack'
  ],

  requires: [
    'foam.u2.View',
    'net.nanopay.model.Currency'
  ],

  exports: [
    'as data'
  ],

  css: `
    ^carrot {
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 5px solid black;
      display: inline-block;
      float: right;
      margin-top: 8px;
      margin-left: 5px;
    }
    ^ .net-nanopay-ui-ActionView-currencyChoice{
      background: none;
      width: max-content;
      cursor: pointer;
      margin-left: 5px;
    }
    ^ .foam-nanos-u2-navigation-TopNavigation-CurrencyChoiceView {
      align-items: center;
    }
    ^ .net-nanopay-ui-ActionView-currencyChoice > span{
      font-family: Roboto;
      font-size: 12px;
      font-weight: 300;
      margin-left: 5px;
    }
    ^ .popUpDropDown {
      z-index: 950;
      position: absolute;
      background: white;
      width: 85px;
      margin-top: 40px;
    }
    ^ .popUpDropDown > div {
      width: 100%;
      text-align: center;
      height: 25;
      padding-bottom: 5;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: #093649;
      line-height: 30px;    }
    ^ .foam-u2-PopupView {
      padding: 0 !important;
      z-index: 1000;
      width: 110px !important;
      background: white;
      opacity: 1;
      box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
    }
    ^ .popUpDropDown > div:hover{
      background-color: #59a5d5;
      color: white;
      cursor: pointer;
    }
    ^ .popUpDropDown::before {
      content: ' ';
      position: absolute;
      height: 0;
      width: 0;
      border: 8px solid transparent;
      border-bottom-color: white;
      -ms-transform: translate(110px, -16px);
      transform: translate(50px, -16px);
    }
    ^ .popUpDropDown > div {
      display: flex;
    }
    ^img{
      width: 27px;
      position: relative;
      top: 2px;
    }
    ^ .flag {
      width: 30px;
      height: 17.6px;
      object-fit: contain;
      margin-right: 12px;
      margin-top: 5px;
      margin-left: 5px;
    }
    ^background {
      bottom: 0;
      left: 0;
      opacity: 0.4;
      right: 0;
      top: 0;
      position: fixed;
      z-index: 850;
    }
  `,

  properties: [
    'isNorthAmerica',
    'optionsBtn_',
    {
      class: 'foam.dao.DAOProperty',
      name: 'filteredDAO',
      expression: function() {
        if ( this.isNorthAmerica ) {
          return this.currencyDAO.where(this.OR(
            this.EQ(this.Currency.COUNTRY, 'CA'),
            this.EQ(this.Currency.COUNTRY, 'US')
          ));
        }
        return this.currencyDAO;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.model.Currency',
      name: 'chosenCurrency',
      expression: function() {
        var self = this;

        this.filteredDAO.find(this.currentAccount.denomination)
          .then(function(currency) {
            self.chosenCurrency = currency;
          });
      },
      postSet: function() {
        this.data = this.chosenCurrency;
      }
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start('span', null, this.optionsBtn_$).end()
        .start(this.CURRENCY_CHOICE, {
          icon$: this.chosenCurrency$.dot('flagImage').map(function(v) {
            return v || ' ';
          }),
          label$: this.chosenCurrency$.dot('alphabeticCode'),
          showLabel: true
        })
          .start('div')
            .addClass(this.myClass('carrot'))
          .end()
        .end();
    }
  ],

  actions: [
    {
    name: 'currencyChoice',
    label: '',
    code: function() {
        var self = this;

        this.optionPopup_ = this.View.create({});

        this.optionPopup_ = this.optionPopup_
        .start('div')
          .addClass('popUpDropDown')
          .select(this.filteredDAO, function(currency) {
            if ( typeof currency.flagImage === 'string' ) {
              return this.E()
                .start('img').addClass(this.myClass('img'))
                    .attrs({ src: currency.flagImage })
                    .addClass('flag')
                .end()
                .add(currency.alphabeticCode)
                .on('click', function() {
                    self.chosenCurrency = currency;
                    self.optionPopup_.remove();
                });
            }
          })
        .end()
        .start()
          .addClass(this.myClass('background'))
          .on('click', () => {
            this.optionPopup_.remove();
          })
        .end();

        self.optionsBtn_.add(self.optionPopup_);
      }
    }
  ]
});
