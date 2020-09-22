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

foam.CLASS({
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'SigningOfficerQuestionOnPut',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  implements: [ 'foam.nanos.ruler.RuleAction' ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'net.nanopay.model.Invitation',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            UserCapabilityJunction old = (UserCapabilityJunction) oldObj;
    
            if ( ucj.getStatus() != CapabilityJunctionStatus.GRANTED || ( old != null && old.getStatus() == CapabilityJunctionStatus.GRANTED ) ) return;

            User business = ((Subject) x.get("subject")).getUser();
            User user = ((Subject) x.get("subject")).getRealUser();
            if ( business == null || user == null ) throw new RuntimeException("business or user cannot be found");

            SigningOfficerQuestion data = (SigningOfficerQuestion) ucj.getData();

            if ( ! data.getIsSigningOfficer() ) {
              sendSigningOfficerInvite(x, user, business, data);
            }
          }
        }, "On SigningOfficerQuestion completion, send an email to invite a signingofficer if user selects that they are not a signing officer.");
      `
    },
    {
      name: 'sendSigningOfficerInvite',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'user', javaType: 'foam.nanos.auth.User' },
        { name: 'business', javaType: 'foam.nanos.auth.User' },
        { name: 'data', javaType: 'net.nanopay.crunch.onboardingModels.SigningOfficerQuestion' }
      ],
      javaCode: `
        String email = data.getSigningOfficerEmail();
        if ( email == null || email.equals("") || email.equals(user.getEmail()) ) 
          throw new RuntimeException("invalid email. Cannot invite signing officer to business");

        DAO businessInvitationDAO = (DAO) x.get("businessInvitationDAO");

        Invitation existingInvite = (Invitation) businessInvitationDAO.find(
          AND(
            EQ(Invitation.EMAIL, data.getSigningOfficerEmail().toLowerCase()),
            EQ(Invitation.CREATED_BY, business.getId())
          )
        );

        if ( existingInvite == null ) {
          // If the user needs to invite the signing officer
          String signingOfficerEmail = data.getSigningOfficerEmail().toLowerCase();

          Invitation invitation = new Invitation();
          /**
           * Summary: the group set in the invitation obj is not the final(real) group
           * that the signing office will get after signing up with the invitation email.
           * It is a string saved in the token that will passed into the NewUserCreateBusinessDAO class.
           * The group of the new signing officer will generate in the NewUserCreateBusinessDAO class.
           *
           * Details: After we set the group in the invitation obj, we put the invitation
           * into the businessInvitationDAO service.
           *
           * In the BusinessOnboardingDAO service, it has a decorator called businessInvitationDAO.
           * In the put_ method of businessInvitationDAO.java,
           * it basically set up a token which contains the group information which is the temp string: 'admin'
           *
           * When the user signs up with the signing officer invitation email,
           * the app will call the smeBusinessRegistrationDAO service.
           * In the smeBusinessRegistrationDAO service, it has a decorator called NewUserCreateBusinessDAO.
           *
           * In NewUserCreateBusinessDAO.java, it generates the business specific group
           * in the format of: businessName+businessId.admin. (such as: nanopay8010.admin).
           */
          invitation.setGroup("admin");
          invitation.setCreatedBy(business.getId());
          invitation.setEmail(email);

          invitation.setIsSigningOfficer(true);

          // Send invitation to email to the signing officer
          businessInvitationDAO.put_(x, invitation);
        }
      `
    }
  ]
});
