foam.CLASS({
  package: 'net.nanopay.meter.clearing.ruler',
  name: 'ClearingTimeRuleDAOCreateView',
  extends: 'foam.comics.v2.DAOCreateView',

  properties: [
    {
      name: 'viewView',
      expression: function() {
        return {
          class: 'foam.u2.view.FObjectView',
          choices: [
            [ 'net.nanopay.meter.clearing.ruler.TransactionTypeClearingTimeRule',      'TransactionType Clearing Time' ],
            [ 'net.nanopay.meter.clearing.ruler.InstitutionClearingTimeRule',          'Institution Clearing Time' ],
            [ 'net.nanopay.meter.clearing.ruler.BusinessClearingTimeRule',             'Business Clearing Time' ]
          ]
        };
      }
    }
  ]
});
