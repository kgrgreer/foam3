package net.nanopay.meter.compliance.dowJones;

import foam.core.X;

public class DowJonesRequestGenerator {

  public static DowJonesRequestMsg getPersonNameSearchRequest(X x, PersonNameSearchData searchData) {
    PersonNameSearchRequest request = new PersonNameSearchRequest();
    request.setFirstName(searchData.getFirstName());
    request.setSurName(searchData.getSurName());
    request.setFilterLRDFrom(searchData.getFilterLRDFrom());
    request.setDateOfBirth(searchData.getDateOfBirth());
    request.setFilterRegion(searchData.getFilterRegion());

    DowJonesRequestMsg msg = new DowJonesRequestMsg(x, request);
    msg.setHttpMethod("GET");
    msg.setRequestInfo("person-name?");
    return msg;
  }

  public static DowJonesRequestMsg getEntityNameSearchRequest(X x, EntityNameSearchData searchData) {
    EntityNameSearchRequest request = new EntityNameSearchRequest();
    request.setEntityName(searchData.getEntityName());
    request.setFilterLRDFrom(searchData.getFilterLRDFrom());
    request.setFilterRegion(searchData.getFilterRegion());

    DowJonesRequestMsg msg = new DowJonesRequestMsg(x, request);
    msg.setHttpMethod("GET");
    msg.setRequestInfo("entity-name?");
    return msg;
  }

}
