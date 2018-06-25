foam.CLASS({
  package: 'net.nanopay.tx.ui',
  name: 'CurrencyChoice',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'currencyDAO',
    'currentCurrency',
    'stack',
    'userDAO'
  ],

  requires: [
    'foam.u2.PopupView',
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
    margin-left: 7px;
  }
  ^ .net-nanopay-ui-ActionView-currencyChoice{
    background: none;
    width: max-content;
    cursor: pointer;
    margin-right: 27px;
    padding-bottom: 5;
  }
  ^ .foam-nanos-u2-navigation-TopNavigation-CurrencyChoiceView {
    align-items: center;
  }
  ^ .net-nanopay-ui-ActionView-currencyChoice > span{
    font-family: Roboto;
    font-size: 12px;
    position: relative;
    font-weight: 300;
    top: 4px;
    margin-left: 10px;
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
    line-height: 30px;
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
  ^ .net-nanopay-ui-ActionView-currencyChoice img{
    width: 27px;
    position: relative;
    top: 2px;
  }
  ^ .flag {
    width: 30px !important;
    height: 17.6px;
    object-fit: contain;
    padding-top: 6px;
    padding-left: 10px;
    margin-right: 23px;
  }
  `,

  properties: [
    'optionsBtn_',
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.model.Currency',
      name: 'currency',
      expression: function() {
        var self = this;
        this.currencyDAO.find(this.currentCurrency).then(function(c) {
          self.currency = c;
        });
      },
      postSet: function() {
        this.data = this.currency;
      }
    }
  ],

  methods: [

    function initE() {
      this
        .addClass(this.myClass())
        .start('span', null, this.optionsBtn_$).end()
        .start(this.CURRENCY_CHOICE,
          { icon$: this.currency$.dot('flagImage').map(function(v) {
                    return v || ' ';
                  }),
            label$: this.currency$.dot('alphabeticCode'),
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
        self.optionPopup_ = this.PopupView.create({
          width: 165,
          x: - 137,
          y: 40
        }).on('click', function() {
          return self.optionPopup_.remove();
        });

        self.optionPopup_ = self.optionPopup_.start('div')
        .addClass('popUpDropDown')
          .select(this.currencyDAO.where(
            this.EQ(this.Currency.ALPHABETIC_CODE, 'CAD')), function(cur) {
            if ( cur.flagImage != null ) {
              this.start('div').start('img')
              .attrs({ src: cur.flagImage })
              .addClass('flag').end().add(cur.alphabeticCode)
              .on('click', function() {
                self.currency = cur;
              });
            }
          })
          .end();
        self.optionsBtn_.add(self.optionPopup_);
      }
    }
  ]
});
