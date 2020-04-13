foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'MenuRedirectSMEModal',
  extends: 'net.nanopay.sme.ui.SMEModal',

  documentation: 'Overwrites close modal function to redirect to given menu.',

  imports: [
    'pushMenu'
  ],

  exports: [ 'as data' ],

  properties: [
    {
      class: 'String',
      name: 'menu'
    }
  ],

  actions: [
    {
      name: 'closeModal',
      label: '',
      icon: 'images/ic-cancelwhite.svg',
      code: function(X) {
        X.pushMenu(X.data.menu);
      }
    }
  ],

  listeners: [
    function close() {
      this.pushMenu(this.menu);
    }
  ]
});