package net.nanopay.meter.compliance.dowJones;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.NanoService;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.approval.ApprovalStatus;
import foam.nanos.pm.PM;
import net.nanopay.meter.compliance.dowJones.EntityNameSearchData;
import net.nanopay.meter.compliance.dowJones.PersonNameSearchData;
import net.nanopay.model.BeneficialOwner;

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

  // To perform search on entity of type User
  public DowJonesResponse personNameSearch(X x, PersonNameSearchData searchData) {
    var pm = new PM(DowJonesService.class.getSimpleName(), "personNameSearch");

    try {
      DowJonesResponseMsg respMsg = null;
      DowJonesRequestMsg reqMsg = DowJonesRequestGenerator.getPersonNameSearchRequest(x, searchData);

      try {
        respMsg = dowJonesRestService.serve(reqMsg, DowJonesRestService.PERSON_NAME);
      } catch ( Throwable t ) {
        Logger logger = (Logger) x.get("logger");
        logger.error("Exception [Dow Jones User Person Name Search]: " + t);
        throw new AuthenticationException("An error has occurred in an attempt to connect to Dow Jones: [ " + t.toString() + " ].");
      }

      int httpCode = respMsg.getHttpStatusCode();
      DowJonesResponse feedback;
      if ( httpCode == 200 ) {
        DowJonesResponse resp = (DowJonesResponse) respMsg.getModel();
        User user = (User) ((DAO) x.get("localUserDAO")).find(searchData.getSearchId());
        feedback = resp;
        resp.setSpid(user != null ? user.getSpid() : "nanopay");
        resp.setSearchType("Dow Jones User");
        resp.setNameSearched(searchData.getFirstName() + " " + searchData.getSurName());
        resp.setUserId(searchData.getSearchId());
        resp.setSearchDate(new Date());
        resp.setDaoKey("userDAO");
        if ( resp.getTotalMatches() == 0 ) {
          resp.setStatus(ApprovalStatus.APPROVED);
        }
        dowJonesResponseDAO_.put(resp);
      } else {
        feedback = (DowJonesInvalidResponse) respMsg.getModel();
        Logger logger = (Logger) x.get("logger");
        logger.error("Dow Jones User Person Name Search: [ HttpStatusCode: " + feedback.getHttpStatusCode() + " ]");
      }
      return feedback;
    } catch ( Throwable t ) {
      pm.error(x, t.getMessage());
      Logger logger = (Logger) x.get("logger");
      logger.error("Dow Jones User Person name search error: [ " + t.toString() + " ].", t);
      throw new AuthenticationException("Dow Jones User person name search failed: [ " + t.toString() + " ].");
    } finally {
      pm.log(x);
    }
  }

  // To perform search on entity of type BeneficialOwner
  public DowJonesResponse beneficialOwnerNameSearch(X x, PersonNameSearchData searchData) {
    var pm = new PM(DowJonesService.class.getSimpleName(), "beneficialOwnerNameSearch");

    try {
      DowJonesResponseMsg respMsg = null;
      DowJonesRequestMsg reqMsg = DowJonesRequestGenerator.getPersonNameSearchRequest(x, searchData);

      try {
        respMsg = dowJonesRestService.serve(reqMsg, DowJonesRestService.PERSON_NAME);
      } catch ( Throwable t ) {
        Logger logger = (Logger) x.get("logger");
        logger.error("Exception [Dow Jones Beneficial Owner Person Name Search]: " + t);
        throw new AuthenticationException("An error has occurred in an attempt to connect to Dow Jones: [ " + t.toString() + " ].");
      }

      int httpCode = respMsg.getHttpStatusCode();
      DowJonesResponse feedback;
      if ( httpCode == 200 ) {
        DowJonesResponse resp = (DowJonesResponse) respMsg.getModel();
        BeneficialOwner owner = (BeneficialOwner) ((DAO) x.get("beneficialOwnerDAO")).find(searchData.getSearchId());
        feedback = resp;
        resp.setSpid(owner != null ? owner.getSpid() : "nanopay");
        resp.setSearchType("Dow Jones Beneficial Owner");
        resp.setNameSearched(searchData.getFirstName() + " " + searchData.getSurName());
        resp.setUserId(searchData.getSearchId());
        resp.setSearchDate(new Date());
        resp.setDaoKey("beneficialOwnerDAO");
        dowJonesResponseDAO_.put(resp);
      } else {
        feedback = (DowJonesInvalidResponse) respMsg.getModel();
        Logger logger = (Logger) x.get("logger");
        logger.error("Dow Jones Person Name Search: [ HttpStatusCode: " + feedback.getHttpStatusCode() + " ]");
      }
      return feedback;
    } catch ( Throwable t ) {
      pm.error(x, t.getMessage());
      Logger logger = (Logger) x.get("logger");
      logger.error("Dow Jones Beneficial Owner Person name search error: [ " + t.toString() + " ].", t);
      throw new AuthenticationException("Dow Jones beneficial owner person name search failed: [ " + t.toString() + " ].");
    } finally {
      pm.log(x);
    }
  }

  // To perform search on entity of type Business
  public DowJonesResponse entityNameSearch(X x, EntityNameSearchData searchData) {
    var pm = new PM(DowJonesService.class.getSimpleName(), "entityNameSearch");

    try {
      DowJonesResponseMsg respMsg = null;
      DowJonesRequestMsg reqMsg = DowJonesRequestGenerator.getEntityNameSearchRequest(x, searchData);

      try {
        respMsg = dowJonesRestService.serve(reqMsg, DowJonesRestService.ENTITY_NAME);
      } catch ( Throwable t ) {
        Logger logger = (Logger) x.get("logger");
        logger.error("Exception [Entity Name Search]: " + t);
        throw new AuthenticationException("An error has occurred in an attempt to connect to Dow Jones: [ " + t.toString() + " ]." );
      }

      int httpCode = respMsg.getHttpStatusCode();
      DowJonesResponse feedback;
      if ( httpCode == 200 ) {
        DowJonesResponse resp = (DowJonesResponse) respMsg.getModel();
        User user = (User) ((DAO) x.get("localUserDAO")).find(searchData.getSearchId());
        feedback = resp;
        resp.setSpid(user != null ? user.getSpid() : "nanopay");
        resp.setSearchType("Dow Jones Entity");
        resp.setNameSearched(searchData.getEntityName());
        resp.setUserId(searchData.getSearchId());
        resp.setSearchDate(new Date());
        resp.setDaoKey("businessDAO");
        dowJonesResponseDAO_.put(resp);
      } else {
        feedback = (DowJonesInvalidResponse) respMsg.getModel();
        Logger logger = (Logger) x.get("logger");
        logger.error("Dow Jones Entity Name Search: [ HttpStatusCode: " + feedback.getHttpStatusCode() + " ]");
      }
      return feedback;
    } catch ( Throwable t ) {
      pm.error(x, t.getMessage());
      Logger logger = (Logger) x.get("logger");
      logger.error("Dow Jones entity name search error: [ " + t.toString() + " ].", t);
      throw new AuthenticationException("Dow Jones entity name search failed: [ " + t.toString() + " ].");
    } finally {
      pm.log(x);
    }
  }

  public void setDowJonesRestService(DowJonesRestInterface dowJonesRestService) {
    this.dowJonesRestService = dowJonesRestService;
  }
}
