/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package net.nanopay.fx.afex;

import foam.core.*;
import foam.dao.*;
import foam.nanos.auth.*;
import foam.nanos.crunch.*;
import foam.nanos.crunch.connection.CapabilityPayload;
import java.util.*;
import net.nanopay.country.br.*;
import net.nanopay.crunch.acceptanceDocuments.capabilities.USDAFEXTerms;
import net.nanopay.crunch.bepay.*;
import net.nanopay.crunch.registration.UserDetailData;
import net.nanopay.fx.afex.*;
import static foam.mlang.MLang.*;
import net.nanopay.crunch.document.*;

public class BePayAFEXOnboardingTest extends foam.nanos.test.Test {
  public void runTest(X x) {
    DAO capabilityDAO = (DAO) x.get("localCapabilityDAO");
    DAO userCapabilityJunctionDAO = (DAO) x.get("bareUserCapabilityJunctionDAO");
    DAO capabilityPayloadDAO = (DAO) x.get("capabilityPayloadDAO");
    DAO userDAO = (DAO) x.get("bareUserDAO");
    DAO afexUserDAO = (DAO) x.get("afexUserDAO");
    AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
    AFEXService afexService = new AFEXService(x);

    User user = new User.Builder(x).setId(888L).setSpid("bepay").setGroup("bepay-sme").build();
    user = (User) userDAO.put(user);

    X userX = (X) x.put("subject", new Subject.Builder(x).setUser(user).setUser(user).build());

    Address address = new Address.Builder(x)
      .setAddress1("123 king st")
      .setCountryId("CA")
      .setRegionId("ON")
      .setCity("Toronto")
      .setStructured(false)
      .setPostalCode("M1M1M1")
      .build();
    UserDetailData userDetails = new UserDetailData.Builder(x)
      .setFirstName("testFirstName")
      .setLastName("testLastName")
      .setPhoneNumber("1234567890")
      .setAddress(address)
      .build();
    ExtendedUserDetailsData extendedDetails = new ExtendedUserDetailsData.Builder(x)
      .setMothersMaidenName("maidenname")
      .build();
    CPF cpf = new CPF.Builder(x)
      .setData("10786348070")
      .setCpfName("Mock Legal User")
      .setBirthday(new GregorianCalendar(1970, 1, 1).getTime())
      .setVerifyName(true)
      .build();
    DateOfIssue dateOfIssue = new DateOfIssue.Builder(x)
      .setDateOfIssue(new GregorianCalendar(2019, 1, 1).getTime())
      .build();

    USDAFEXTerms usdAfexTerms = new USDAFEXTerms.Builder(x).setAgreement(true).build();

    HashMap dataMap = new HashMap<String, FObject>();
    dataMap.put("User Details", userDetails);
    dataMap.put("Extended User Details", extendedDetails);
    dataMap.put("CPF Number", cpf);
    dataMap.put("Date of Issue", dateOfIssue);
    dataMap.put("AFEX Terms and Conditions", usdAfexTerms);

    CapabilityPayload userCapabilityData = new CapabilityPayload.Builder(x)
      .setId("BF58A50D-70F5-45CB-A79A-AF18C1D6F685")
      .setCapabilityDataObjects(dataMap)
      .build();

    boolean threw = false;
    String message = "";
    java.lang.Exception ex = null;
    try {
      userCapabilityData = (CapabilityPayload) capabilityPayloadDAO.inX(userX).put(userCapabilityData);
    } catch (java.lang.Exception e) {
      threw = true;
      message = e.getMessage();
      ex = e;
    }
    // test if capabilitypayload submitted sucessfully
    test(! threw, "ERROR : " + message + ex);

    // test if onboarding ucj is granted
    UserCapabilityJunction ucj = (UserCapabilityJunction) userCapabilityJunctionDAO.find(AND(
      EQ(UserCapabilityJunction.SOURCE_ID, user.getId()),
      EQ(UserCapabilityJunction.TARGET_ID, "BF58A50D-70F5-45CB-A79A-AF18C1D6F685")
    ));
    test(ucj != null && ucj.getStatus() == CapabilityJunctionStatus.GRANTED, "onboarding ucj is granted");

    // test rule to create afexuser once onboarding uvjs granted
    AFEXUser afexUser = (AFEXUser) afexUserDAO.find(EQ(AFEXUser.USER, user.getId()));
    test(afexUser != null, "AFEX User created");

    // check client status
    String status = afexServiceProvider.getClientAccountStatus(afexUser);
    test(status != null, "account status returned: " + status);

    // test rule to set user compliance once onboarding ucjs granted
    user = (User) userDAO.find(user.getId());
    test(user.getCompliance() == net.nanopay.admin.model.ComplianceStatus.PASSED, "user compliance passed");

    // try retrieving the client
    RetrieveClientAccountDetailsResponse accountDetails = afexService.retrieveClientAccountDetails(afexUser.getApiKey(), "bepay");
    test(accountDetails != null, "accountdetails retrieved: " + accountDetails);
  }
}
