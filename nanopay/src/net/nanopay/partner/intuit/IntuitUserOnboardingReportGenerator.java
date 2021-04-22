/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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


package net.nanopay.partner.intuit;

import foam.core.FObject;
import foam.core.X;
import foam.nanos.auth.User;
import foam.nanos.crunch.CapabilityJunctionStatus;
import foam.nanos.crunch.CrunchService;
import net.nanopay.model.Business;
import net.nanopay.reporting.ReportGenerator;
import net.nanopay.reporting.UserOnboardingReport;

import javax.annotation.Nonnull;
import java.util.Calendar;

public class IntuitUserOnboardingReportGenerator extends ReportGenerator {

  @Override
  public UserOnboardingReport generate(X x, @Nonnull FObject src) {
    var user = (User) src;

    var group = user.getGroup();
    if ( ! ( user instanceof Business) && ( ! group.equals("intuit-sme") && ! group.equals("intuit-business-sme") ) )
      return null;

    var crunchService = (CrunchService) x.get("crunchService");

    var cor = new UserOnboardingReport();
    cor = new UserOnboardingReport();

    cor.setCreated(Calendar.getInstance().getTime());
    cor.setLastModified(Calendar.getInstance().getTime());

    cor.setFirstName(user.getFirstName());
    cor.setLastName(user.getLastName());
    cor.setUserId(user.getId());
    cor.setBusiness(user.getBusinessName());
    cor.setMerchantId(user.getExternalId());

    cor.setBusinessReceiving(crunchService.getJunctionFor(x, "18DD6F03-998F-4A21-8938-358183151F96", user, user ).getStatus() == CapabilityJunctionStatus.GRANTED);
    cor.setBusinessSending(crunchService.getJunctionFor(x, "56D2D946-6085-4EC3-8572-04A17225F86A", user, user ).getStatus() == CapabilityJunctionStatus.GRANTED);
    cor.setUserSendingUnder1000(crunchService.getJunctionFor(x, "F3DCAF53-D48B-4FA5-9667-6A6EC58C54FD", user, user).getStatus() == CapabilityJunctionStatus.GRANTED);
    cor.setUserSendingOver1000(crunchService.getJunctionFor(x, "1F0B39AD-934E-462E-A608-D590D1081298", user, user).getStatus() == CapabilityJunctionStatus.GRANTED);

    cor.setOnboardingSubmissionDate(user.getCreated());

    cor.setComplianceStatus(user.getCompliance().toString());
    cor.setApprovalDate(user.getDateCompliancePassed());

    // Date of First Payment

    if ( user.getAddress() != null )
      cor.setCity(user.getAddress().getCity());

    return cor;
  }

}
