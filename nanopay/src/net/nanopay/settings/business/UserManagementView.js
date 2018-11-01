foam.CLASS({
  package: 'net.nanopay.settings.business',
  name: 'UserManagementView',
  extends: 'foam.u2.View',
  documentation: 'View displaying users associated to other users or business.',

  requires: [

  ],

  css: `
  
  `,

  properties: [
    {
      name: 'agentJunctionArray',
      documentation: 'Array that is populated on class load with agentJunctionDAO.'
    },
    {
      name: 'filteredDAO',
      documentation: `DAO filtered by search property.`,
      expression: function(filter, userExpensesArray) {
        return foam.dao.ArrayDAO.create({
          array: filteredArray,
          of: 'net.nanopay.model.ClientUserJunction'
        });
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;

      this.addClass(this.myClass())
        .start()

        .end();
    }
  ]
});
