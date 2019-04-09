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
 * The DowJonesSearchService is used as a service that will be delegated into the Skeleton Box.
 * This service is used for searching a name, person or entity in the Dow Jones Risk Database. 
 */
public class DowJonesService
  extends ContextAwareSupport
  implements DowJonesSearch, NanoService
{
  protected DowJonesRestService dowJonesService = new DowJonesRestService();
  protected String sep = System.getProperty("file.separator");
  protected String storeRoot_ = System.getProperty("catalina.home") + sep + "webapps" + sep + "ROOT";

  @Override
  public void start() {
    dowJonesService.setX(getX());
  }

  // Add missing parameters for name search when finalized
  public BaseSearchResponse nameSearch(X x) {
    try {
      DowJonesResponseMsg respMsg = null;

      DowJonesRequestMsg reqMsg = null;
      //DowJonesRequestMsg reqMsg = DowJonesRequestGenerator.getNameSearchRequest(x);

      try {
        respMsg = dowJonesService.serve(reqMsg, DowJonesRestService.NAME_SEARCH);
      } catch ( Throwable t ) {
        Logger logger = (Logger) x.get("logger");
        logger.error("Exception [Name Search]: " + t);
        throw new AuthenticationException("An error has occurred in an attempt to connect to Dow Jones");
      }

      int httpCode = respMsg.getHttpStatusCode();
      BaseSearchResponse feedback;
      if ( httpCode == 200 ) {
        BaseSearchResponse resp = (BaseSearchResponse) respMsg.getModel();
        resp.setMatchs(resp.getMatchs());
        feedback = resp;
      } else {
        feedback = (BaseSearchInvalidResponse) respMsg.getModel();
        Logger logger = (Logger) x.get("logger");
        logger.error("Dow Jones Name Search: [ HttpStatusCode: " + feedback.getHttpStatusCode() + " ]");
      }
      return feedback;
    } catch ( Throwable t ) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Dow Jones name search error: [ " + t.toString() + " ].", t);
      throw new AuthenticationException("Dow Jones name search failed");
    }
  }

  // Add missing parameters for person name search when finalized
  public BaseSearchResponse personNameSearch(X x) {
    try {
      DowJonesResponseMsg respMsg = null;

      DowJonesRequestMsg reqMsg = null;
      //DowJonesRequestMsg reqMsg = DowJonesRequestGenerator.getPersonNameSearchRequest(x);

      try {
        respMsg = dowJonesService.serve(reqMsg, DowJonesRestService.PERSON_NAME_SEARCH);
      } catch ( Throwable t ) {
        Logger logger = (Logger) x.get("logger");
        logger.error("Exception [Person Name Search]: " + t);
        throw new AuthenticationException("An error has occurred in an attempt to connect to Dow Jones");
      }

      int httpCode = respMsg.getHttpStatusCode();
      BaseSearchResponse feedback;
      if ( httpCode == 200 ) {
        BaseSearchResponse resp = (BaseSearchResponse) respMsg.getModel();
        resp.setMatchs(resp.getMatchs());
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

  // Add missing parameters for entity name search when finalized
  public BaseSearchResponse entityNameSearch(X x) {
    try {
      DowJonesResponseMsg respMsg = null;

      DowJonesRequestMsg reqMsg = null;
      //DowJonesRequestMsg reqMsg = DowJonesRequestGenerator.getEntityNameSearchRequest(x);

      try {
        respMsg = dowJonesService.serve(reqMsg, DowJonesRestService.ENTITY_NAME_SEARCH);
      } catch ( Throwable t ) {
        Logger logger = (Logger) x.get("logger");
        logger.error("Exception [Entity Name Search]: " + t);
        throw new AuthenticationException("An error has occurred in an attempt to connect to Dow Jones");
      }

      int httpCode = respMsg.getHttpStatusCode();
      BaseSearchResponse feedback;
      if ( httpCode == 200 ) {
        BaseSearchResponse resp = (BaseSearchResponse) respMsg.getModel();
        resp.setMatchs(resp.getMatchs());
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

  // Add missing parameters for id type search when finalized
  public BaseSearchResponse idTypeSearch(X x) {
    try {
      DowJonesResponseMsg respMsg = null;

      DowJonesRequestMsg reqMsg = null;
      //DowJonesRequestMsg reqMsg = DowJonesRequestGenerator.getIdTypeSearchRequest(x);

      try {
        respMsg = dowJonesService.serve(reqMsg, DowJonesRestService.ID_TYPE_SEARCH);
      } catch ( Throwable t ) {
        Logger logger = (Logger) x.get("logger");
        logger.error("Exception [ID Type Search]: " + t);
        throw new AuthenticationException("An error has occurred in an attempt to connect to Dow Jones");
      }

      int httpCode = respMsg.getHttpStatusCode();
      BaseSearchResponse feedback;
      if ( httpCode == 200 ) {
        BaseSearchResponse resp = (BaseSearchResponse) respMsg.getModel();
        resp.setMatchs(resp.getMatchs());
        feedback = resp;
      } else {
        feedback = (BaseSearchInvalidResponse) respMsg.getModel();
        Logger logger = (Logger) x.get("logger");
        logger.error("Dow Jones ID Type Search: [ HttpStatusCode: " + feedback.getHttpStatusCode() + " ]");
      }
      return feedback;
    } catch ( Throwable t ) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Dow Jones id type search error: [ " + t.toString() + " ].", t);
      throw new AuthenticationException("Dow Jones id type search failed");
    }
  }

}