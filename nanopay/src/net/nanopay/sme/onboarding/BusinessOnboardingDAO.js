foam.CLASS({
  package: 'net.nanopay.sme.onboarding',
  name: 'BusinessOnboardingDAO',
  extends: 'foam.dao.ProxyDAO',
  methods: [
    {
      name: 'put_',
      javaCode: `
System.out.println("TODO: Process the onboard");
return super.put_(x, obj);
      `
    }
  ]
});
