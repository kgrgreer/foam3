/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.lite',
  name: 'CapableObjectData',
  extends: 'foam.nanos.crunch.lite.CapableObjectDataProperties',

  imports: [
    'auth?',
    'crunchController?'
  ],

  methods: [
    {
      // TODO: investigate why this default implementation doesn't
      //   work when put in the Capable interface itself; this
      //   behaviour works with mlang.Expressions so it's odd that
      //   it doesn't work for this case.
      name: 'setRequirements',
      flags: [ 'java' ],
      args: 'String[] capabilityIds',
      code: function(capabilityIds) {
        this.capabilityIds = capabilityIds;
      },
      javaCode: 'setCapabilityIds(capabilityIds);'
    },
    {
      name: 'getCapablePayloadDAO',
      flags: ['web'],
      code: function () {
        return this.CapableAdapterDAO.create({
          capable: this
        });
      }
    }
  ],

  actions: [
    {
      name: 'openCapableWizard',
      isAvailable: auth => {
        return auth?.check(null, 'developer.capableObjectData.openCapableWizard');
      },
      code: async function () {
        if ( ! this.crunchController ) return;
        for ( const capabilityId of this.capabilityIds ) {
          const seq = this.crunchController.createCapableWizardSequence(
            undefined, this, capabilityId
          );
          await seq.execute();
        }
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.nanos.crunch.lite',
  name: 'BaseCapable',

  flags: [ 'java' ],

  implements: [
    'foam.nanos.crunch.lite.Capable'
  ],
  mixins: [
    'foam.nanos.crunch.lite.CapableObjectData'
  ]
});
