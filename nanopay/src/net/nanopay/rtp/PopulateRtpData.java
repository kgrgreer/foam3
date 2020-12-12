/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

package net.nanopay.rtp;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.session.Session;
import net.nanopay.account.Account;
import net.nanopay.bank.CABankAccount;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

public class PopulateRtpData {

  public void populate(X x) {
    DAO userDAO = (DAO) x.get("localUserDAO");
    DAO rtpDAO = (DAO) x.get("requestToPayDAO");
    DAO sessionDAO = (DAO) x.get("localSessionDAO");
    List userList = new ArrayList<UserRTPModel>(Arrays.asList(
      new UserRTPModel("Simon", "Test", "tester",
        "nanopay Inc.", "simon@nanopay.net", 5000000000L, new Date()),
      new UserRTPModel("Laurence", "Cooke", "Founder and CEO",
        "nanopay Inc.", "laurence@nanopay.net", 5000000L, new Date()),
      new UserRTPModel("Ben", "Harrison", "Partner, Head of Partnerships and Policy",
        "Portag3 Ventures", "bharrison@p3vc.com", 5000000L, new Date()),
      new UserRTPModel("Shirley", "Matthew","VP Payment and Card Products",
      "Peoples Group","ShirleyM@peoplesgroup.com", 5000000L, new Date()),
      new UserRTPModel("Harinder", "Takhar","CEO",
        "Paytm Labs", "harinder@paytm.com", 5000000L, new Date()),
      new UserRTPModel("Kristen", "Wilson", "Director, Client Solutions & Business Development",
        "Celero Solutions", "Kristen.Wilson@celero.ca", 5000000L, new Date()),
      new UserRTPModel("Robert", "Hyde", "President",
        "Payment Source", "rhyde@paymentsource.ca", 1000000L, new Date()),
      new UserRTPModel("Daniel", "Eberhard", "Founder and CEO",
        "Koho", "Daniel@koho.ca", 1000000L, new Date()),
      new UserRTPModel("Marcus", "Dagenais", "President",
        "Payroc", "Marcus.dagenais@payroc.com", 1000000L, new Date())
    ));

    userList.forEach((u) -> {
      User user = new User();
      user.setFirstName(((UserRTPModel) u).firstName_);
      user.setLastName(((UserRTPModel) u).lastName_);
      user.setOrganization(((UserRTPModel) u).organization_);
      user.setEmail(((UserRTPModel) u).email_);
      user.setGroup("rtp");
      user = (User) userDAO.put_(x, user);

      Session session = new Session();
      session.setUserId(user.getId());
      session.setRemoteHost(" ");
      session.setTtl(5184000000L); // 60 days * 24 hours * 60 min * 60 sec * 1000 millis
      sessionDAO.put_(x, session);

      RequestToPay rtp = new RequestToPay();
      rtp.setAmount(((UserRTPModel) u).amount_);
      rtp.setPayer(user.getId());
      rtp.setDestinationAccount("66");
      rtpDAO.put_(x, rtp);
    });
  }
}

class UserRTPModel {
  protected String lastName_;
  protected String firstName_;
  protected String organization_;
  protected String role_;
  protected String email_;
  protected Long amount_;
  protected Date due_;

  public UserRTPModel(String firstName, String lastName, String role,
                      String organization, String email, Long amount, Date due) {
    lastName_ = lastName;
    firstName_ = firstName;
    organization_ = organization;
    role_ = role;
    email_ = email;
    amount_ = amount;
    due_ = due;
  }
}