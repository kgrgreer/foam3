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
  package: 'net.nanopay.security.snapshooter',
  name: 'RollingJDAO',
  extends: 'foam.dao.java.JDAO',
  flags: ['java'],

  documentation: `This JDAO adds the service name to the JDAO, enabling the
    RollingJournal to use the service name for appending it to the the journal
    records for a single journal file.`,

  properties: [
    {
      class: 'String',
      name: 'service',
      documentation: 'Name of the service.'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          public RollingJDAO(foam.core.X x, String service, foam.dao.DAO delegate, net.nanopay.security.snapshooter.RollingJournal journal) {
            setX(x);
            setService(service);
            setOf(delegate.getOf());
            setDelegate(delegate);
            setJournal(journal);

            // Retrieving the DAO from RollingJournal
            journal.replayDAO(service, delegate);
          }
        `);
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      documentation: 'Adding the service name to the context before put.',
      javaCode: `
        return super.put_(x.put("service", getService()), obj);
      `
    },
    {
      name: 'remove_',
      documentation: 'Adding the service name to the context before remove.',
      javaCode: `
        return super.remove_(x.put("service", getService()), obj);
      `
    }
   ]
  })
