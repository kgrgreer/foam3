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
    }  
  ]
});