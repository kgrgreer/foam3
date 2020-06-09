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
  package: 'net.nanopay.dao',
  name: 'EasyDAO',
  extends: 'foam.dao.EasyDAO',
  properties: [
    {
      class: 'Object',
      type: 'foam.dao.DAO',
      name: 'innerDAO',
      javaFactory: `
      if ( getJournalType().equals(foam.dao.JournalType.SINGLE_JOURNAL) )
        return new foam.dao.java.HashingJDAO(getX(), getOf(), getJournalName());
      return new foam.dao.MDAO(getOf());
      `
    }
  ],
  
  methods: [
    {
      name: 'getOuterDAO',
      documentation: 'Method to be overidden on the user end to add framework user specific DAO decorators to EasyDAO',
      type: 'foam.dao.DAO',
      args: [
        {
          type: 'foam.dao.DAO',
          name: 'innerDAO'
        }
      ],
      javaCode: `
        return innerDAO;
      `
    }
  ]
});
