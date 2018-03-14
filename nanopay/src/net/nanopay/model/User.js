foam.CLASS({
  refines: 'foam.nanos.auth.User',

  properties: [
    {
      class: 'Reference',
      targetDAOKey: 'businessTypeDAO',
      name: 'businessTypeId',
      of: 'net.nanopay.model.BusinessType',
    },
    {
      class: 'Reference',
      targetDAOKey: 'businessSectorDAO',
      name: 'businessSectorId',
      of: 'net.nanopay.model.BusinessSector',
    },
    {
      class: 'String',
      name: 'branchId',
      label: 'Branch ID'
    },
    {
      class: 'String',
      name: 'clearingId',
      label: 'Clearing ID'
    },
    {
      class: 'String',
      name: 'status',
      tableCellFormatter: function(status) {
        
      }
    },
    {
      class: 'String',
      name: 'jobTitle',
      label: 'Job Title',
      validateObj: function(jobTitle) {
        var re = /^[a-zA-Z0-9 ]{1,35}$/;
        if ( jobTitle.length > 0 && ! re.test(jobTitle) ) {
          return 'Invalid job title.';
        }
      }
    },
    {
      class: 'Boolean',
      name: 'portalAdminCreated',
      value: false,
    },
    {
      class: 'Boolean',
      name: 'welcomeEmailSent',
      value: false,
    }
  ]
});