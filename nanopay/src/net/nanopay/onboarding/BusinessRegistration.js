foam.CLASS({
  package: 'net.nanopay.onboarding',
  name: 'BusinessRegistration',

  documentation: 'Business registration information used with businessRegistrationDAO',

  properties: [
    {
      class: 'Long',
      name: 'userId'
    },
    {
      class: 'Long',
      name: 'businessId'
    },
    foam.nanos.auth.User.FIRST_NAME.clone(),
    foam.nanos.auth.User.LAST_NAME.clone(),
    foam.nanos.auth.User.EMAIL.clone(),
    foam.nanos.auth.User.DESIRED_PASSWORD.clone(),
    foam.nanos.auth.User.ORGANIZATION.clone(),
    foam.nanos.auth.User.ADDRESS.clone()
  ]
});
