package net.nanopay.meter.compliance.dowJones;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.NanoService;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.logger.Logger;

import java.util.Date;

/**
 * The DowJonesService is used as a service that will be delegated into the Skeleton Box.
 * This service is used for searching a name, person or entity in the Dow Jones Risk Database.
 */
public class DowJonesService
  extends ContextAwareSupport
  implements DowJones, NanoService
{
  protected DAO dowJonesResponseDAO_;
  protected DowJonesRestInterface dowJonesRestService;

  @Override
  public void start() {
    setDowJonesRestService(new DowJonesRestService());
    dowJonesResponseDAO_ = (DAO) getX().get("dowJonesResponseDAO");
    ((DowJonesRestService) dowJonesRestService).setX(getX());
  }

  public BaseSearchResponse personNameSearch(X x, String firstName, String surName, Date filterLRDFrom) {
    try {
      DowJonesResponseMsg respMsg = null;
      DowJonesRequestMsg reqMsg = DowJonesRequestGenerator.getPersonNameSearchRequest(x, firstName, surName, filterLRDFrom);

      try {
        respMsg = dowJonesRestService.serve(reqMsg, DowJonesRestService.PERSON_NAME);
      } catch ( Throwable t ) {
        Logger logger = (Logger) x.get("logger");
        logger.error("Exception [Person Name Search]: " + t);
        throw new AuthenticationException("An error has occurred in an attempt to connect to Dow Jones: [ " + t.toString() + " ].");
      }

      int httpCode = respMsg.getHttpStatusCode();
      BaseSearchResponse feedback;
      if ( httpCode == 200 ) {
        BaseSearchResponse resp = (BaseSearchResponse) respMsg.getModel();
        feedback = resp;
        resp.setSearchType("Dow Jones Person");
        resp.setNameSearched(firstName + " " + surName);
        dowJonesResponseDAO_.put(resp);
      } else {
        feedback = (BaseSearchInvalidResponse) respMsg.getModel();
        Logger logger = (Logger) x.get("logger");
        logger.error("Dow Jones Person Name Search: [ HttpStatusCode: " + feedback.getHttpStatusCode() + " ]");
      }
      return feedback;
    } catch ( Throwable t ) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Dow Jones person name search error: [ " + t.toString() + " ].", t);
      throw new AuthenticationException("Dow Jones person name search failed: [ " + t.toString() + " ].");
    }
  }

  public BaseSearchResponse entityNameSearch(X x, String entityName, Date filterLRDFrom) {
    try {
      DowJonesResponseMsg respMsg = null;
      DowJonesRequestMsg reqMsg = DowJonesRequestGenerator.getEntityNameSearchRequest(x, entityName, filterLRDFrom);

      try {
        respMsg = dowJonesRestService.serve(reqMsg, DowJonesRestService.ENTITY_NAME);
      } catch ( Throwable t ) {
        Logger logger = (Logger) x.get("logger");
        logger.error("Exception [Entity Name Search]: " + t);
        throw new AuthenticationException("An error has occurred in an attempt to connect to Dow Jones: [ " + t.toString() + " ]." );
      }

      int httpCode = respMsg.getHttpStatusCode();
      BaseSearchResponse feedback;
      if ( httpCode == 200 ) {
        BaseSearchResponse resp = (BaseSearchResponse) respMsg.getModel();
        feedback = resp;
        resp.setSearchType("Dow Jones Entity");
        resp.setNameSearched(entityName);
        dowJonesResponseDAO_.put(resp);
      } else {
        feedback = (BaseSearchInvalidResponse) respMsg.getModel();
        Logger logger = (Logger) x.get("logger");
        logger.error("Dow Jones Entity Name Search: [ HttpStatusCode: " + feedback.getHttpStatusCode() + " ]");
      }
      return feedback;
    } catch ( Throwable t ) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Dow Jones entity name search error: [ " + t.toString() + " ].", t);
      throw new AuthenticationException("Dow Jones entity name search failed: [ " + t.toString() + " ].");
    }
  }

  public void setDowJonesRestService(DowJonesRestInterface dowJonesRestService) {
    this.dowJonesRestService = dowJonesRestService;
  }
}
