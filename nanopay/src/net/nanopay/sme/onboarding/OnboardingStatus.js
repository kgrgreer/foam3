foam.ENUM({
  package: 'net.nanopay.sme.onboarding',
  name: 'OnboardingStatus',
  values: [
    'DRAFT',  // Save & Exit action
    'SUBMITTED', // when singing officer finished til the end of onboarding process
    'SAVED' // when non signing officer finished til the end of onboarding process
  ]
});
