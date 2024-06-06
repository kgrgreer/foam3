/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.lite.ruler',
  name: 'SetCapablePayloadStatusOnPut',

  implements: [
    'foam.nanos.ruler.RuleAction',
  ],

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.core.XLocator',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionPayload',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.lite.Capable',
    'foam.nanos.crunch.lite.CapableAdapterDAO',
    'foam.nanos.session.Session',

    'java.util.List',
    'java.util.Arrays',

    'static foam.mlang.MLang.*',
    'static foam.nanos.crunch.CapabilityJunctionStatus.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(getX(), new ContextAwareAgent() {
        @Override
        public void execute(X x) {
          var payloadDAO = (DAO) getX().get("capablePayloadDAO");

          CapabilityJunctionPayload payload = (CapabilityJunctionPayload) obj;

          CapabilityJunctionStatus defaultStatus = PENDING;

          try {
            payload.validate(x);
            payload.setStatus(defaultStatus);
          } catch ( Exception e ) {
            payload.setStatus(ACTION_REQUIRED);
            return;
          }

          DAO capabilityDAO = (DAO) x.get("capabilityDAO");
          Capability cap = (Capability) capabilityDAO.find(payload.getCapability());
          var oldStatus = payload.getStatus();
          var newStatus = cap.getCapableChainedStatus(x, payloadDAO, payload);

          // if payload is validated, use the capableChainedStatus
          // otherwise, use ACTION_REQUIRED
          if ( oldStatus == PENDING ) {
            payload.setStatus(newStatus);
          }
        }
      }, "Set capable payload status on put");
      `,
    }
  ]
});
