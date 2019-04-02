package net.nanopay.meter.compliance.dowJones;

import foam.core.X;
import net.nanopay.meter.compliance.dowJones.model.*;
import net.nanopay.meter.compliance.dowJones.enums.*;
import java.util.Date;

public class DowJonesRequestGenerator {

  public static DowJonesRequestMsg getNameSearchRequest(X x, String name, ContentSet contentSet, RecordType recordType, SearchType searchType, 
  Date dateOfBirth, Boolean dateOfBirthStrict, Boolean excludeDeceased, Integer hitsFrom, Integer hitsTo, FilterRegionKeys filterRegionKeys, 
  String filterRegionKeysOperator, FilterRegion filterRegion, String filterRegionOperator, FilterPEP filterPEP, String filterPEPOperator, 
  Boolean filterPEPExcludeADSR, FilterSIC filterSIC, String filterSICOperator, FilterAMC filterAMC, String filterAMCOperator, FilterSL filterSL, 
  Boolean filterSLExcludeSuspended, String filterSLOperator, Date filterSLLRDFrom, Date filterSLLRDTo, FilterOOL filterOOL, Boolean filterOOLExcludeSuspended, 
  String filterOOLOperator, Date filterOOLLRDFrom, Date filterOOLLRDTo, FilterOEL filterOEL, Boolean filterOELExcludeSuspended, String filterOELOperator, 
  Date filterOELLRDFrom, Date filterOELLRDTo, FilterSOC filterSOC, Boolean filterSOCIncludeUnknown, Date filterLRDFrom, Date filterLRDTo) {

    NameSearchRequest request = new NameSearchRequest();
    request.setName(name);
    request.setContentSet(contentSet);
    request.setRecordType(recordType);
    request.setSearchType(searchType);
    request.setDateOfBirth(dateOfBirth);
    request.setDateOfBirthStrict(dateOfBirthStrict);
    request.setExcludeDeceased(excludeDeceased);
    request.setHitsFrom(hitsFrom);
    request.setHitsTo(hitsTo);
    request.setFilterRegionKeys(filterRegionKeys);
    request.setFilterRegionKeysOperator(filterRegionKeysOperator);
    request.setFilterRegion(filterRegion);
    request.setFilterRegionOperator(filterRegionOperator);
    request.setFilterPEP(filterPEP);
    request.setFilterPEPOperator(filterPEPOperator);
    request.setFilterPEPExcludeADSR(filterPEPExcludeADSR);
    request.setFilterSIC(filterSIC);
    request.setFilterSICOperator(filterSICOperator);
    request.setFilterAMC(filterAMC);
    request.setFilterAMCOperator(filterAMCOperator);
    request.setFilterSL(filterSL);
    request.setFilterSLExcludeSuspended(filterSLExcludeSuspended);
    request.setFilterSLOperator(filterSLOperator);
    request.setFilterSLLRDFrom(filterSLLRDFrom);
    request.setFilterSLLRDTo(filterSLLRDTo);
    request.setFilterOOL(filterOOL);
    request.setFilterOOLExcludeSuspended(filterOOLExcludeSuspended);
    request.setFilterOOLOperator(filterOOLOperator);
    request.setFilterOOLLRDFrom(filterOOLLRDFrom);
    request.setFilterOOLLRDTo(filterOOLLRDTo);
    request.setFilterOEL(filterOEL);
    request.setFilterOELExcludeSuspended(filterOELExcludeSuspended);
    request.setFilterOELOperator(filterOELOperator);
    request.setFilterOELLRDFrom(filterOELLRDFrom);
    request.setFilterOELLRDTo(filterOELLRDTo);
    request.setFilterSOC(filterSOC);
    request.setFilterSOCIncludeUnknown(filterSOCIncludeUnknown);
    request.setFilterLRDFrom(filterLRDFrom);
    request.setFilterLRDTo(filterLRDTo);

    DowJonesRequestMsg msg = new DowJonesRequestMsg(x, request);
    msg.setHttpMethod("GET");
    msg.setRequestInfo("name?");
    return msg;
  }

  public static DowJonesRequestMsg getPersonNameSearchRequest(X x, ContentSet contentSet, SearchType searchType, String firstName, String middleName, 
  String surName, Date dateOfBirth, Boolean dateOfBirthStrict, Boolean excludeDeceased, Integer hitsFrom, Integer hitsTo, FilterRegionKeys filterRegionKeys, 
  String filterRegionKeysOperator, FilterRegion filterRegion, String filterRegionOperator, FilterPEP filterPEP, String filterPEPOperator, 
  Boolean filterPEPExcludeADSR, FilterSIC filterSIC, String filterSICOperator, FilterAMC filterAMC, String filterAMCOperator, FilterSL filterSL, 
  Boolean filterSLExcludeSuspended, String filterSLOperator, Date filterSLLRDFrom, Date filterSLLRDTo, FilterOOL filterOOL, Boolean filterOOLExcludeSuspended, 
  String filterOOLOperator, Date filterOOLLRDFrom, Date filterOOLLRDTo, FilterOEL filterOEL, Boolean filterOELExcludeSuspended, String filterOELOperator, 
  Date filterOELLRDFrom, Date filterOELLRDTo, FilterSOC filterSOC, Boolean filterSOCIncludeUnknown, Date filterLRDFrom, Date filterLRDTo) {

    PersonNameSearchRequest request = new PersonNameSearchRequest();
    request.setContentSet(contentSet);
    request.setSearchType(searchType);
    request.setFirstName(firstName);
    request.setMiddleName(middleName);
    request.setSurName(surName);
    request.setDateOfBirth(dateOfBirth);
    request.setDateOfBirthStrict(dateOfBirthStrict);
    request.setExcludeDeceased(excludeDeceased);
    request.setHitsFrom(hitsFrom);
    request.setHitsTo(hitsTo);
    request.setFilterRegionKeys(filterRegionKeys);
    request.setFilterRegionKeysOperator(filterRegionKeysOperator);
    request.setFilterRegion(filterRegion);
    request.setFilterRegionOperator(filterRegionOperator);
    request.setFilterPEP(filterPEP);
    request.setFilterPEPOperator(filterPEPOperator);
    request.setFilterPEPExcludeADSR(filterPEPExcludeADSR);
    request.setFilterSIC(filterSIC);
    request.setFilterSICOperator(filterSICOperator);
    request.setFilterAMC(filterAMC);
    request.setFilterAMCOperator(filterAMCOperator);
    request.setFilterSL(filterSL);
    request.setFilterSLExcludeSuspended(filterSLExcludeSuspended);
    request.setFilterSLOperator(filterSLOperator);
    request.setFilterSLLRDFrom(filterSLLRDFrom);
    request.setFilterSLLRDTo(filterSLLRDTo);
    request.setFilterOOL(filterOOL);
    request.setFilterOOLExcludeSuspended(filterOOLExcludeSuspended);
    request.setFilterOOLOperator(filterOOLOperator);
    request.setFilterOOLLRDFrom(filterOOLLRDFrom);
    request.setFilterOOLLRDTo(filterOOLLRDTo);
    request.setFilterOEL(filterOEL);
    request.setFilterOELExcludeSuspended(filterOELExcludeSuspended);
    request.setFilterOELOperator(filterOELOperator);
    request.setFilterOELLRDFrom(filterOELLRDFrom);
    request.setFilterOELLRDTo(filterOELLRDTo);
    request.setFilterSOC(filterSOC);
    request.setFilterSOCIncludeUnknown(filterSOCIncludeUnknown);
    request.setFilterLRDFrom(filterLRDFrom);
    request.setFilterLRDTo(filterLRDTo);

    DowJonesRequestMsg msg = new DowJonesRequestMsg(x, request);
    msg.setHttpMethod("GET");
    msg.setRequestInfo("person-name?");
    return msg;
  }

  public static DowJonesRequestMsg getEntityNameSearchRequest(X x, ContentSet contentSet, SearchType searchType, String entityName, Integer hitsFrom, 
  Integer hitsTo, FilterRegionKeys filterRegionKeys, String filterRegionKeysOperator, FilterRegion filterRegion, String filterRegionOperator, FilterPEP filterPEP, 
  String filterPEPOperator, Boolean filterPEPExcludeADSR, FilterSIC filterSIC, String filterSICOperator, FilterAMC filterAMC, String filterAMCOperator, 
  FilterSL filterSL, Boolean filterSLExcludeSuspended, String filterSLOperator, Date filterSLLRDFrom, Date filterSLLRDTo, FilterOOL filterOOL, 
  Boolean filterOOLExcludeSuspended, String filterOOLOperator, Date filterOOLLRDFrom, Date filterOOLLRDTo, FilterOEL filterOEL, Boolean filterOELExcludeSuspended, 
  String filterOELOperator, Date filterOELLRDFrom, Date filterOELLRDTo, FilterSOC filterSOC, Boolean filterSOCIncludeUnknown, Date filterLRDFrom, Date filterLRDTo) {

    EntityNameSearchRequest request = new EntityNameSearchRequest();
    request.setContentSet(contentSet);
    request.setSearchType(searchType);
    request.setEntityName(entityName);
    request.setHitsFrom(hitsFrom);
    request.setHitsTo(hitsTo);
    request.setFilterRegionKeys(filterRegionKeys);
    request.setFilterRegionKeysOperator(filterRegionKeysOperator);
    request.setFilterRegion(filterRegion);
    request.setFilterRegionOperator(filterRegionOperator);
    request.setFilterPEP(filterPEP);
    request.setFilterPEPOperator(filterPEPOperator);
    request.setFilterPEPExcludeADSR(filterPEPExcludeADSR);
    request.setFilterSIC(filterSIC);
    request.setFilterSICOperator(filterSICOperator);
    request.setFilterAMC(filterAMC);
    request.setFilterAMCOperator(filterAMCOperator);
    request.setFilterSL(filterSL);
    request.setFilterSLExcludeSuspended(filterSLExcludeSuspended);
    request.setFilterSLOperator(filterSLOperator);
    request.setFilterSLLRDFrom(filterSLLRDFrom);
    request.setFilterSLLRDTo(filterSLLRDTo);
    request.setFilterOOL(filterOOL);
    request.setFilterOOLExcludeSuspended(filterOOLExcludeSuspended);
    request.setFilterOOLOperator(filterOOLOperator);
    request.setFilterOOLLRDFrom(filterOOLLRDFrom);
    request.setFilterOOLLRDTo(filterOOLLRDTo);
    request.setFilterOEL(filterOEL);
    request.setFilterOELExcludeSuspended(filterOELExcludeSuspended);
    request.setFilterOELOperator(filterOELOperator);
    request.setFilterOELLRDFrom(filterOELLRDFrom);
    request.setFilterOELLRDTo(filterOELLRDTo);
    request.setFilterSOC(filterSOC);
    request.setFilterSOCIncludeUnknown(filterSOCIncludeUnknown);
    request.setFilterLRDFrom(filterLRDFrom);
    request.setFilterLRDTo(filterLRDTo);

    DowJonesRequestMsg msg = new DowJonesRequestMsg(x, request);
    msg.setHttpMethod("GET");
    msg.setRequestInfo("entity-name?");
    return msg;
  }

  public static DowJonesRequestMsg getIDTypeSearchRequest(X x, ContentSet contentSet, RecordType recordType, Boolean excludeDeceased, IDTypeKey idTypeKey, String idTypeValue, 
  Integer hitsFrom, Integer hitsTo, FilterRegionKeys filterRegionKeys, String filterRegionKeysOperator, FilterRegion filterRegion, String filterRegionOperator, 
  FilterPEP filterPEP, String filterPEPOperator, Boolean filterPEPExcludeADSR, FilterSIC filterSIC, String filterSICOperator, FilterAMC filterAMC, String filterAMCOperator, 
  FilterSL filterSL, Boolean filterSLExcludeSuspended, String filterSLOperator, Date filterSLLRDFrom, Date filterSLLRDTo, FilterOOL filterOOL, Boolean filterOOLExcludeSuspended, 
  String filterOOLOperator, Date filterOOLLRDFrom, Date filterOOLLRDTo, FilterOEL filterOEL, Boolean filterOELExcludeSuspended, String filterOELOperator, Date filterOELLRDFrom, 
  Date filterOELLRDTo, FilterSOC filterSOC, Boolean filterSOCIncludeUnknown, Date filterLRDFrom, Date filterLRDTo) {

    IDTypeSearchRequest request = new IDTypeSearchRequest();
    request.setContentSet(contentSet);
    request.setRecordType(recordType);
    request.setExcludeDeceased(excludeDeceased);
    request.setIdTypeKey(idTypeKey);
    request.setIdTypeValue(idTypeValue);
    request.setHitsFrom(hitsFrom);
    request.setHitsTo(hitsTo);
    request.setFilterRegionKeys(filterRegionKeys);
    request.setFilterRegionKeysOperator(filterRegionKeysOperator);
    request.setFilterRegion(filterRegion);
    request.setFilterRegionOperator(filterRegionOperator);
    request.setFilterPEP(filterPEP);
    request.setFilterPEPOperator(filterPEPOperator);
    request.setFilterPEPExcludeADSR(filterPEPExcludeADSR);
    request.setFilterSIC(filterSIC);
    request.setFilterSICOperator(filterSICOperator);
    request.setFilterAMC(filterAMC);
    request.setFilterAMCOperator(filterAMCOperator);
    request.setFilterSL(filterSL);
    request.setFilterSLExcludeSuspended(filterSLExcludeSuspended);
    request.setFilterSLOperator(filterSLOperator);
    request.setFilterSLLRDFrom(filterSLLRDFrom);
    request.setFilterSLLRDTo(filterSLLRDTo);
    request.setFilterOOL(filterOOL);
    request.setFilterOOLExcludeSuspended(filterOOLExcludeSuspended);
    request.setFilterOOLOperator(filterOOLOperator);
    request.setFilterOOLLRDFrom(filterOOLLRDFrom);
    request.setFilterOOLLRDTo(filterOOLLRDTo);
    request.setFilterOEL(filterOEL);
    request.setFilterOELExcludeSuspended(filterOELExcludeSuspended);
    request.setFilterOELOperator(filterOELOperator);
    request.setFilterOELLRDFrom(filterOELLRDFrom);
    request.setFilterOELLRDTo(filterOELLRDTo);
    request.setFilterSOC(filterSOC);
    request.setFilterSOCIncludeUnknown(filterSOCIncludeUnknown);
    request.setFilterLRDFrom(filterLRDFrom);
    request.setFilterLRDTo(filterLRDTo);

    DowJonesRequestMsg msg = new DowJonesRequestMsg(x, request);
    msg.setHttpMethod("GET");
    msg.setRequestInfo("id-type?");
    return msg;
  }

}
