/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'MaybeDAOPutAgent',
  implements: [
    'foam.core.ContextAgent'
  ],
  documentation: `
    Perform a DAO put when Capable wizards are complete to complete the flow
    of a capability intercept.
  `,

  imports: [
    'intercept?',
    'submitted',
    'capable?',
  ],

  methods: [
    function execute() {
      var p = Promise.resolve();
      let daoKey = this.intercept?.daoKey || this.capable?.DAOKey;
      if ( daoKey && this.submitted ) {
        p = p.then(() =>
          this.__subContext__[daoKey].put(this.capable)
          .then(returnCapable => {
            if ( this.intercept )
              this.intercept.returnCapable = returnCapable;
          }).catch(e => {
            console.error(e);
          })
        );
      }
      return p;
    }
  ]
});
