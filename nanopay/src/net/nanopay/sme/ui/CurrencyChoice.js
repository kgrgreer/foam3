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
      width: 84px !important;
      cursor: pointer;
      margin-left: 5px;
    }
    ^ .net-nanopay-ui-ActionView-currencyChoice > span{
      color: #2b2b2b !important;
      font-family: lato !important;
      font-size: 12px;
      font-weight: 300;
      margin-left: 5px;
    }
    ^ .popUpDropDown {
      z-index: 950;
      position: relative;
      background: white;
      width: 90px !important;
      box-shadow: 0 24px 24px 0 rgba(0, 0, 0, 0.12), 0 0 24px 0 rgba(0, 0, 0, 0.15);
      border-radius: 3px;
      padding: 6px;
      margin-left: -6px;
    }
    ^ .popUpDropDown div {
      width: auto !important;
      text-align: center;
      height: auto;
      padding-bottom: 5;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: #093649;
      line-height: 30px;
      padding: 4px 12px;
      border-radius: 3px;
    }
    ^ .popUpDropDown div:hover {
      background: #604aff !important;
    }
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
      border-radius: 2px;
    }
    ^ .flag {
      width: 30px;
      height: 17.6px;
      object-fit: contain;
      margin-right: 12px;
      margin-top: 5px;
      margin-left: 0px;
      border-radius: 2px;
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
    ^ .net-nanopay-ui-ActionView.net-nanopay-ui-ActionView-currencyChoice img {
      border-radius: 2px !important;
    }
    ^ .net-nanopay-ui-ActionView.net-nanopay-ui-ActionView-currencyChoice:hover {
      background: transparent !important;
    }
    ^ .disabled {
      filter:grayscale(100%) opacity(60%);
      cursor: default;
    }
  `,

  properties: [
    'optionsBtn_',
    {
      Class: 'Boolean',
      name: 'isNorthAmerica',
      documentation: 'Only for payment between Canada and US'
    },
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
      },
      documentation: 'Only get the currency of Canada & US'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.model.Currency',
      name: 'chosenCurrency',
      postSet: function() {
        this.data = this.chosenCurrency;
      },
      documentation: 'The selected currency showing on the optionsBtn_'
    }
  ],

  methods: [
    function initE() {
      this.mode = this.mode == null ? foam.u2.DisplayMode.RW : this.mode;
      var denominationToFind = this.data ? this.data : this.currentAccount.denomination;
      // Get the default currency and set it as chosenCurrency
      this.filteredDAO.find(denominationToFind)
        .then((currency) => {
          this.chosenCurrency = currency;
        });

      this
        .addClass(this.myClass())
        .start(this.CURRENCY_CHOICE, {
          icon$: this.chosenCurrency$.dot('flagImage').map(function(v) {
            return v || ' ';
          }),
          label$: this.chosenCurrency$.dot('alphabeticCode')
        })
          .enableClass('disabled', this.mode$.map((mode) => mode === foam.u2.DisplayMode.DISABLED))
          .start('div')
            .addClass(this.myClass('carrot'))
          .end()
        .end()
        .start('span', null, this.optionsBtn_$).end();
    }
  ],

  actions: [
    {
    name: 'currencyChoice',
    label: ' ', // Whitespace is required
    isEnabled: function(mode) {
      return ! (mode === foam.u2.DisplayMode.DISABLED);
    },
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
