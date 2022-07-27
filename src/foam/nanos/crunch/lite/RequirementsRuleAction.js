/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.lite',
  name: 'RequirementsRuleAction',

  documentation: `
    Rule action that adds payloads to a Capable object.
    Can only be used on objects implementing Capable.
  `,

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.crunch.CapabilityJunctionPayload',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason'
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'requirements'
    },
    {
      class: 'StringArray',
      name: 'available',
      documentation: 'Adds a payload but does not add to capabilityIds'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            if ( ! (obj instanceof Capable) ) {
              ((DAO) x.get("alarmDAO")).put(new Alarm(
                "foam.nanos.lite.RequirementsAction.objectNotCapable",
                foam.log.LogLevel.ERROR,
                AlarmReason.CONFIGURATION
              ));
              throw new RuntimeException(
                "Action can only be applied to Capable objects");
            }

            var capable = (Capable) obj;
            var capablePayloadDAO = capable.getCapablePayloadDAO(x);

            for ( String id : getRequirements() ) {
              var payload = new CapabilityJunctionPayload();
              payload.setCapability(id);
              capablePayloadDAO.put(payload);

              // Indicate that this payload is required
              capable.addRequirement(x, id);
            }

            // See 'documentation' Property property for 'available'
            for ( String id : getAvailable() ) {
              var payload = new CapabilityJunctionPayload();
              payload.setCapability(id);
              capablePayloadDAO.put(payload);
            }
          }
        }, "");
      `
    }
  ]
});
