foam.CLASS({
  package: 'net.nanopay.meter.clearing.ruler',
  name: 'ClearingTimeRuleDAOCreateView',
  extends: 'foam.comics.v2.DAOCreateView',

  properties: [
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'viewView',
      expression: function() {
        return {
          class: 'foam.u2.view.FObjectView',
          of: 'net.nanopay.meter.clearing.ruler.ClearingTimeRule'
        };
      }
    }
  ]
});
