package net.nanopay.retail.api;

import foam.nanos.http.HttpContextListener;

import javax.servlet.ServletContextEvent;
import javax.servlet.annotation.WebListener;

@WebListener
public class APILauncher
    extends HttpContextListener
{

  @Override
  public void contextInitialized(ServletContextEvent servletContextEvent) {
    super.contextInitialized(servletContextEvent);
    System.out.println("Server Started");
  }

  @Override
  public void contextDestroyed(ServletContextEvent servletContextEvent) {
    System.out.println("Server Ended");
  }

}
