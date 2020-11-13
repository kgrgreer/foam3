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
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'DowJonesResponse',
  extends: 'net.nanopay.meter.compliance.dowJones.DowJonesCall',

  documentation: 'Base class model for a search response from the Dow Jones Risk Database.',

  tableColumns: [
    'id',
    'userId',
    'nameSearched',
    'daoKey',
    'searchDate',
    'status'
  ],

  searchColumns: [
    'id',
    'userId',
    'nameSearched',
    'daoKey',
    'searchDate',
    'status'
  ],

  messages: [
    { name: 'USER_INFO_MSG', message: 'User Info' },
    { name: 'BUSINESS_INFO_MSG', message: 'Business Info' }
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'userId',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'daoKey',
      visibility: 'RO',
      documentation: 'Name of DAO that contains user (eg. beneficialOwnerDAO or userDAO)'
    },
    {
      class: 'Date',
      name: 'searchDate',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'searchType',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'nameSearched',
      visibility: 'RO'
    },
    {
      class: 'Int',
      name: 'totalMatches',
      visibility: 'RO'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.approval.ApprovalStatus',
      name: 'status'
    },
    {
      class: 'String',
      name: 'comments',
      view: { class: 'foam.u2.tag.TextArea', rows: 5, cols: 40 }
    },
    {
      class: 'Int',
      name: 'httpStatusCode',
      visibility: 'RO',
      documentation: 'HTTP Status Code retrieved from the HTTP GET request to the Dow Jones API'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.dowJones.MetadataSearchResponse',
      name: 'metadata',
      visibility: 'RO',
      documentation: 'Metadata retrieved from the head response data'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.dowJones.DowJonesResponseBody',
      name: 'responseBody',
      visibility: 'RO',
      documentation: 'Body retreived from the body response data'
    }
  ],

  actions: [
    {
      name: 'viewUser',
      label: 'View User',
      tableWidth: 135,
      isAvailable: function(searchType) {
        return searchType == 'Dow Jones Person';
      },
      code: function(X) {
        var m = foam.mlang.ExpressionsSingleton.create();
        var dao = X.userDAO.where(m.EQ(foam.nanos.auth.User.ID, this.userId));
        this.__context__.stack.push({
          class: 'foam.comics.v2.DAOBrowseControllerView',
          data: dao,
          config: {
            class: 'foam.comics.v2.DAOControllerConfig',
            dao: dao,
            createPredicate: foam.mlang.predicate.False,
            browseTitle: `${this.nameSearched}'s ${this.USER_INFO_MSG}`
          }
        });
      }
    },
    {
      name: 'viewBusiness',
      label: 'View Business',
      tableWidth: 135,
      isAvailable: function(searchType) {
        return searchType == 'Dow Jones Entity';
      },
      code: function(X) {
        var m = foam.mlang.ExpressionsSingleton.create();
        var dao = X.userDAO.where(m.EQ(net.nanopay.model.Business.ID, this.userId));
        this.__context__.stack.push({
          class: 'foam.comics.v2.DAOBrowseControllerView',
          data: dao,
          config: {
            class: 'foam.comics.v2.DAOControllerConfig',
            dao: dao,
            createPredicate: foam.mlang.predicate.False,
            browseTitle: `${this.nameSearched}'s ${this.BUSINESS_INFO_MSG}`
          }
        });
      }
    }
  ]
});
