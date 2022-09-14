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

          // Ensure actions are sorted by button type
          data.sort((a, b) => {
            let buttonStyleA = a.action.buttonStyle;
            let buttomStyleB = b.action.buttonStyle;

            // Adapt strings to enum values
            if ( typeof buttonStyleA === 'string' ) {
              buttonStyleA = foam.u2.ButtonStyle[buttonStyleA];
            }
            if ( typeof buttonStyleB === 'string' ) {
              buttonStyleB = foam.u2.ButtonStyle[buttonStyleB];
            }

            return buttonStyleA.ordinal - buttomStyleB.ordinal;
          });
          
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