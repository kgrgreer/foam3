/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.flow.laminar',
  name: 'PrintDoclet',
  extends: 'foam.flow.laminar.AbstractDoclet',

  requires: [
    'foam.u2.view.AnyView'
  ],

  properties: [
    {
      class: 'String',
      name: 'key'
    },
    {
      name: 'value_',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'showMeta'
    }
  ],

  methods: [
    async function execute_ (x) {
      console.log('setting value property', x[this.key])
      this.value_ = x[this.key];
    },
    function toE (args, x) {
      // return this.AnyView.create({ data$: this.value_$ });
      const self = this;
      return this.value_$.map(data => {
        console.log('PrintDoclet data is', data);
        return x.E()
          .callIf(this.showMeta, function () {
            this.start('h2')
              .add('Printing value')
              .start('code').add(self.key).end()
              .end();
          })
          .tag(this.AnyView, { data })
          ;
      });
    }
  ]
})
