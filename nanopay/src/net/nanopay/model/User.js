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
      name: 'status'
    },
    {
      class: 'String',
      name: 'jobTitle',
      label: 'Job Title',
      validateObj: function(jobTitle) {
        if ( jobTitle.length > 35 ) {
          return this.JobTitleLengthError;
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
  ],

  messages: [
    { name: 'JobTitleEmptyError', message: 'Job title can\'t be empty' },
    { name: 'JobTitleLengthError', message: 'Job title is too long' }
  ]
});