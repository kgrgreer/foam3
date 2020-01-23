foam.ENUM({
  package: 'net.nanopay.sme.onboarding',
  name: 'OnboardingStatus',
  values: [
    'DRAFT',  // Save & Exit action
    'SUBMITTED', // A signing officer completed the on boarding process
    'SAVED' // A non signing officer completed the on boarding process
  ]
});
