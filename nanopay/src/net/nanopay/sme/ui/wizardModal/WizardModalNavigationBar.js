foam.CLASS({
  package: 'net.nanopay.sme.ui.wizardModal',
  name: 'WizardModalNavigationBar',
  extends: 'foam.u2.Element',

  documentation: `
    A premade NavigationBar that can take in methods that will allow navigation in WizardModal.

    This view/model was made with the intention to be used in a modal subview.
  `,

  css: `
    ^container {
      display: table;
      text-align: right;
      width: 100%;
      padding: 24px;
      box-sizing: border-box;
      background-color: #fafafa;
    }
    ^ .net-nanopay-ui-ActionView-back,
    ^ .net-nanopay-ui-ActionView-next {
      display: table-cell;
      vertical-align: middle;
      height: 40px;
    }
    ^ .net-nanopay-ui-ActionView-back {
      position: relative;
      top: 0;
      border: none;
      width: auto;
      color: #525455;
      margin-right: 24px;
      background-color: transparent;
      box-shadow: none;
    }
    ^ .net-nanopay-ui-ActionView-back:hover {
      background-color: transparent;
    }
    ^ .net-nanopay-ui-ActionView-next {
      padding: 8px 24px;
      background-color: %SECONDARYCOLOR%;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.core.Action',
      name: 'back'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.core.Action',
      name: 'next'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      // If neither back or next has been provided, DO NOT render
      if ( ! this.back && ! this.next ) return;
      this.addClass(this.myClass());
      this.start('div').addClass(this.myClass('container'))
        .callIf(this.back, function() {
          // If NEXT exists, render that action
          this.tag(self.back);
        })
        .callIf(this.next, function() {
          // If BACK exists, render that action
          this.tag(self.next);
        })
      .end();
    }
  ]
});
