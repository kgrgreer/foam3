package net.nanopay.meter.compliance.dowJones;

import foam.core.*;
import foam.dao.*;
import java.io.*;
import java.util.*;

import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.User;
import net.nanopay.meter.compliance.dowJones.*;
import foam.nanos.NanoService;
import org.apache.commons.io.IOUtils;
import foam.nanos.logger.Logger;

/**
 * The DowJonesService is used as a service that will be delegated into the Skeleton Box.
 * This service is used for searching a name, person or entity in the Dow Jones Risk Database. 
 */
public class DowJonesService
  extends ContextAwareSupport
  implements DowJones, NanoService
{
  protected DowJonesRestService dowJonesService = new DowJonesRestService();

  @Override
  public void start() {
    dowJonesService.setX(getX());
  }

  public BaseSearchResponse personNameSearch(X x, String firstName, String surName, Date filterLRDFrom) {
    try {
      DowJonesResponseMsg respMsg = null;
      DowJonesRequestMsg reqMsg = DowJonesRequestGenerator.getPersonNameSearchRequest(x, firstName, surName, filterLRDFrom);

      try {
        respMsg = dowJonesService.serve(reqMsg, DowJonesRestService.PERSON_NAME);
      } catch ( Throwable t ) {
        Logger logger = (Logger) x.get("logger");
        logger.error("Exception [Person Name Search]: " + t);
        throw new AuthenticationException("An error has occurred in an attempt to connect to Dow Jones");
      }

      int httpCode = respMsg.getHttpStatusCode();
      BaseSearchResponse feedback;
      if ( httpCode == 200 ) {
        BaseSearchResponse resp = (BaseSearchResponse) respMsg.getModel();
        feedback = resp;
      } else {
        feedback = (BaseSearchInvalidResponse) respMsg.getModel();
        Logger logger = (Logger) x.get("logger");
        logger.error("Dow Jones Person Name Search: [ HttpStatusCode: " + feedback.getHttpStatusCode() + " ]");
      }
      return feedback;
    } catch ( Throwable t ) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Dow Jones person name search error: [ " + t.toString() + " ].", t);
      throw new AuthenticationException("Dow Jones person name search failed");
    }
  }

  public BaseSearchResponse entityNameSearch(X x, String entityName, Date filterLRDFrom) {
    try {
      DowJonesResponseMsg respMsg = null;
      DowJonesRequestMsg reqMsg = DowJonesRequestGenerator.getEntityNameSearchRequest(x, entityName, filterLRDFrom);

      try {
        respMsg = dowJonesService.serve(reqMsg, DowJonesRestService.ENTITY_NAME);
      } catch ( Throwable t ) {
        Logger logger = (Logger) x.get("logger");
        logger.error("Exception [Entity Name Search]: " + t);
        throw new AuthenticationException("An error has occurred in an attempt to connect to Dow Jones");
      }

      int httpCode = respMsg.getHttpStatusCode();
      BaseSearchResponse feedback;
      if ( httpCode == 200 ) {
        BaseSearchResponse resp = (BaseSearchResponse) respMsg.getModel();
        feedback = resp;
      } else {
        feedback = (BaseSearchInvalidResponse) respMsg.getModel();
        Logger logger = (Logger) x.get("logger");
        logger.error("Dow Jones Entity Name Search: [ HttpStatusCode: " + feedback.getHttpStatusCode() + " ]");
      }
      return feedback;
    } catch ( Throwable t ) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Dow Jones entity name search error: [ " + t.toString() + " ].", t);
      throw new AuthenticationException("Dow Jones entity name search failed");
    }
  }

}