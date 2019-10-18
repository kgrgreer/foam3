foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Security',
  extends: 'net.nanopay.model.Denomination',

  documentation: `The base model for storing, using and managing currency information.
    All class properties require a return of *true* in order to pass.`,

  ids: [
    'alphabeticCode'
  ],


  tableColumns: [
    'name',
    'alphabeticCode'
  ],


  methods: [
    {
      name: 'format',
      code: function(amount) {
        /**
         * Given a number, display it as a currency using the appropriate
         * precision, decimal character, delimiter, symbol, and placement
         * thereof.
         *
         * With the new home denomination feature, we will append (if left) or
         * prepend (if right) the alphabetic code if the currency's alphabetic code
         * is not equal to the homeDenomination
         *
         */
        amount = Math.floor(amount);
        var isNegative = amount < 0;
        amount = amount.toString();
        if ( isNegative ) amount = amount.substring(1);
        var formatted = isNegative ? '-' : '';

        formatted+= amount;

        formatted += ' ';
        formatted += this.alphabeticCode;


        return formatted;
      },
      args: [
        {
          class: 'foam.core.Currency',
          name: 'amount'
        }
      ],
      type: 'String',
      javaCode: `
        Boolean isNegative = amount < 0;
        String amountStr = Long.toString(amount);
        if ( isNegative ) amountStr = amountStr.substring(1);
        String formatted = isNegative ? "-" : "";
        formatted += amountStr;
        formatted += " ";
        formatted += this.getAlphabeticCode();
        return formatted;
      `
    }
  ]
});
