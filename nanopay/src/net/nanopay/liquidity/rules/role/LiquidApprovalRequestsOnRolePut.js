foam.CLASS({
  package: 'net.nanopay.liquidity.rules.role',
  name: 'LiquidApprovalRequestsOnRolePut',

  documentation: `
    A rule to send out approval requests when creating 
    or updating an account as a liquid user
  `,

  implements: ['foam.nanos.ruler.RuleAction'],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        System.out.println("Lit");
      `
    }
  ]
});
