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
  package: 'net.nanopay.documents',
  name: 'UserAcceptanceDocument',

  documentation: 'Captures acceptance documents accepted by user and date accepted.',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',

    'net.nanopay.model.Business'
  ],

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.auth.Authorizable'
  ],

  tableColumns: [
      'id',
      'user.id',
      'acceptedDocument',
      'createdBy.legalName',
      'createdByAgent.legalName'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      tableWidth: 50
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'user'
    },
    {
      class: 'String',
      name: 'ipAddress'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.documents.AcceptanceDocument',
      name: 'acceptedDocument'
    },
    {
      class: 'Boolean',
      name: 'accepted',
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: 'Creation date.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: 'User who created the entry'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      documentation: 'User who created the entry'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      name: 'business',
      documentation: 'Business who created the entry'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: 'Last modified date.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedByAgent'
    }
  ],

  methods: [
    {
      name: 'authorizeOnCreate',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
      authenticateUser(x);
      `
    },
    {
      name: 'authorizeOnRead',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
      authenticateUser(x);
      `
    },
    {
      name: 'authorizeOnUpdate',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'oldObj', type: 'foam.core.FObject' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
      authenticateUser(x);
      `
    },
    {
      name: 'authorizeOnDelete',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
      authenticateUser(x);
      `
    },
    {
      name: 'authenticateUser',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
      DAO acceptanceDocumentDAO = (DAO) x.get("acceptanceDocumentDAO");
      AcceptanceDocument acceptanceDocument = (AcceptanceDocument) acceptanceDocumentDAO.find(getAcceptedDocument());
      if ( acceptanceDocument != null && acceptanceDocument.getAuthenticated()) {
        User user = ((Subject) x.get("subject")).getUser();
        if ( user == null ) throw new AuthorizationException("You need to be logged in to access document.");
      }
      `
    }
  ]
});
