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
      of: 'net.nanopay.approval.ApprovalStatus',
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
        this.__context__.stack.push({
          class: 'foam.comics.BrowserView',
          createEnabled: false,
          exportEnabled: true,
          title: `${this.nameSearched}'s User Info`,
          data: X.userDAO.where(
            m.EQ(foam.nanos.auth.User.ID, this.userId)
          )
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
        this.__context__.stack.push({
          class: 'foam.comics.BrowserView',
          createEnabled: false,
          exportEnabled: true,
          title: `${this.nameSearched}'s Business Info`,
          data: X.businessDAO.where(
            m.EQ(net.nanopay.model.Business.ID, this.userId)
          )
        });
      }
    }
  ]
});
