foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.sidni.model',
  name: 'SIDniResponse',
  extends: 'net.nanopay.meter.compliance.secureFact.sidni.model.BasicResponseObject',
  documentation: `The object for a SIDni response`,

  tableColumns: [
    'id', 'name', 'entityId', 'verified', 'reason'
  ],

  imports: [
    'userDAO'
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
        obj.userDAO.find(value).then( function(user) {
          if ( user ) {
            self.start().add(user.legalName).end();
          }
        });
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'entityId',
      label: 'Entity Id',
      postSet: function(old, nu) {
        this.name = nu;
      }
    },
    {
      class: 'String',
      name: 'userReference',
      documentation: 'User reference id that was passed in.'
    },
    {
      class: 'String',
      name: 'orderId',
      documentation: 'Unique secureFact id associated with the verify request'
    },
    {
      class: 'String',
      name: 'individualName'
    },
    {
      class: 'Boolean',
      name: 'verified',
      tableCellFormatter: function(verifiedSources) {
        if ( verifiedSources ) {
          this.start().add('true').end();
        } else {
          this.start().add('false').end();
        }
     }
    },
    {
      class: 'String',
      name: 'reason'
    },
    {
      class: 'Array',
      of: 'String',
      name: 'verifiedSources'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniDataSources',
      name: 'dataSources'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniAdditionalMatchInfo',
      name: 'additionalMatchInfo'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniErrorComponent',
      name: 'errors'
    },
  ]
});
