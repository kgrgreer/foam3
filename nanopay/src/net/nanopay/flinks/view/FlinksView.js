foam.CLASS({
  package: 'net.nanopay.flinks.view',
  name: 'FlinksView',
  extends: 'foam.u2.Controller',

  documentation: 'View displaying bank Selection',

  messages: [
    { name: 'title', message: 'Connect a new bank account'}
  ],

  properties: [
    {
      class: 'String',
      name: 'p1'
    },
    {
      class: 'Boolean',
      name: 'p2',
      value: true
    }
  ],

  methods: [
    function initE(){
      this.SUPER();
      
      this
        .addClass(this.myClass())
        .start('div')
          .tag(this.AUTH_FORM)
          .tag(this.TEST)
          .tag(this.TACKLE)
          .tag(this.SSLOT)
        .end();
    }
  ],

  actions: [
    {
      name: 'authForm',
      label: 'auth a new bank account',
      code: function(X) {
        X.stack.push({class: 'net.nanopay.flinks.view.form.FlinksForm', isCustomNavigation: true})
      }
    }
  ]
});
