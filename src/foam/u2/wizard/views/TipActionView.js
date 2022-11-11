foam.CLASS({
  package: 'foam.u2.wizard.views',
  name: 'TipActionView',
  extends: 'foam.u2.View',
  documentation: `
    This action view displays additional text to inform the user
  `,

  requires: [
    'foam.u2.ActionView'
  ],

  properties: [
    'action',
    {
      class: 'String',
      name: 'text'
    }
  ],

  css: `
    ^ {
      display: flex;
      flex-direction: column;
      margin-top: 1rem;
    }
    ^helptext {
      text-align: center;
    }
  `,

  methods: [
    function render () {
      const x = this.__subContext__;

      this
        .enableClass('foam-u2-ActionView-unavailable',
          this.action.createIsAvailable$(this.__context__, this.data), true)
        .addClass()
        .start()
          .addClass(this.myClass('helptext'))
          .add(this.text$)
        .end()
        .tag(this.ActionView, {
          action: this.action,
          data$: this.data$
        })
    }
  ]
});
