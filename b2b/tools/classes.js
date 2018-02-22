require('../../nanopay/src/net/nanopay/model/BusinessSector');
require('../../nanopay/src/net/nanopay/model/BusinessType');

var classes = [
  'net.nanopay.b2b.model.Invoice',
  'net.nanopay.b2b.xero.TokenStorage',
  'net.nanopay.b2b.dao.Storage',
  'net.nanopay.b2b.model.Business',
  'net.nanopay.b2b.model.InvoiceResolution',
  'net.nanopay.b2b.model.Invoice'
];

var abstractClasses = [
  'net.nanopay.b2b.xero.AbstractXeroService'
];

var skeletons = [
];

var proxies = [
];

module.exports = {
    classes: classes,
    abstractClasses: abstractClasses,
    skeletons: skeletons,
    proxies: proxies
}
