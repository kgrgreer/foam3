foam.CLASS({
  package: 'net.nanopay.sme.ruler',
  name: 'InvitationAntiSpamCheckRule',

  documentation: `Prevents the same invitation from being sent if sent within 2 hours of latest invitation.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'net.nanopay.model.Invitation',
    'java.util.concurrent.TimeUnit',
    'java.util.Date',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        Invitation invitation = (Invitation) obj;
        DAO invitationDAO = (DAO) x.get("invitationDAO");
        ArraySink sink = new ArraySink();
        invitationDAO
          .where(
            AND(
              EQ(Invitation.EMAIL, invitation.getEmail()),
              EQ(Invitation.CREATED_BY, invitation.getCreatedBy())
            )
          )
          .orderBy(DESC(Invitation.TIMESTAMP))
          .select(sink);
        List array = sink.getArray();
        if ( ! array.isEmpty() ) {
          Invitation latestInvitation = (Invitation) array.get(0);
          TimeUnit hoursUnit = TimeUnit.HOURS;
          Date now = new Date();
          long diff = now.getTime() - latestInvitation.getTimestamp().getTime();
          long hoursSinceLastSent = hoursUnit.convert(diff, TimeUnit.MILLISECONDS);
          if ( hoursSinceLastSent <= 2 ) {
            throw new RuntimeException("You have recently invited this user. Please try again at a later time.");
          }
        }
      `
    }
  ]
});