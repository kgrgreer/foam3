/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'UserReferencedPayload',
  documentation: 'Capability user related payload class - attaches listeners to wizardlets if defined',

  imports: [
    'wizardlets'
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'wizardletsToListen',
      visibility: 'HIDDEN',
      documentation: `
        (Capability IDs)
        Select wizardlets to listen on changes based on the capability defined on wizardlet.
      `
    }
  ],

  methods: [
    function init() {
      // Initialize listeners on defined wizardlets in reference to their capability ids
      if ( this.wizardlets ) {
        this.wizardletsToListen.forEach(capabilityId => {
          wizardlet = this.wizardlets.find(wizardlet => wizardlet.capability.id === capabilityId );
          if ( ! wizardlet ) return;
          wizardlet.loading$.sub(s => {
            this.onWizardletUpdate(s.src.obj);
          });
        });
      }
    },
    {
      name: 'copyToUser',
      type: 'foam.nanos.auth.User',
      documentation: `
        Intended override on capability payload classes - allowing payload data
        to define what user property values copy over to provided user.
      `,
      args: [
        { type: 'foam.nanos.auth.User', name: 'user' }
      ],
      javaCode: `
        // Override
        return user;
      `
    }
  ],

  listeners: [
    {
      name: 'onWizardletUpdate',
      documentation: `Listener called when wizardlet update occurs - obj == wizardlet object `,
      code: function(obj) {
        // Listener placed on wizardlets defined by payload class
        // Override
      }
    }
  ]
});
