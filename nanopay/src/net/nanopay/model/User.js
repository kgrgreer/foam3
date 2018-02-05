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
      label: 'Job Title'
    },
    {
      class: 'String',
      name: 'emailedAmount',
      value: "$0.00"
    },
    {
      class: 'Boolean',
      name: 'adminCreated',
      value: false,
    }
  ]
});