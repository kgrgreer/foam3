foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.lev.model',
  name: 'LEVResponse',
  extends: 'net.nanopay.meter.compliance.secureFact.sidni.model.BasicResponseObject',

  tableColumns: [
    'id', 'name', 'entityId', 'closeMatches', 'searchId'
  ],

  imports: [
    'businessDAO'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      label: 'Entity Name',
      tableCellFormatter: function(value, obj) {
        var self = this;
        obj.businessDAO.find(value).then(function(business) {
          if ( business ) {
            self.start().add(business.businessName).end();
          }
        });
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      name: 'entityId',
      label: 'Entity Id',
      postSet: function(old, nu) {
        this.name = nu;
      }
    },
    {
      class: 'Int',
      name: 'searchId',
      documentation: 'Securefact unique search id.'
    },
    {
      class: 'String',
      name: 'closeMatches',
      label: 'Close Matches'
    },
    {
      class: 'Array',
      of: 'String',
      name: 'jurisdictionsUnavailable',
      documentation: 'If a jurisdiction is unavailable at the time of the search and results cannot be returned, it will be listed here.'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.lev.model.LEVResult',
      name: 'results'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.lev.model.LEVError',
      name: 'errors'
    }
  ]
  });
