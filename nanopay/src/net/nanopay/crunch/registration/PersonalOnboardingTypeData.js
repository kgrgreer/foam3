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
  package: 'net.nanopay.crunch.registration',
  name: 'PersonalOnboardingTypeData',

  documentation: `This model represents the personal onboarding type of the user.`,
  
  implements: [
    'foam.core.Validatable'
  ],

  javaImports: [
    'foam.util.SafetyUtil',
    'net.nanopay.flinks.external.OnboardingType'
  ],
  
  properties: [
    {
      class: 'Reference',
      name: 'user',
      targetDAOKey: 'userDAO',
      of: 'foam.nanos.auth.User',
      documentation: 'Onboarded user'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.flinks.external.OnboardingType',
      name: 'requestedOnboardingType',
      documentation: 'The type of onboarding type requested'
    },
    {
      class: 'String',
      name: 'flinksLoginType',
      documentation: 'Login type returned by Flinks for credentials of user'
    },
    
    {
      class: 'Boolean',
      name: 'overrideFlinksLoginType',      
      documentation: `Forces a Personal Onboarding even if Flinks login type is \'Business\'`,
      value: false
    }
  ],
  
  methods: [
    {
      name: 'validate',
      javaCode: `
        if ( getRequestedOnboardingType() == OnboardingType.BUSINESS ) {
          throw new IllegalArgumentException("Requested onboarding type is not compatible with personal onboarding type: " + getRequestedOnboardingType() + ". Switch to PERSONAL OnboardingType.");
        }

        foam.nanos.auth.User user = this.findUser(x);
        if ( user == null ) {
          throw new IllegalArgumentException("User not set or does not exist. ID: " + getUser());
        }

        // Check if the user is forcing personal onboarding regardless of onboarding types
        if ( getOverrideFlinksLoginType() ) {
          return;
        }
      
        // Personal onboarding must be true for this capability to be satisfied
        if ( !SafetyUtil.equals(getFlinksLoginType(), "Personal") ) {
          throw new IllegalArgumentException("Flinks login type is not compatible with onboarding type: " + getFlinksLoginType() + ". Override to force personal of onboarding");
        }
      `
    }
  ]
});
  