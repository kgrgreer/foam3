foam.CLASS({
  package: 'net.nanopay.sme.ruler',
  name: 'InvitationAntiSpamCheckRule',

  documentation: `
    Prevents the invitation from being sent if the hourly time difference between the invitation and the
    latest invitation with the same inviter/invitee pair is under the minTimeoutThreshold.
  `,

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

  messages: [
    { name: 'TIMEOUT_ERROR', message: 'You have recently invited this user. Please try again at a later time.' }
  ],

  properties: [
    {
      class: 'Int',
      name: 'minTimeoutThreshold',
      value: 2,
      documentation: `
        The minimum value of the difference in hours between the new invitation and the latest invitation
        with the same inviter/invitee pair.`
    }
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
          if ( hoursSinceLastSent <= getMinTimeoutThreshold() ) {
            throw new RuntimeException(TIMEOUT_ERROR);
          }
        }
      `
    }
  ]
});