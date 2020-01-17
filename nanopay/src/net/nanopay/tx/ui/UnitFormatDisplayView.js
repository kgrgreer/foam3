foam.CLASS({
  package: 'net.nanopay.tx.ui',
  name: 'UnitFormatDisplayView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
  This view has two PURPOSE:
  purpose 1: display this data in format conversion to linkAmount and currency choices,
  purpose 2: update relavent data with different data changes- only if not linked.
  CAUTION: do not try having two properties linked. This causes many issues. Possible but not flushed out and thus not currently possible.
  purpose 3: display the correct amount in disString for foam.u2.ControllerMode.VIEW

  EXAMPLE USAGE on a property:
  1) // used for cyclic-linking TWO properties - ie. destinationAmount - amount
  { 
    class: 'UnitValue',        <== - this property will NOT update
    name: 'destinationAmount',
    view: function(_, X) {
      return {
        class: 'net.nanopay.tx.ui.UnitFormatDisplayView',
        linkAmount$: X.data.amount$, <---------------------------------------
        linkCurrency$: X.data.sourceCurrency$,                              |
        currency$: X.data.destinationCurrency$,                             |
        linked: true                                                        |
      };                                                                    |
    },                                                                      |
    {                                                                    cyclic-link
      class: 'UnitValue',      <== - this property will update              |
      name: 'amount',              based on X.data.destinationAmount.       |
      view: function(_, X) {       - RO property                            |
        return {                                                            |
          class: 'net.nanopay.tx.ui.UnitFormatDisplayView',                 |
          linkAmount$: X.data.destinationAmount$, <--------------------------
          linkCurrency$: X.data.sourceCurrency$,
          currency$: X.data.destinationCurrency$
        };
      },
  }

  DATA CHANGES - occurs with the following action types:
  1) User updates - linkCurrency
  2) User updates - currency
  3) User updates - linkAmount (if not linked, if linked - it does not consider changes on linkAmount)
  4) User updates this input field - disDstAmount

  REQUIREMENT for this view:
  Must be given to this view:
  - linkAmount = which is the amount that data is based off
  - currency = which is used for rate look up in the exchangeRateService
  - linkCurrency = which is used for rate and currency formatting.
  ? linked (should be considered - default = false)

  Need and access from this view:
  - rate = use currency, linkCurrency and exchangeRateService
  - currencyObj_ = currencyDAO obj return from currency
  - linkCurrencyObj_ = currencyDAO obj return from linkCurrency

  FUNCTIONAL BOOLEANS - used to stop cyclic actions:
  Cause of issue: Because we use passed in slots for linked amounts, an update in this view
  to that property triggers the data on the linked property. Thus the use of the
  below mentioned properties.
  name: 'linked_',
  name: 'buildingModel_'

  NOTE:
  * displayString formats view based on locating part of curreny.format(amt)
  using this regEx = /[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?/g;
  Which to generalize is #,###.## format

  TODO:
  1 : fix visibilityExpression on disDstAmount - which currently does nothing, visibility works on property but need to toggle this based on linked(boolean)
  2 : consider a more elegant hack for balancing rates then what is set in the setRates()
  `,

  imports: [
    'currencyDAO',
    'exchangeRateService'
  ],

  messages: [
    { name: 'NO_RATE', message: 'using 1.0' }
  ],

  css: `
  ^ {
    display: flex;
    font-size: 1.3em;
    margin-top: 1vh;
  }

  ^ .spacing {
    padding-right: /*%INPUTVERTICALPADDING%*/ 6px;
    padding-left: /*%INPUTVERTICALPADDING%*/ 6px;
    margin-top: -0.5vh;
  }

  ^ .displayOnly {
    pointer-events: none;
    border: inset;
  }
  `,

  properties: [
    {
      class: 'String',
      name: 'linkCurrency',
      documentation: `Passed in value, determining value of linkAmount.`,
      postSet: function(_, n) {
       if ( ! this.buildingModel_ ) {
          this.currencyObjUpdate(n).then((c) => {
            this.linkCurrencyObj_ = c;
            this.setRates(n, this.currency)
              .then((_) => {
                this.updateData(this.currencyObj_.precision, n, this.currency)
                  .then((_) => this.updateDisplay())
                  .catch((e) => console.warn(`@postSet.linkCurrency updateData() error: ${e}`));
              })
              .catch((_) => {
                this.updateDisplay();
              });
          })
          .catch((e) => console.warn(`@postSet.linkCurrency currencyObjUpdate() error: ${e}`));
        }
      }
    },
    {
      class: 'String',
      name: 'currency',
      documentation: `Passed in value, determining value of data and disDstAmount.`,
      postSet: function(o, n) {
        if ( ! this.buildingModel_ ) {
          this.currencyObjUpdate(n).then((c) => {
            this.currencyObj_ = c;
            this.setRates(this.linkCurrency, n)
              .then((_) => {
                this.updateData(this.currencyObj_.precision, this.linkCurrency, n)
                  .then((_) => this.updateDisplay())
                  .catch((e) => console.warn(`@postSet.linkCurrency updateData() error: ${e}`));
              })
              .catch((_) => {
                this.updateDisplay();
              });
          })
          .catch((e) => console.warn(`@postSet.currency currencyObjUpdate() error: ${e}`));
        }
      }
    },
    {
      class: 'String',
      name: 'displayString',
      documentation: `Used because of limitation of Currency,
      which is that it only has Currency.format() - which is the function that determines this string.
      The strings are guaranteed short thus not considering re-writing Currency.format()`,
      postSet: function(_, n) {
        if ( ! n ) return;
        let reg = /[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?/g;
        let digMatch = n.match(reg);
        if ( digMatch && digMatch.length > 0 ) {
          let firstIndex = n.indexOf(digMatch[0]);
          let endIndex = digMatch[0].length + firstIndex;
          this.preString_ = n.substring(0, firstIndex);
          this.postString_ = n.substring(endIndex);
          if ( this.controllerMode === foam.u2.ControllerMode.VIEW ) this.disDstAmount = parseFloat(digMatch[0].replace(/,/g, ''));
        }
      }
    },
    {
      class: 'Long',
      name: 'linkAmount',
      documentation: `Passed in value, preferably slot. This properties linked amount.`,
      postSet: function(o, n) {
        if ( ! this.linked && ! this.buildingModel_ ) {
          this.updateData(this.currencyObj_.precision, this.linkCurrency, this.currency)
            .then((_) => this.updateDisplay())
            .catch((e) => console.warn(`@postSet.linkCurrency updateData() error: ${e}`));
        }
      }
    },
    {
      class: 'Float',
      name: 'disDstAmount',
      documentation: `disDstAmount is the amount displayed to the user of this view.
      Note 1: data = floor(disDstAmount * 10^prec)
      ex: disDstAmount = 2.88(float), systematially we store 288(long) and use currency.precision to determin user intended value.
      Note 2: If this prop is cyclic-linked with another this will then trigger a change in linked properties linkAmount.
              Since data here will be linkAmount in the cyclic-linked property.
      `,
      postSet: function(_, n) {
        if ( this.controllerMode === foam.u2.ControllerMode.VIEW ) return;
        this.data = ( n * Math.pow(10, this.currencyObj_.precision) ).toFixed(this.currencyObj_.precision);
      },
      visibilityExpression: function(linked) {
        // todo fix this and remove toggle in initE()
        return ! linked ? foam.u2.Visibility.RW : foam.u2.Visibility.DISABLED;
      }
    },
    {
      class: 'String',
      name: 'preString_',
      documentation: 'parsed from displayString - RO'
    },
    {
      class: 'String',
      name: 'postString_',
      documentation: 'parsed from displayString - RO'
    },
    {
      name: 'currencyObj_',
      documentation: `Found in this.process().`,
    },
    {
      name: 'linkCurrencyObj_',
      documentation: `Is of class: 'Currency' but because `
    },
    {
      class: 'Boolean',
      name: 'buildingModel_',
      documentation: `Need specific flow while initializing`,
      value: true
    },
    {
      class: 'Boolean',
      name: 'linked',
      documentation: `Determines the visibility mode of this.disDstAmount - user input field,
      and determines the data to update.`
    },
    'rate',
    'trueRate'
  ],
  methods: [
    function init() {
      this.SUPER();
      this.buildingModel_ = true;
      this.currencyObjUpdate(this.currency).then((c) => {
        this.currencyObj_ = c;
        this.setRates(this.linkCurrency, this.currency)
          .then((_) => {
            this.updateDisplay();
            this.buildingModel_ = false;
          });
      });
    },
    function initE() {
      this.SUPER();
      this.addClass(this.myClass())
      .startContext({ data: this })
        .add(this.preString_$)
        .start(this.DIS_DST_AMOUNT)
          .addClass('spacing')
          .enableClass('displayOnly', this.linked, true)
        .end()
        .add(this.postString_$)
      .endContext();
    },

    function updateDisplay() {
      if ( ! this.currencyObj_ ) return;
      let formattedRate = this.rate.toFixed(5);
      this.displayString = this.trueRate ?
        `${this.currencyObj_.format(this.data)} @Rate: ${formattedRate}` :
        `${this.currencyObj_.format(this.data)} @Rate: ${this.NO_RATE}`;
    },

    async function updateData(prec, from, to) {
      let relativePrec = 0;
      if ( this.currencyObj_ && this.linkCurrencyObj_ ) {
        relativePrec = this.currencyObj_.precision - this.linkCurrencyObj_.precision;
      }

      await this.exchangeRateService.exchange(from, to, this.linkAmount)
        .then((d) => {
          this.data = d * Math.pow(10, relativePrec);
          this.disDstAmount = (d/Math.pow(10, prec)).toFixed(prec);
        })
        .catch((e) => {
          this.data = ((this.linkAmount/this.rate) * Math.pow(10, relativePrec)).toFixed(0);
          this.disDstAmount = (this.data/Math.pow(10, prec)).toFixed(prec);
        });
    },

    async function currencyObjUpdate(cur, X) {
      return await this.currencyDAO.find(cur);
    },

    async function setRates(fromCurrency, toCurrency) {
      if ( ! fromCurrency || ! toCurrency ) return;

      if ( fromCurrency === toCurrency ) return this.setValues(1.00, true);

      await this.exchangeRateService.getRate(toCurrency, fromCurrency)
        .then((r) => {
          this.setValues(r, true);
        }).catch((_)=>{
          this.setValues(1.0, true);
        });
    },

    function setValues(rate, trueValue) {
      this.rate = rate;
      this.trueRate = trueValue;
    }
  ],

});
