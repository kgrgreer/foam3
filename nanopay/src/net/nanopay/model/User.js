foam.CLASS({
  refines: 'foam.nanos.auth.User',
  properties: [ 
    {
      class: 'Reference',
      targetDAOKey: 'businessTypeDAO',
      name: 'businessTypeId',
      of: 'net.nanopay.model.BusinessType',      
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.businessTypeDAO,
          objToChoice: function(a){
            return [a.id, a.name];
          }
        })
      },
    },
    {
      class: 'Reference',
      targetDAOKey: 'businessSectorDAO',      
      name: 'businessSectorId',
      of: 'net.nanopay.model.BusinessSector',            
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.businessSectorDAO,
          objToChoice: function(a){
            return [a.id, a.name];
          }
        })
      },
    }  
  ]
});