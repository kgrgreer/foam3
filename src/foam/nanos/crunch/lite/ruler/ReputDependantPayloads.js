/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.lite.ruler',
  name: 'ReputDependantPayloads',

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
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.CapabilityJunctionPayload',
    'foam.nanos.crunch.lite.Capable',
    'foam.nanos.crunch.lite.CapableAdapterDAO',
    'java.util.Arrays',
    'java.util.List',
    'static foam.nanos.crunch.CapabilityJunctionStatus.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAwareAgent() {
          @Override
          public void execute(X x) {
            CapabilityJunctionPayload old = (CapabilityJunctionPayload) x.get("OLD");
            CapabilityJunctionPayload payload = (CapabilityJunctionPayload) obj;
            if ( old != null && old.getStatus() == payload.getStatus() ) return;

            var payloadDAO = (DAO) getX().get("capablePayloadDAO");

            var crunchService = (CrunchService) x.get("crunchService");
            var depIds = crunchService.getDependentIds(XLocator.get(), payload.getCapability());

            ((ArraySink) payloadDAO.select(new ArraySink())).getArray().stream()
              .filter(cp -> Arrays.stream(depIds).anyMatch(((CapabilityJunctionPayload) cp).getCapability()::equals))
              .forEach(cp -> {
                payloadDAO.inX(x).put((CapabilityJunctionPayload) cp);
              });
          }
        }, "Reput dependent payloads");
      `,
    }
  ]
});
