/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'SetNodeSink',
  extends: 'foam.dao.ProxySink',

  documentation: `Set 'node' on MedusaEntry to distinguish this copy of the MedusaEntry.  Required by the MedusaConsensusDAO.
Future/Security: This can become a key of some kind.`,

  javaImports: [
    'foam.core.X',
    'foam.dao.Sink',
  ],

  methods: [
    {
      name: 'put',
      args: [
        {
          name: 'obj',
          type: 'Object'
        },
        {
          name: 'sub',
          type: 'foam.core.Detachable'
        }
      ],
      javaCode: `
      MedusaEntry entry = (MedusaEntry) obj;
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");

      if ( ! entry.getNode().equals(support.getConfigId()) ) {
        entry = (MedusaEntry) entry.fclone();
        entry.setNode(support.getConfigId());
      }
      getDelegate().put(entry, sub);
      `
    },
    {
      name: 'remove',
      javaCode: `//nop`
    },
    {
      name: 'eof',
      javaCode: `// nop`
    },
    {
      name: 'reset',
      javaCode: `//nop`
    }
  ]
});
