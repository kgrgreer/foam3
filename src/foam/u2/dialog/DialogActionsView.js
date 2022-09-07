/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.dialog',
  name: 'DialogActionsView',
  extends: 'foam.u2.View',

  css: `
    ^actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      padding: 1.2rem 40pt;
    }
    ^actions > * {
      flex-grow: 1;
      margin-left: 0 !important;
    }
  `,

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.u2.ActionReference',
      name: 'data'
    }
  ],

  methods: [
    function render () {
      const self = this;
      this
        .add(this.slot(function ( data ) {
          if ( ! data || data.length === 0 ) return this.E();
          return this.E()
            .addClass(self.myClass('actions'))
            .forEach(data, function ( actionRef ) {
              this.start(actionRef.action, {
                size: 'LARGE',
                data$: actionRef.data$
              }).end()
            })
        }));
    }
  ]
});