/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box.socket',
  name: 'SocketServer',

  documentation: 'Waits on the socket connection for requests, passing them off to a SocketServerProcessor.',

  implements: [
    'foam.nanos.NanoService'
  ],

  javaImports: [
    'foam.box.Box',
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.net.Port',
    'java.io.IOException',
    'java.net.ServerSocket',
    'java.net.Socket',
    'javax.net.ssl.SSLContext',
    'javax.net.ssl.SSLServerSocket'
  ],

  properties: [
    {
      class: 'Int',
      name: 'port',
      javaFactory: 'return Port.get(getX(), "SocketServer");'
    },
    {
      class: 'String',
      name: 'threadPoolName',
      value: 'threadPool'
    },
    {
      documentation: 'So not to block server shutdown, have sockets timeout. Catch and continue on SocketTimeoutException.',
      class: 'Int',
      name: 'soTimeout',
      value: 60000
    }
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
        final Logger logger = Loggers.logger(getX(), this, "port", String.valueOf(getPort()));
        try {
          ServerSocket serverSocket0 = null;
          SslContextFactory contextFactory = (SslContextFactory) getX().get("sslContextFactory");

          if ( contextFactory != null && contextFactory.getEnableSSL() ) {
            SSLServerSocket sslServerSocket = (SSLServerSocket) contextFactory.getSSLContext().getServerSocketFactory().createServerSocket(getPort());
            sslServerSocket.setNeedClientAuth(true);
            serverSocket0 = sslServerSocket;
          } else {
            serverSocket0 = new ServerSocket(getPort());
          }

          final ServerSocket serverSocket = serverSocket0;

          Agency agency = (Agency) getX().get(getThreadPoolName());
          logger.info("start", "threadPoolName", getThreadPoolName(), "threadsPerCore", ((foam.nanos.pool.AbstractFixedThreadPool) agency).getThreadsPerCore(), "numberOfThreads", ((foam.nanos.pool.AbstractFixedThreadPool) agency).getNumberOfThreads());
          agency.submit(
            getX(),
            new ContextAgent() {
              @Override
              public void execute(X x) {
                try {
                  while ( true ) {
                    Socket client = serverSocket.accept();
                    client.setSoTimeout(getSoTimeout());
                    agency.submit(
                      x,
                      new SocketServerProcessor(getX(), client),
                      client.getRemoteSocketAddress().toString()
                    );
                  }
                } catch ( IOException ioe ) {
                  logger.error(ioe);
                }
              }
            },
            "SocketServer.accept-"+getPort()
          );

        } catch (java.net.BindException e) {
          logger.error(e.getMessage(), e);
          System.exit(1);
        } catch ( Exception e ) {
          logger.error(e);
        }
      `
    }
  ]
});
