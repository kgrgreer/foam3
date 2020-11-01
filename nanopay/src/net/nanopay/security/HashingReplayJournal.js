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
  package: 'net.nanopay.security',
  name: 'HashingReplayJournal',
  extends: 'net.nanopay.security.HashingJournal',

  documentation: `A HashingJournal intended for repeatedly replaying a Journal file. Each call to replay will clone and reset the MessageDigest.`,
  
  methods: [
    {
      name: 'replay',
      args: [
        { name: 'x',   type: 'Context' },
        { name: 'dao', type: 'foam.dao.DAO' }
      ],
      javaCode: `
        // clone on replay to support multi-threaded requests.
        // Medusa mediators load from multiple nodes, and the nodes use
        // seperate HashingJournals for Mediator replay, for thier own
        // replay and subsequent update.
        MessageDigest md = (MessageDigest) getMessageDigest().fclone();
        md.reset();
        setMessageDigest(md);

        super.replay(x, dao);
      `
    }
  ]
});
