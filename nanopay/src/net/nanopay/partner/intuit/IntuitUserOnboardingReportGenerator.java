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
import javax.annotation.Nullable;

public class IntuitUserOnboardingReportGenerator extends ReportGenerator {

  @Override
  public UserOnboardingReport generate(X x, @Nonnull FObject src, @Nullable FObject dst) {
    var user = (User) src;

    var group = user.getGroup();
    if ( ! ( user instanceof Business) && ( ! group.equals("intuit-sme") && ! group.equals("intuit-business-sme") ) )
      return null;

    var crunchService = (CrunchService) x.get("crunchService");

    var cor = dst == null ? new UserOnboardingReport() : (UserOnboardingReport) dst;
    cor = new UserOnboardingReport();

    cor.setFirstName(user.getFirstName());
    cor.setLastName(user.getLastName());
    cor.setUserId(user.getId());
    cor.setBusiness(user.getBusinessName());
    cor.setMerchantId(user.getExternalId());

    cor.setBusinessReceiving(crunchService.getJunctionFor(x, "crunch.onboarding.api.ca-business-receive-payments", user, user ).getStatus() == CapabilityJunctionStatus.GRANTED);
    cor.setBusinessSending(crunchService.getJunctionFor(x, "crunch.onboarding.api.ca-business-send-payments", user, user ).getStatus() == CapabilityJunctionStatus.GRANTED);
    cor.setUserSendingUnder1000(crunchService.getJunctionFor(x, "crunch.onboarding.api.ca-business-send-payments", user, user).getStatus() == CapabilityJunctionStatus.GRANTED);
    cor.setUserSendingOver1000(crunchService.getJunctionFor(x, "crunch.onboarding.api.unlock-ca-payments", user, user).getStatus() == CapabilityJunctionStatus.GRANTED);

    cor.setOnboardingSubmissionDate(user.getCreated());

    cor.setComplianceStatus(user.getCompliance().toString());
    cor.setApprovalDate(user.getDateCompliancePassed());

    // Date of First Payment

    if ( user.getAddress() != null )
      cor.setCity(user.getAddress().getCity());

    return (UserOnboardingReport) super.generate(x, src, cor);
  }

}
