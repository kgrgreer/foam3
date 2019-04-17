package net.nanopay.meter.compliance.dowJones;

import foam.core.X;
import net.nanopay.meter.compliance.dowJones.*;
import java.util.Date;

public class DowJonesRequestGenerator {

  public static DowJonesRequestMsg getPersonNameSearchRequest(X x, String firstName, String surName, Date filterLRDFrom) {
    PersonNameSearchRequest request = new PersonNameSearchRequest();
    request.setFirstName(firstName);
    request.setSurName(surName);
    request.setFilterLRDFrom(filterLRDFrom);

    DowJonesRequestMsg msg = new DowJonesRequestMsg(x, request);
    msg.setHttpMethod("GET");
    msg.setRequestInfo("person-name?");
    return msg;
  }

  public static DowJonesRequestMsg getEntityNameSearchRequest(X x, String entityName, Date filterLRDFrom) {
    EntityNameSearchRequest request = new EntityNameSearchRequest();
    request.setEntityName(entityName);
    request.setFilterLRDFrom(filterLRDFrom);

    DowJonesRequestMsg msg = new DowJonesRequestMsg(x, request);
    msg.setHttpMethod("GET");
    msg.setRequestInfo("entity-name?");
    return msg;
  }

}
