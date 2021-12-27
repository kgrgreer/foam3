/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.app',
  name: 'HealthHeartbeatService',

  documentation: 'Health check UDP broadcaster and listener.',
  // see https://www.baeldung.com/java-broadcast-multicast

  implements: [
    'foam.core.ContextAgent',
    'foam.core.ContextAware',
    'foam.nanos.NanoService'
  ],

  javaImports: [
    'foam.core.Agency',
    'foam.core.ContextAgentTimerTask',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.lib.formatter.FObjectFormatter',
    'foam.lib.formatter.JSONFObjectFormatter',
    'foam.lib.json.JSONParser',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'java.io.IOException',
    'java.net.DatagramPacket',
    'java.net.DatagramSocket',
    'java.net.InetAddress',
    'java.net.InetSocketAddress',
    'java.net.MulticastSocket',
    'java.util.Timer'
  ],

  properties: [
    {
      name: 'timerInterval',
      class: 'Long',
      value: 5000,
      units: 'ms'
    },
    {
      name: 'initialTimerDelay',
      class: 'Long',
      value: 30000,
      units: 'ms'
    },
    {
      name: 'port',
      class: 'Int',
      javaFactory: `
      return Integer.parseInt(System.getProperty("http.port", "8443")) + getPortOffset();
      `
    },
    {
      name: 'portOffset',
      class: 'Int',
      value: 4
    },
    {
      name: 'multicastAddress',
      class: 'String',
      value: '230.10.22.41'
    },
    {
      name: 'formatter',
      class: 'Object',
      javaFactory: `
      JSONFObjectFormatter formatter = new JSONFObjectFormatter();
      formatter.setOutputShortNames(true);
      formatter.setOutputDefaultClassNames(false);
      formatter.setPropertyPredicate(
        new foam.lib.NetworkPropertyPredicate());
      return formatter;
      `
    }
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
      Loggers.logger(getX(), this).info("start");
      Agency agency = (Agency) getX().get("threadPool");
      agency.submit(getX(), this, this.getClass().getSimpleName());

      Timer timer = new Timer(this.getClass().getSimpleName(), true);
      timer.scheduleAtFixedRate(
        new ContextAgentTimerTask(getX(),
          new ContextAgent() {
            public void execute(X x) {
              Health health = (Health) ((DAO) x.get("healthDAO")).put_(x, (Health) x.get("Health")).fclone();
              health.setTimeNext(health.getTimeCurrent() + getTimerInterval());
              FObjectFormatter formatter = (FObjectFormatter) getFormatter();
              formatter.reset();
              formatter.output(health);
              String data = formatter.builder().toString();
              // ((Logger) x.get("logger")).debug("HealthHeartbeatService", "broadcaster", "broadcasting", data);
              byte[] buf = data.getBytes();

              DatagramSocket socket = null;
              try {
                socket = new DatagramSocket();
                DatagramPacket packet
                  = new DatagramPacket(buf, buf.length, InetAddress.getByName(getMulticastAddress()), getPort());
                socket.send(packet);
              } catch ( IOException e ) {
                Loggers.logger(x, this).warning("broadcaster", e);
              } finally {
                if ( socket != null ) socket.close();
              }
            }
          }
        ),
        getInitialTimerDelay(),
        getTimerInterval()
      );
      `
    },
    {
      name: 'execute',
      javaCode: `
      Logger logger = Loggers.logger(x, this);
      logger.debug("listener");
      byte[] buf = new byte[512];
      MulticastSocket socket = null;
      InetAddress group = null;
      Class cls = x.get("Health").getClass();
      try {
        socket = new MulticastSocket(getPort());
        group = InetAddress.getByName(getMulticastAddress());
        socket.joinGroup(group);
        while (true) {
          DatagramPacket packet = new DatagramPacket(buf, buf.length);
          socket.receive(packet);
          String received = new String(
            packet.getData(), 0, packet.getLength());
          // logger.debug("listener", "received", received);
          try {
            Health health = (Health) x.create(JSONParser.class).parseString(received, cls);
            InetSocketAddress sender = (InetSocketAddress) packet.getSocketAddress();
            String address = sender.getAddress().toString();
            if ( address.startsWith("/") ) {
              // typically missing hostname
              address = address.substring(1);
            }
            health.setAddress(address);
            ((DAO) x.get("healthDAO")).put_(x, health);
          } catch ( RuntimeException e ) {
            logger.warning("listener", "parse", e);
          }
        }
      } catch ( IOException e ) {
        logger.warning("listener", "exit", e);
      } finally {
        if ( socket != null ) {
          try {
            socket.leaveGroup(group);
            socket.close();
          } catch ( IOException e ) {
            // nop
          }
        }
      }
      `
    }
  ]
});
