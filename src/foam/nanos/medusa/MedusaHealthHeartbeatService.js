/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaHealthHeartbeatService',
  extends: 'foam.nanos.app.HealthHeartbeatService',

  documentation: 'Health check broadcaster and listener.',

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'static foam.mlang.MLang.*',
    'foam.nanos.logger.Logger',
    'foam.net.Host',
    'java.io.IOException',
    'java.net.DatagramPacket',
    'java.net.DatagramSocket',
    'java.net.InetAddress',
    'java.net.InetSocketAddress',
    'java.util.ArrayList',
    'java.util.List'
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
      // service order is important
      getX().get("daggerService");
      super.start();
      `
    },
    {
      name: 'getPackets',
      args: 'X x, String data',
      javaType: 'java.net.DatagramPacket[]',
      javaThrows: [ 'java.io.IOException' ],
      javaCode: `
      if ( getUseMulticast() ) {
        return super.getPackets(x, data);
      }

      List<DatagramPacket> packets = new ArrayList();
      byte[] buf = data.getBytes();
      DAO hostDAO = (DAO) x.get("hostDAO");
      DAO clusterConfigDAO = (DAO) x.get("clusterConfigDAO");
      List<ClusterConfig> configs = ((ArraySink) clusterConfigDAO
        .where(
          AND(
            EQ(ClusterConfig.REGION_STATUS, RegionStatus.ACTIVE),
            EQ(ClusterConfig.ENABLED, true)
          ))
        .select(new ArraySink())).getArray();
      for ( ClusterConfig config : configs ) {
        String address = config.getId();
        Host host = (Host) hostDAO.find(address);
        if ( host != null ) {
          address = host.getAddress();
        }
        packets.add(new DatagramPacket(buf, buf.length, InetAddress.getByName(address), getPort()));
      }
      return packets.toArray(new DatagramPacket[0]);
      `
    }
  ]
});
