foam.CLASS({
  package: 'net.nanopay.ui.topNavigation',
  name: 'CurrencyChoiceView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'accountDAO',
    'currencyDAO',
    'currentAccount',
    'stack',
    'transactionDAO',
    'userDAO',
    'user'
  ],

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.model.Currency',
    'foam.u2.PopupView',
  ],

  exports: [ 'as data' ],

  css: `
  ^carrot {
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid white;
    display: inline-block;
    float: right;
    margin-top: 7px;
    margin-left: 7px;
  }
  ^ .foam-u2-ActionView-currencyChoice{
    background: none !important;
    border: 0 !important;
    box-shadow: none !important;
    width: max-content;
    cursor: pointer;
    margin-right: 27px;
  }
  ^ .foam-nanos-u2-navigation-TopNavigation-CurrencyChoiceView {
    align-items: center;
  }
  ^ .foam-u2-ActionView-currencyChoice > span{
    font-family: Roboto;
    font-size: 16px;
    font-weight: 300;
    letter-spacing: 0.2px;
    color: #ffffff;
  }
  ^ .popUpDropDown > div {
    width: 100%;
    text-align: center;
    height: 25;
    padding-bottom: 5;
    font-size: 14px;
    font-weight: 300;
    letter-spacing: 0.2px;
    color: /*%BLACK%*/ #1e1f21;
    line-height: 30px;
  }
  ^ .foam-u2-PopupView {
    left: -40 !important;
    top: 51px !important;
    padding: 0 !important;
    z-index: 1000;
    width: 110px !important;
    background: white;
    opacity: 1;
    box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
  }
  ^ .popUpDropDown > div:hover{
    background-color: #1cc2b7;
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
  ^ .flag {
    width: 30px !important;
    height: 17.6px;
    object-fit: contain;
    padding-top: 6px;
    padding-left: 10px;
    margin-right: 23px;
  }
  ^ img {
    height: 17.6px !important;
    margin-right: 6;
    width: auto;
  }
  `,

  properties: [
    'optionsBtn_',
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.model.Currency',
      name: 'lastCurrency'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Currency',
      name: 'defaultCurrency',
      value: 'USD'
    }
  ],

  methods: [

    function initE() {
      this.updateCurrency();

      this
        .addClass(this.myClass())
        .tag('span', null, this.optionsBtn_$)
        .start(this.CURRENCY_CHOICE, {
          icon$: this.lastCurrency$.dot('flagImage').map(function(v) { return v || ' ';}),
          label$: this.lastCurrency$.dot('alphabeticCode')
        })
          .start('div')
            .addClass(this.myClass('carrot'))
          .end()
        .end();
    }
  ],

  listeners: [
    function updateCurrency() {
      var self = this;

      /**
       * TODO: Currently our storing the home denomination preferences, just need it 
       * to default to USD for Goldman, also added a hacky way to persist it via local storage
       * we will later on think of a better way to handle default user preferences
       */
      var storedHomeDenomination = localStorage.getItem('homeDenomination');
      var startingCurrency = storedHomeDenomination
                                ? storedHomeDenomination
                                : this.defaultCurrency;

      this.currencyDAO.find(startingCurrency).then(function(c) {
        self.lastCurrency = c;
        localStorage.setItem('homeDenomination', c.alphabeticCode);
      });
    }
  ],

  actions: [
    {
      name: 'currencyChoice',
      label: '',
      code: function() {
        var self = this;
        self.optionPopup_ = this.PopupView.create({
          width: 165,
          x: -137,
          y: 40
        }).on('click', function() {
          return self.optionPopup_.remove();
        });

        self.optionPopup_ = self.optionPopup_.start('div').addClass('popUpDropDown')
          .select(this.currencyDAO.where(
            this.TRUE), function(c) {
              if ( c.flagImage != null ) {
                return self.E()
                  .start('div').start('img')
                    .attrs({ src: c.flagImage })
                    .addClass('flag').end().add(c.alphabeticCode)
                    .on('click', function() {
                      self.lastCurrency = c;

                      // TODO: Figure out a better way to store user preferences
                      localStorage.setItem('homeDenomination', c.alphabeticCode);
                    });
              }
            })
          .end();
        self.optionsBtn_.add(self.optionPopup_);
      }
    }
  ]
});
