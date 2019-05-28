package net.nanopay.meter.test;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.test.Test;
import net.nanopay.meter.compliance.dowJones.DowJonesResponse;
import net.nanopay.meter.compliance.dowJones.DowJonesMockService;
import net.nanopay.meter.compliance.dowJones.DowJonesService;
import net.nanopay.meter.compliance.dowJones.EntityNameSearchData;
import net.nanopay.meter.compliance.dowJones.PersonNameSearchData;

import java.util.Date;

import static foam.mlang.MLang.EQ;


public class DowJonesIntegrationTest extends Test {

  private DowJonesService dowJonesService_;
  User testUser_;
  X x_;

  @Override
  public void runTest(X x) {
    dowJonesService_ = (DowJonesService) x.get("dowJonesService");
    dowJonesService_.setDowJonesRestService(new DowJonesMockService());
    x_ = x;
    testUser_ = addUser("blakeDowJonesTest@dowjonestest.com");
    setUpTest();
  }

  private void setUpTest() {
    DowJonesResponse personNameObj;
    DowJonesResponse entityNameObj;
    PersonNameSearchData personSearchData = new PersonNameSearchData.Builder(x_)
      .setSearchId(testUser_.getId())
      .setFirstName(testUser_.getFirstName())
      .setSurName(testUser_.getLastName())
      .setFilterLRDFrom(new Date())
      .setDateOfBirth(new Date())
      .setFilterRegion("CA")
      .build();
    EntityNameSearchData entitySearchData = new EntityNameSearchData.Builder(x_)
      .setSearchId(testUser_.getId())
      .setEntityName(testUser_.getOrganization())
      .setFilterLRDFrom(new Date())
      .setFilterRegion("CA")
      .build();
    personNameObj = dowJonesService_.personNameSearch(x_, personSearchData);
    entityNameObj = dowJonesService_.entityNameSearch(x_, entitySearchData);
    test(personNameObj != null, "Dow Jones Person Response Object Created.");
    test(entityNameObj != null, "Dow Jones Entity Response Object Created.");
  }

  public User addUser(String email) {
    User user = (User) ((DAO) x_.get("localUserDAO")).find(EQ(User.EMAIL, email));
    if ( user == null ) {
      user = new User();
      user.setEmail(email);
      user.setFirstName("Blake");
      user.setLastName("Green");
      user.setEmailVerified(true);
      user.setOrganization("nanopay");
      user = (User) (((DAO) x_.get("localUserDAO")).put_(x_, user)).fclone();
    }
    return user;
  }

}
