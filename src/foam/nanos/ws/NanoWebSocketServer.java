package foam.nanos.ws;

import java.io.IOException;
import java.net.InetSocketAddress;

import foam.nanos.*;
import foam.core.*;

public class NanoWebSocketServer
  extends ContextAwareSupport
  implements NanoService
{
  protected WebSocketServer server_;
  public void start() {
    int port = foam.net.Port.get(getX(), "WebSocketServer");
    ((foam.nanos.logger.Logger) getX().get("logger")).info(this.getClass().getSimpleName(),"Starting,port",port);

    server_ = new WebSocketServer(new InetSocketAddress(port));
    server_.setX(getX());
    server_.start();
  }
}
