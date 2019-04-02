foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'ModalProgressBar',
  extends: 'foam.u2.View',

  css: `
    ^ {
      position: relative;
      width: 100%;
      height: 2px;
      /* Might have to change this to be dynamic in the future */
      background: #e7eaec;
    }

    ^ .progress {
      position: absolute;
      top: 0;
      left: 0;
      height: 2px;
      /* Change this to be dynamic during refinements */
      background: #406dea;
    }
  `,

  properties: [
    {
      class: 'Int',
      name: 'percentage',
      value: 0,
      documentation: 'The value should be between 0-100'
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start().addClass(this.myClass(progress)).style({ 'width' : this.percentage$.map(function(v) { return v; }) }).end();
    }
  ]
});
