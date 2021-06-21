package foam.nanos.ws;

import java.io.IOException;
import java.net.InetSocketAddress;

import foam.nanos.*;
import foam.core.*;

public class NanoWebSocketServer
  extends ContextAwareSupport
  implements NanoService
{
  public static int WEBSOCKET_PORT_OFFSET = 1;

  protected int port_ = 8080;
  protected WebSocketServer server_;
  public void start() {
    int port = port_;
    // TODO: add a port config support system.
    if ( ! foam.util.SafetyUtil.isEmpty(System.getProperty("http.port")) ) {
      try {
        port = Integer.parseInt(System.getProperty("http.port"));
      } catch ( NumberFormatException e ) {
        ((foam.nanos.logger.Logger) getX().get("logger")).error(this.getClass().getSimpleName(), "Invalid http.port", System.getProperty("http.port"));
      }
    } else {
      foam.nanos.jetty.HttpServer httpServer = (foam.nanos.jetty.HttpServer) getX().get("http");
      if ( httpServer != null ) {
        port = httpServer.getPort();
      } else {
        ((foam.nanos.logger.Logger) getX().get("logger")).warning(this.getClass().getSimpleName(), "http not found");
      }
    }
    port += WEBSOCKET_PORT_OFFSET;
    ((foam.nanos.logger.Logger) getX().get("logger")).info(this.getClass().getSimpleName(),"Starting,port",port);

    server_ = new WebSocketServer(new InetSocketAddress(port));
    server_.setX(getX());
    server_.start();
  }
}
