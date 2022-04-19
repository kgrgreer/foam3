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
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.lib.formatter.FObjectFormatter',
    'foam.lib.formatter.JSONFObjectFormatter',
    'foam.lib.json.JSONParser',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.pm.PM',
    'foam.net.Port',
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
      value: 3000,
      units: 'ms'
    },
    {
      name: 'initialTimerDelay',
      class: 'Long',
      value: 5000,
      units: 'ms'
    },
    {
      name: 'port',
      class: 'Int'
    },
    {
      name: 'multicastAddress',
      class: 'String'
    },
    {
      name: 'timer',
      class: 'Object'
    },
    {
      name: 'formatter',
      class: 'Object',
      javaFactory: `
      JSONFObjectFormatter formatter = new JSONFObjectFormatter();
      // Each healthDAO holds a particular 'of'. Not outputting class
      // allows the parser to create the model appropriate for its DAO.
      formatter.setOutputClassNames(false);
      formatter.setOutputDefaultClassNames(false);
      formatter.setOutputShortNames(true);
      formatter.setPropertyPredicate(new foam.lib.ClusterPropertyPredicate());
      return formatter;
      `
    }
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
      Loggers.logger(getX(), this).info("broadcaster", "start", getMulticastAddress(), getPort());
      Agency agency = (Agency) getX().get("threadPool");
      agency.submit(getX(), this, this.getClass().getSimpleName());

      Timer timer = new Timer(this.getClass().getSimpleName(), true);
      setTimer(timer);
      timer.scheduleAtFixedRate(
        new ContextAgentTimerTask(getX(),
          new ContextAgent() {
            public void execute(X x) {
              PM pm = PM.create(x, "HealthHeartbeatService", "broadcaster");
              Health health = (Health) x.get("Health");
              health.setHeartbeatTime(System.currentTimeMillis());
              health.setHeartbeatSchedule(getTimerInterval());
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
                pm.log(x);
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
      logger.info("listener", "start", getMulticastAddress(), getPort());
      byte[] buf = new byte[512];
      MulticastSocket socket = null;
      InetAddress group = null;
      FObject self = (FObject) x.get("Health");

      try {
        socket = new MulticastSocket(getPort());
        group = InetAddress.getByName(getMulticastAddress());
        socket.joinGroup(group);
        while (true) {
          DatagramPacket packet = new DatagramPacket(buf, buf.length);
          socket.receive(packet);
          long now = System.currentTimeMillis();
          PM pm = PM.create(x, "HealthHeartbeatService", "listener");

          String received = new String(
            packet.getData(), 0, packet.getLength());
          // logger.debug("listener", "received", received);
          try {
            Health health = (Health) x.create(JSONParser.class).parseString(received, self.getClass());
            // NOTE: NOT ignoring broadcast from self as this gives us our own IP address.
            InetSocketAddress sender = (InetSocketAddress) packet.getSocketAddress();
            String address = sender.getAddress().toString();
            if ( address.startsWith("/") ) {
              // typically missing hostname
              address = address.substring(1);
            }
            health.setAddress(address);
            health.setPropogationTime(Math.abs(now - health.getHeartbeatTime()));
            ((DAO) x.get("healthDAO")).put_(x, health);
          } catch ( NullPointerException e ) {
            logger.debug("listener", "received", received, e.getMessage(), e);
          } catch ( ClassCastException e ) {
            logger.debug("listener", "received", received, e.getMessage(), e);
          } catch ( RuntimeException e ) {
            logger.warning("listener", "parse", e);
          } finally {
            pm.log(x);
          }
        }
      } catch ( IOException e ) {
        logger.warning("listener", "exit", e.getMessage(), e);
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
