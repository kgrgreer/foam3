/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'CapabilityJunctionPayload',
  documentation: `
    Capability data that can be stored in a UserCapabilityJunction or on a
    Capable object.
  `,

  imports: [
    'capabilityDAO'
  ],

  javaImports: [
    'foam.core.ClassInfo',
    'foam.core.FObject',
    'foam.core.Validatable',
    'foam.dao.DAO',
    'foam.nanos.crunch.Capability',
    'foam.util.SafetyUtil'
  ],

  implements: [
    'foam.core.Validatable'
  ],

  // TODO: Can section off view

  properties: [
    {
      class: 'Reference',
      name: 'capability',
      of: 'foam.nanos.crunch.Capability',
      menuKeys: ['admin.capabilities']
    },
    {
      name: 'data',
      class: 'FObjectProperty',
      of: 'foam.core.FObject',
      autoValidate: true,
      documentation: `data for capability.of`,
      view: 'foam.u2.view.AnyView'
    },
    {
      name: 'status',
      class: 'Enum',
      of: 'foam.nanos.crunch.CapabilityJunctionStatus',
      value: foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED
    },
    {
      class: 'Boolean',
      name: 'hasSafeStatus',
      documentation: 'We get capable payloads sent to us, we want to confirm client calls with real status.',
      // TODO: Check where this should be used in UCJ rules
      transient: true
    },
    {
      class: 'Boolean',
      name: 'needsApproval',
      // TODO: Check if this is useful for UCJ rules
      transient: true
    }
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
        DAO capabilityDAO = (DAO) x.get("capabilityDAO");
        Capability capability = (Capability) capabilityDAO.find(getCapability());
        ClassInfo dataClass = capability.getOf();
        if ( dataClass == null ) return;
        FObject dataObject = getData();
        if ( dataObject == null ) {
          throw new IllegalStateException(String.format(
            "Missing payload data for capability '%s'",
            capability.getId()
          ));
        }
        if ( ! dataClass.isInstance(dataObject) ) {
          throw new IllegalStateException(String.format(
            "Invalid payload data class for capability '%s'",
            capability.getId()
          ));
        }
        if ( dataObject instanceof Validatable ) {
          dataObject.validate(x);
        }
      `,
    },
    {
      name: 'toSummary',
      type: 'String', //TODO: investigate why we need to define type String
      code: function(){
        return this.capability
          ? this.capabilityDAO.find(this.capability).then(capability => capability.name)
          : '';
      },
      javaCode: `
        String toSummaryString = "";

        if ( SafetyUtil.isEmpty(getCapability()) ){
          return toSummaryString;
        }

        Capability capability = findCapability(getX());

        toSummaryString = capability.getName();

        return toSummaryString;
      `
    }
  ],
});
