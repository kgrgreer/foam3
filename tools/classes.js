var foam = require('../foam3/tools/classes.js')
foam.classes = foam.classes.map(function(element) { return [ 'foam3/src/', element ]; })
foam.abstractClasses = foam.abstractClasses.map(function(element) { return ['foam3/src/', element ]; })
foam.skeletons = foam.skeletons.map(function(element) { return ['foam3/src/', element ]; })
foam.proxies = foam.proxies.map(function(element) { return ['foam3/src/', element ]; })

var nanopay = require('../nanopay/tools/classes.js')
nanopay.classes = nanopay.classes.map(function(element) { return [ 'nanopay/src/', element ]; })
nanopay.abstractClasses = nanopay.abstractClasses.map(function(element) { return [ 'nanopay/src/', element ]; })
nanopay.skeletons = nanopay.skeletons.map(function(element) { return [ 'nanopay/src/', element ]; })
nanopay.proxies = nanopay.proxies.map(function(element) { return [ 'nanopay/src/', element ]; })

var merchant = require('../merchant/tools/classes.js')
merchant.classes = merchant.classes.map(function(element) { return [ 'merchant/src/', element ]; })
merchant.abstractClasses = merchant.abstractClasses.map(function(element) { return [ 'merchant/src/', element ]; })
merchant.skeletons = merchant.skeletons.map(function(element) { return [ 'merchant/src/', element ]; })
merchant.proxies = merchant.proxies.map(function(element) { return [ 'merchant/src/', element ]; })

var interac = require('../interac/tools/classes.js')
interac.classes = interac.classes.map(function(element) { return [ 'interac/src/', element ]; })
interac.abstractClasses = interac.abstractClasses.map(function(element) { return [ 'interac/src/', element ]; })
interac.skeletons = interac.skeletons.map(function(element) { return [ 'interac/src/', element ]; })
interac.proxies = interac.proxies.map(function(element) { return [ 'interac/src/', element ]; })

var iso20022 = require('../nanopay/src/net/nanopay/iso20022/classes.js');
iso20022.classes = iso20022.classes.map(function(element) { return [ 'nanopay/src/', element ]; })
iso20022.abstractClasses = iso20022.abstractClasses.map(function(element) { return [ 'nanopay/src/', element ]; })
iso20022.skeletons = iso20022.skeletons.map(function(element) { return [ 'nanopay/src/', element ]; })
iso20022.proxies = iso20022.proxies.map(function(element) { return [ 'nanopay/src/', element ]; })

var iso8583 = require('../nanopay/src/net/nanopay/iso8583/classes.js');
iso8583.classes = iso8583.classes.map(function(element) { return [ 'nanopay/src/', element ]; })
iso8583.abstractClasses = iso8583.abstractClasses.map(function(element) { return [ 'nanopay/src/', element ]; })
iso8583.skeletons = iso8583.skeletons.map(function(element) { return [ 'nanopay/src/', element ]; })
iso8583.proxies = iso8583.proxies.map(function(element) { return [ 'nanopay/src/', element ]; })

var afx = require('../nanopay/src/net/nanopay/fx/ascendantfx/model/classes.js');
afx.classes = afx.classes.map(function(element) { return [ 'nanopay/src/', element ]; })
afx.abstractClasses = afx.abstractClasses.map(function(element) { return [ 'nanopay/src/', element ]; })
afx.skeletons = afx.skeletons.map(function(element) { return [ 'nanopay/src/', element ]; })
afx.proxies = afx.proxies.map(function(element) { return [ 'nanopay/src/', element ]; })

var kotakPaymentRequest = require('../nanopay/src/net/nanopay/kotak/model/paymentRequest/classes.js');
kotakPaymentRequest.classes = kotakPaymentRequest.classes.map(function(element) { return [ 'nanopay/src/', element ]; })
kotakPaymentRequest.abstractClasses = kotakPaymentRequest.abstractClasses.map(function(element) { return [ 'nanopay/src/', element ]; })
kotakPaymentRequest.skeletons = kotakPaymentRequest.skeletons.map(function(element) { return [ 'nanopay/src/', element ]; })
kotakPaymentRequest.proxies = kotakPaymentRequest.proxies.map(function(element) { return [ 'nanopay/src/', element ]; })

var kotakPaymentResponse = require('../nanopay/src/net/nanopay/kotak/model/paymentResponse/classes.js');
kotakPaymentResponse.classes = kotakPaymentResponse.classes.map(function(element) { return [ 'nanopay/src/', element ]; })
kotakPaymentResponse.abstractClasses = kotakPaymentResponse.abstractClasses.map(function(element) { return [ 'nanopay/src/', element ]; })
kotakPaymentResponse.skeletons = kotakPaymentResponse.skeletons.map(function(element) { return [ 'nanopay/src/', element ]; })
kotakPaymentResponse.proxies = kotakPaymentResponse.proxies.map(function(element) { return [ 'nanopay/src/', element ]; })

var kotakReversal = require('../nanopay/src/net/nanopay/kotak/model/reversal/classes.js');
kotakReversal.classes = kotakReversal.classes.map(function(element) { return [ 'nanopay/src/', element ]; })
kotakReversal.abstractClasses = kotakReversal.abstractClasses.map(function(element) { return [ 'nanopay/src/', element ]; })
kotakReversal.skeletons = kotakReversal.skeletons.map(function(element) { return [ 'nanopay/src/', element ]; })
kotakReversal.proxies = kotakReversal.proxies.map(function(element) { return [ 'nanopay/src/', element ]; })

var flinks = require('../nanopay/src/net/nanopay/flinks/utils/classes.js');
flinks.classes = flinks.classes.map(function(element) { return [ 'nanopay/src/', element ]; })
flinks.abstractClasses = flinks.abstractClasses.map(function(element) { return [ 'nanopay/src/', element ]; })
flinks.skeletons = flinks.skeletons.map(function(element) { return [ 'nanopay/src/', element ]; })
flinks.proxies = flinks.proxies.map(function(element) { return [ 'nanopay/src/', element ]; })

var plaid = require('../nanopay/src/net/nanopay/plaid/config/classes.js');
plaid.classes = plaid.classes.map(function(element) { return [ 'nanopay/src/', element ]; })
plaid.abstractClasses = plaid.abstractClasses.map(function(element) { return [ 'nanopay/src/', element ]; })
plaid.skeletons = plaid.skeletons.map(function(element) { return [ 'nanopay/src/', element ]; })
plaid.proxies = plaid.proxies.map(function(element) { return [ 'nanopay/src/', element ]; })

var classes = [];
classes = classes.concat(
  foam.classes, 
  nanopay.classes,
  merchant.classes,
  interac.classes,
  iso20022.classes,
  iso8583.classes,
  afx.classes,
  kotakPaymentRequest.classes,
  kotakPaymentResponse.classes,
  kotakReversal.classes,
  flinks.classes,
  plaid.classes);

var abstractClasses = [];
abstractClasses = abstractClasses.concat(
  foam.abstractClasses,
  nanopay.abstractClasses,
  merchant.abstractClasses,
  interac.abstractClasses,
  iso20022.abstractClasses,
  iso8583.abstractClasses,
  afx.abstractClasses,
  kotakPaymentRequest.abstractClasses,
  kotakPaymentResponse.abstractClasses,
  kotakReversal.abstractClasses,
  flinks.abstractClasses,
  plaid.abstractClasses);

var skeletons = [];
skeletons = skeletons.concat(
  foam.skeletons,
  nanopay.skeletons,
  merchant.skeletons,
  interac.skeletons,
  iso20022.skeletons,
  iso8583.skeletons,
  afx.skeletons,
  kotakPaymentRequest.skeletons,
  kotakPaymentResponse.skeletons,
  kotakReversal.skeletons,
  flinks.skeletons,
  plaid.skeletons);

var proxies = [];
proxies = proxies.concat(
  foam.proxies,
  nanopay.proxies,
  merchant.proxies,
  interac.proxies,
  iso20022.proxies,
  iso8583.proxies,
  afx.proxies,
  kotakPaymentRequest.proxies,
  kotakPaymentResponse.proxies,
  kotakReversal.proxies,
  flinks.proxies,
  plaid.proxies);

var blacklist = [];
blacklist = blacklist.concat(
  foam.blacklist,
  nanopay.blacklist,
  merchant.blacklist,
  interac.blacklist,
  iso20022.blacklist,
  iso8583.blacklist,
  afx.blacklist,
  kotakPaymentRequest.blacklist,
  kotakPaymentResponse.blacklist,
  kotakReversal.blacklist,
  flinks.blacklist,
  plaid.blacklist);

module.exports = {
  classes: classes,
  abstractClasses: abstractClasses,
  skeletons: skeletons,
  proxies: proxies,
  blacklist: blacklist
}
