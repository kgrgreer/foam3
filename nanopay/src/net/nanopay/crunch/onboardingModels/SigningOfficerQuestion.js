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
  name: 'SigningOfficerQuestion',

  implements: [ 
    'foam.core.Validatable'
  ],

  sections: [
    {
      name: 'signingOfficerQuestionSection',
      title: 'Are you considered a signing officer at the company?',
      help: 'Alright, let’s do this! First off, I’m going to need to know if you are a signing officer at the company…'
    },
    {
      name: 'signingOfficerEmailSection',
      title: 'Enter the signing officer\'s email',
      help: `For security, we require the approval of a signing officer before you can continue.
          I can email the signing officer directly for the approval.`,
      isAvailable: function ( isSigningOfficer ) { return ! isSigningOfficer }
    }
  ],

  messages: [
    { name: 'SIGNING_OFFICER_EMAIL_ERROR', message: 'Please provide an email for the signing officer.' },
    { name: 'ADMIN_FIRST_NAME_ERROR', message: 'Please enter first name with least 1 character.' },
    { name: 'ADMIN_LAST_NAME_ERROR', message: 'Please enter last name with least 1 character.' },
    { name: 'NO_JOB_TITLE_ERROR', message: 'Please select job title.' },
    { name: 'INVALID_PHONE_NUMBER_ERROR', message: 'Invalid phone number.' }
  ],

  properties: [
    // Signing Officer Question Section
    {
      section: 'signingOfficerQuestionSection',
      name: 'isSigningOfficer',
      class: 'Boolean',
      help: `A signing officer is a person legally authorized to act on behalf of the business (e.g CEO, COO, board director)`,
      label: '',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          [true, 'Yes, I am a signing officer'],
          [false, 'No, I am not']
        ]
      }
    },

    // Signing Officer Email
    {
      section: 'signingOfficerEmailSection',
      name: 'signingOfficerEmail',
      class: 'String',
      label: 'Enter your signing officer\'s email',
      documentation: 'Business signing officer emails. To be sent invitations to join platform',
      placeholder: 'example@email.com',
      validationPredicates: [
        {
          args: ['isSigningOfficer', 'signingOfficerEmail'],
          predicateFactory: function(e) {
            return e.REG_EXP(net.nanopay.crunch.onboardingModels.SigningOfficerQuestion.SIGNING_OFFICER_EMAIL, /.+@.+/);
          },
          errorMessage: 'SIGNING_OFFICER_EMAIL_ERROR'
        }
      ]
    },

    // admin info
    {
      class: 'String',
      name: 'adminFirstName',
      section: 'signingOfficerEmailSection',
      documentation: 'Signing officer \' first name',
      label: 'First Name',
      width: 100,
      gridColumns: 6,
      validationPredicates: [
        {
          args: [ 'adminFirstName' ],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.crunch.onboardingModels.SigningOfficerQuestion.ADMIN_FIRST_NAME, '');
          },
          errorMessage: 'ADMIN_FIRST_NAME_ERROR'
        }
      ]
    },
    {
      class: 'String',
      name: 'adminLastName',
      label: 'Last Name',
      section: 'signingOfficerEmailSection',
      documentation: 'Signing officer \' last name',
      width: 100,
      gridColumns: 6,
      validationPredicates: [
        {
          args: [ 'adminLastName' ],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.crunch.onboardingModels.SigningOfficerQuestion.ADMIN_LAST_NAME, '');
          },
          errorMessage: 'ADMIN_LAST_NAME_ERROR'
        }
      ]
    },    
    {
      class: 'String',
      name: 'adminJobTitle',
      label: 'Job Title',
      section: 'signingOfficerEmailSection',
      width: 100,
      view: function(args, X) {
        return {
          class: 'foam.u2.view.ChoiceWithOtherView',
          otherKey: 'Other',
          choiceView: {
            class: 'foam.u2.view.ChoiceView',
            placeholder: X.data.PLACE_HOLDER,
            dao: X.jobTitleDAO,
            objToChoice: function(a) {
              return [a.name, a.label];
            }
          }
        };
      },
      validationPredicates: [
        {
          args: [ 'adminJobTitle' ],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.crunch.onboardingModels.SigningOfficerQuestion.ADMIN_JOB_TITLE, '');
          },
          errorMessage: 'NO_JOB_TITLE_ERROR'
        }
      ],
      validationTextVisible: true
    },
    {
      class: 'PhoneNumber',
      name: 'adminPhone',
      section: 'signingOfficerEmailSection',
      label: 'Phone Number',
      validationPredicates: [
        {
          args: [ 'adminPhone' ],
          predicateFactory: function(e) {
            return e.REG_EXP(
              net.nanopay.crunch.onboardingModels.SigningOfficerQuestion.ADMIN_PHONE,
              /^(?:\+?1[-.●]?)?\(?([0-9]{3})\)?[-.●]?([0-9]{3})[-.●]?([0-9]{4})$/);
          },
          errorMessage: 'INVALID_PHONE_NUMBER_ERROR'
        }
      ]
    }
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
        if ( getIsSigningOfficer() ) return;

        java.util.List<foam.core.PropertyInfo> props = getClassInfo().getAxiomsByClass(foam.core.PropertyInfo.class);
        for ( foam.core.PropertyInfo prop : props ) {
          try {
            prop.validateObj(x, this);
          } catch ( IllegalStateException e ) {
            throw e;
          }
        }
      `
    }
  ]
});

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
    'net.nanopay.model.BusinessUserJunction',
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

            if ( data.getIsSigningOfficer() ) {
              addSigningOfficer(x, user, business);
            } else {
              sendSigningOfficerInvite(x, user, business, data);
            } 
          }
        }, "On SigningOfficerQuestion completion, either add the current agent as signing officer, or send an email to invite a signingofficer");
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

          invitation.setFirstName(data.getAdminFirstName());
          invitation.setLastName(data.getAdminLastName());
          invitation.setJobTitle(data.getAdminJobTitle());
          invitation.setPhoneNumber(data.getAdminPhone());
          invitation.setIsSigningOfficer(true);

          // Send invitation to email to the signing officer
          businessInvitationDAO.put_(x, invitation);
        }
      `
    },
    {
      name: 'addSigningOfficer',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'user', javaType: 'foam.nanos.auth.User' },
        { name: 'business', javaType: 'foam.nanos.auth.User' }
      ],
      javaCode: `            
        DAO signingOfficerJunctionDAO = (DAO) x.get("signingOfficerJunctionDAO");

        signingOfficerJunctionDAO.put_(x, new BusinessUserJunction.Builder(x)
          .setSourceId(business.getId())
          .setTargetId(user.getId())
          .build());
      
      `
    }
  ]
});
