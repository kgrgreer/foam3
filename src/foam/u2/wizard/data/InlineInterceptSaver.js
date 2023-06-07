/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'InlineInterceptSaver',
  implements: [ 'foam.u2.wizard.data.Saver' ],
  documentation: `
    This saver invokes an inline intercept wizard on a Capable object
    without calling 'put' on its respective DAO. If the object does not already
    have requirements specified in 'capabilityIds', then no inline wizard will
    occur.
  `,

  imports: [
    'crunchController',
    'wizardController'
  ],

  requires: [
    'foam.nanos.crunch.lite.Capable'
  ],

  methods: [
    async function save (data) {
      if ( ! this.Capable.isInstance(data) ) {
        console.error('[InlineInterceptSaver] input data is not Capable', {
          data: data,
          saver: this,
          x: this.__context__
        });
        throw new Error('could not create inline wizard');
      }

      if ( ! this.wizardController ) {
        console.error('[InlineInterceptSaver] not in wizard context', {
          data: data,
          saver: this,
          x: this.__context__
        });
      }

      for ( const capabilityId of data.capabilityIds ) {
        console.log('calling it with', data, this.wizardController, capabilityId);
        console.log('currently at', this.wizardController.wizardPosition.instance_);
        await this.crunchController.doInlineIntercept(
          this.wizardController, data, capabilityId, null,
          { put: false }
        );
        console.log('after at', this.wizardController.wizardPosition.instance_);
      }
    }
  ]
});
