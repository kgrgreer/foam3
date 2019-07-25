/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package net.nanopay.bank;

import foam.core.X;
import foam.core.FObject;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import static foam.mlang.MLang.EQ;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;

import net.nanopay.payment.Institution;
import net.nanopay.tx.Transfer;

import java.util.List;

/**
 * Create an Institution if match does not exist.
 * This DAO simplifies mobile bank account additions. The mobile
 * UX provides for bank institution number but not institution
 * lookup.  When an institution is created a NOC Notification
 * is created requesting it be verified.
 */
public class BankAccountInstitutionDAO
  extends ProxyDAO
{
  public BankAccountInstitutionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  public FObject put_(X x, FObject obj) {
    if ( ! ( obj instanceof BankAccount ) ) {
      return super.put_(x, obj);
    }

    BankAccount bankAccount = (BankAccount) obj;
    Institution institution = bankAccount.findInstitution(x);
    if ( institution == null && ! foam.util.SafetyUtil.isEmpty(bankAccount.getInstitutionNumber()) ) {
      DAO institutionDAO = (DAO) x.get("institutionDAO");
      List institutions = ((ArraySink) institutionDAO
                           .where(
                                  EQ(Institution.INSTITUTION_NUMBER, bankAccount.getInstitutionNumber())
                                  )
                           .select(new ArraySink())).getArray();

      if ( institutions.size() == 0 ) {
        institution = new Institution();
        institution.setName(bankAccount.getInstitutionNumber());
        institution.setInstitutionNumber(bankAccount.getInstitutionNumber());
        institution = (Institution) institutionDAO.put(institution);
      } else {
        institution = (Institution) institutions.get(0);
      }
      bankAccount.setInstitution(institution.getId());
      bankAccount = (BankAccount) getDelegate().put_(x, bankAccount);

      if ( institutions.size() == 0 ) {
        String message = "Institution verification required on institution: "+institution.getId()+"\n Created from BankAccount: "+bankAccount.getId();
        Notification notification = new Notification.Builder(x)
          .setTemplate("NOC")
          .setBody(message)
          .build();
        new Transfer.Builder(x).build();
        ((DAO) x.get("localNotificationDAO")).put(notification);
        ((Logger) x.get("logger")).warning(this.getClass().getSimpleName(), message);
     } else if ( institutions.size() > 1 ) {
        String message = "Multiple Institutions found for institutionNumber: "+bankAccount.getInstitution()+". Using "+institution.getId()+" on BankAccount: "+bankAccount.getId();
        Notification notification = new Notification.Builder(x)
          .setTemplate("NOC")
          .setBody(message)
          .build();
        ((DAO) x.get("localNotificationDAO")).put(notification);
        ((Logger) x.get("logger")).warning(this.getClass().getSimpleName(), message);
        ((Logger) x.get("logger")).debug(this.getClass().getSimpleName(), "institutions", institutions);
      }
      return bankAccount;
    } else {
      return getDelegate().put_(x, obj);
    }
  }
}
