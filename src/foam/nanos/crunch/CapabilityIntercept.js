/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'CapabilityIntercept',
  extends: 'foam.core.FOAMException',
  javaGenerateConvenienceConstructor: false,

  javaImports: [
    'foam.nanos.crunch.lite.Capable',
    'java.util.Arrays'
  ],

  javaCode: `
    public CapabilityIntercept(String message) {
      super(message);
    }

    public CapabilityIntercept(Throwable cause) {
      super(cause);
    }

    public CapabilityIntercept(String message, Throwable cause) {
      super(message, cause);
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'id',
      value: 'foam.nanos.crunch.CapabilityIntercept'
    },
    {
      name: 'capabilities',
      class: 'StringArray',
      aliases: [ 'capabilityOptions' ]
    },
    {
      name: 'capables',
      class: 'FObjectArray',
      of: 'foam.nanos.crunch.lite.Capable',
      aliases: [ 'capableRequirements' ]
    },
    {
      name: 'returnCapable',
      class: 'FObjectProperty',
      of: 'foam.core.FObject'
    },
    {
      name: 'daoKey',
      class: 'String'
    },
    {
      name: 'resolve',
      class: 'Function'
    },
    {
      name: 'reject',
      class: 'Function'
    },
    {
      name: 'resend',
      class: 'Function'
    },
    {
      name: 'aquired',
      class: 'Boolean',
      value: false
    },
    {
      name: 'cancelled',
      class: 'Boolean',
      value: false
    },
    {
      name: 'promise',
      expression: function (aquired, cancelled) {
        if ( aquired ) return Promise.resolve();
        if ( cancelled ) return Promise.reject();
        var self = this;
        return new Promise(function (resolve, reject) {
          var s1, s2;
          s1 = self.aquired$.sub(() => {
            s1.detach();
            s2.detach();
            resolve();
          })
          s1 = self.cancelled$.sub(() => {
            s1.detach();
            s2.detach();
            reject();
          })
        });
      }
    },
    {
      flags: ['web'],
      name: 'interceptType',
      expression: function (capabilities, capables) {
        if ( capabilities.length + capables.length > 1 ) {
          return this.InterceptType.COMPOSITE;
        }
        return capables.length > 0 ?
          this.InterceptType.CAPABLE : this.InterceptType.UCJ;
      }
    },
    {
      flags: ['web'],
      name: 'wizardController'
    }
  ],

  enums: [
    {
      name: 'InterceptType',
      values: ['UCJ', 'CAPABLE', 'COMPOSITE']
    }
  ],

  methods: [
    {
      name: 'addCapabilityId',
      args: [
        { name: 'capabilityId', type: 'String' }
      ],
      javaCode: `
        String[] capabilities = getCapabilities();
        capabilities = Arrays.copyOf(capabilities, capabilities.length + 1);
        capabilities[capabilities.length - 1] = capabilityId;
        setCapabilities(capabilities);
      `
    },
    {
      name: 'addCapable',
      args: [
        { name: 'capable', type: 'Capable' }
      ],
      javaCode: `
        Capable[] capables = getCapables();
        capables = Arrays.copyOf(capables, capables.length + 1);
        capables[capables.length - 1] = capable;
        setCapables(capables);
      `
    }
  ]
});
