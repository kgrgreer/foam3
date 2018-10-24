foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Currency',

  documentation: 'Currency information.',

  ids: [
    'alphabeticCode'
  ],

  javaImports: [
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      class: 'String',
      name: 'name',
      documentation: 'Name of currency.',
      required: true
    },
    {
      class: 'String',
      name: 'alphabeticCode',
      documentation: 'Alphabetic code of currency.',
      required: true
    },
    {
      class: 'Long',
      name: 'numericCode',
      documentation: 'Numeric code of currency.',
      required: true
    },
    {
      class: 'Int',
      name: 'precision',
      documentation: 'The number of digits that come after the decimal point.',
      required: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      documentation: 'Reference to affiliated country.',
      name: 'country',
      required: true
    },
    {
      class: 'String',
      name: 'delimiter',
      documentation: 'The character used to delimit groups of 3 digits.',
      required: true
    },
    {
      class: 'String',
      name: 'decimalCharacter',
      documentation: 'The character used as a decimal.',
      required: true
    },
    {
      class: 'String',
      name: 'symbol',
      documentation: 'The symbol used for the currency. Eg: $ for CAD.',
      required: true
    },
    {
      class: 'String',
      name: 'leftOrRight',
      documentation: `The side of the digits that the symbol should be displayed on.`,
      required: true,
      validateObj: function(value) {
        if ( value !== 'left' && value !== 'right' ) return `Property 'leftOrRight' must be set to either "left" or "right".`;
      }
    },
    {
      class: 'String',
      name: 'flagImage',
      documentation: 'Flag image used in relation to currency.'
    }
  ],

  methods: [
    {
      name: 'format',
      code: function(amount) {
        /**
         * Given a number, display it as a currency using the appropriate
         * precision, decimal character, delimiter, symbol, and placement
         * thereof.
         */
        amount = amount.toString();
        while ( amount.length < this.precision ) amount = '0' + amount;
        var beforeDecimal = amount.substring(0, amount.length - this.precision);
        var formatted = '';
        if ( this.leftOrRight === 'left' ) formatted += this.symbol;
        formatted += beforeDecimal.replace(/\B(?=(\d{3})+(?!\d))/g, this.delimiter) || '0';
        if ( this.precision > 0 ) {
          formatted += this.decimalCharacter;
          formatted += amount.substring(amount.length - this.precision);
        }
        if ( this.leftOrRight === 'right' ) formatted += this.symbol;
        return formatted;
      },
      args: [
        {
          class: 'foam.core.Currency',
          name: 'amount'
        }
      ],
      javaReturns: 'String',
      javaCode: `
        String amountStr = Long.toString(amount);
        while ( amountStr.length() < this.getPrecision() ) {
          amountStr = "0" + amountStr;
        }
        String beforeDecimal = amountStr.substring(0, amountStr.length() - this.getPrecision());
        String formatted = "";
        if ( SafetyUtil.equals(this.getLeftOrRight(), "left") ) {
          formatted += this.getSymbol();
        }
        formatted += beforeDecimal.length() > 0 ?
          beforeDecimal.replaceAll("\\\\B(?=(\\\\d{3})+(?!\\\\d))", this.getDelimiter()) :
          "0";
        if ( this.getPrecision() > 0 ) {
          formatted += this.getDecimalCharacter();
          formatted += amountStr.substring(amountStr.length() - this.getPrecision());
        }
        if ( SafetyUtil.equals(this.getLeftOrRight(), "right") ) {
          formatted += this.getSymbol();
        }
        return formatted;
      `
    }
  ]
});
