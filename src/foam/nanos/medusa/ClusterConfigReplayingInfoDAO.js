/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigReplayingInfoDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Return ReplayingInfo for this instance`,

  methods: [
    {
      name: 'find_',
      javaCode: `
      ClusterConfig config = (ClusterConfig) getDelegate().find_(x, id);
      if ( config != null ) {
        config = (ClusterConfig) config.fclone();

        ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
        config.setReplayingInfo(replaying);
      }
      return config;
      `
    }
  ]
});
