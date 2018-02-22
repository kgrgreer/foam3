
foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.b2b.model.Business',
  targetModel: 'net.nanopay.b2b.model.Invoice',
  forwardName: 'sales',
  inverseName: 'toBusinessId',
  sourceProperty: {
    hidden: true
  },
  targetProperty: {
    label: 'Vendor',
//    aliases: [ 'to', 'vendor' ],
    searchView: {
      class: "foam.u2.search.GroupBySearchView",
      width: 40,
      aFormatLabel: function(key) {
        var dao = this.__context__.businessDAO;
        return new Promise(function (resolve, reject) {
          dao.find(key).then(function (business) {
            resolve(business ? business.name : 'Unknown Business: ' + key);
          });
        });
      },
      viewSpec: { class: 'foam.u2.view.ChoiceView', size: 14 }
    },
    tableCellFormatter: function(value, obj, rel) {
      this.__context__[rel.targetDAOKey].find(value).then(function (o) {
        this.add(o.name);
      }.bind(this));
    }
  }
});


foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.b2b.model.Business',
  targetModel: 'net.nanopay.b2b.model.Invoice',
  forwardName: 'expenses',
  inverseName: 'fromBusinessId',
  sourceProperty: {
    hidden: true
  },
  targetProperty: {
    label: 'Customer',
//    aliases: [ 'from', 'customer' ],
    searchView: {
      class: "foam.u2.search.GroupBySearchView",
      width: 40,
      aFormatLabel: function(key) {
        var dao = this.__context__.businessDAO;
        return new Promise(function (resolve, reject) {
          dao.find(key).then(function (business) {
            resolve(business ? business.name : 'Unknown Business: ' + key);
          });
        });
      },
      viewSpec: { class: 'foam.u2.view.ChoiceView', size: 14 }
    },
    tableCellFormatter: function(value, obj, rel) {
      this.__context__[rel.targetDAOKey].find(value).then(function (o) {
        this.add(o.name);
      }.bind(this));
    }
  }
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.b2b.model.Business',
  targetModel: 'foam.nanos.auth.User',
  forwardName: 'members',
  inverseName: 'business'
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.b2b.model.Business',
  targetModel: 'net.nanopay.b2b.model.Business',
  forwardName: 'partners',
  inverseName: 'partnered',
  cardinality: '*:*'
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.b2b.model.Business',
  targetModel: 'foam.nanos.auth.Address',
  forwardName: 'addresses',
  inverseName: 'businessId',
  sourceProperty: {
    hidden: true
  }
});