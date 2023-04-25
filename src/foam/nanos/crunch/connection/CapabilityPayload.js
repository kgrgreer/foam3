/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.connection',
  name: 'CapabilityPayload',
  documentation: `
    CapabilityPayload is created with an id for a specific requested capability and its
    associated capabilities mapped to required data objects in the specified in its grant path
  `,

  javaImports: [
    'foam.core.FObject',
    'java.util.HashMap',
    'java.util.Map'
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      documentation: `
        ID of the capability that this CapabilityPayload matches.
      `
    },
    {
      class: 'Map',
      name: 'capabilityDataObjects',
      javaFactory: `
        return new HashMap<String,FObject>();
      `,
      documentation: `
        Data necessary for the capabilities.
      `
    },
    {
      class: 'Map',
      name: 'capabilityValidationErrors',
      readPermissionRequired: false,
      writePermissionRequired: true,
      javaFactory: `
        return new HashMap<String,String>();
      `,
      documentation: `
        Validation errors for capability data objects.
      `
    }
  ],
  methods: [
      {
        name: 'copyFrom',
        type: 'CapabilityPayload',
        args: [ { name: 'obj', type: 'FObject' } ],
        javaCode: `
          Map<String,FObject> capabilityDataObjects = (Map<String,FObject>) getCapabilityDataObjects();
          Map<String,FObject> newCapabilityDataObjects = (Map<String,FObject>) ((CapabilityPayload) obj).getCapabilityDataObjects();
          for ( Map.Entry<String, FObject> e : newCapabilityDataObjects.entrySet() ) {
            String key = (String) e.getKey();
            FObject n = (FObject) e.getValue();
            FObject o = (FObject) capabilityDataObjects.get(key);
            if ( o == null ) {
              capabilityDataObjects.put(key, n);
              continue;
            }
            o.copyFrom(n);
            capabilityDataObjects.put(key, o);
          }
          setCapabilityDataObjects(capabilityDataObjects);
          return this;
        `,
        code: function(obj, opt_warn) {
          let newCapabilityDataObjects = obj.capabilityDataObjects;
          let keys = Object.keys(newCapabilityDataObjects);
          for ( let key of keys ) {
            var n = newCapabilityDataObjects[key];
            var o = this.capabilityDataObjects[key];
            if ( o == null ) {
              this.capabilityDataObjects[key] = n;
              continue;
            }
            o.copyFrom(n);
            this.capabilityDataObjects[key] = o;
          }
          this.capabilityValidationErrors = obj.capabilityValidationErrors;
          return this;
        }
      }
    ]
});
