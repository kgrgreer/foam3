var foam = require('../foam2/tools/classes.js')
foam.classes = foam.classes.map(function(element) { return [ 'foam2/src/', element ]; })
foam.abstractClasses = foam.abstractClasses.map(function(element) { return ['foam2/src/', element ]; })
foam.skeletons = foam.skeletons.map(function(element) { return ['foam2/src/', element ]; })
foam.proxies = foam.proxies.map(function(element) { return ['foam2/src/', element ]; })

var nanopay = require('../nanopay/tools/classes.js')
nanopay.classes = nanopay.classes.map(function(element) { return [ 'nanopay/src/', element ]; })
nanopay.abstractClasses = nanopay.abstractClasses.map(function(element) { return [ 'nanopay/src/', element ]; })
nanopay.skeletons = nanopay.skeletons.map(function(element) { return [ 'nanopay/src/', element ]; })
nanopay.proxies = nanopay.proxies.map(function(element) { return [ 'nanopay/src/', element ]; })

var b2b = require('../b2b/tools/classes.js')
b2b.classes = b2b.classes.map(function(element) { return [ 'b2b/src/', element ]; })
b2b.abstractClasses = b2b.abstractClasses.map(function(element) { return [ 'b2b/src/', element ]; })
b2b.skeletons = b2b.skeletons.map(function(element) { return [ 'b2b/src/', element ]; })
b2b.proxies = b2b.proxies.map(function(element) { return [ 'b2b/src/', element ]; })

var admin = require('../admin-portal/tools/classes.js')
admin.classes = admin.classes.map(function(element) { return [ 'admin-portal/src/', element ]; })
admin.abstractClasses = admin.abstractClasses.map(function(element) { return [ 'admin-portal/src/', element ]; })
admin.skeletons = admin.skeletons.map(function(element) { return [ 'admin-portal/src/', element ]; })
admin.proxies = admin.proxies.map(function(element) { return [ 'admin-portal/src/', element ]; })

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

var classes = [];
classes = classes.concat(foam.classes, nanopay.classes, b2b.classes, admin.classes, merchant.classes, interac.classes)

var abstractClasses = [];
abstractClasses = abstractClasses.concat(foam.abstractClasses, nanopay.abstractClasses, b2b.abstractClasses, admin.abstractClasses, merchant.abstractClasses, interac.abstractClasses)

var skeletons = [];
skeletons = skeletons.concat(foam.skeletons, nanopay.skeletons, b2b.skeletons, admin.skeletons, merchant.skeletons, interac.skeletons)

var proxies = [];
proxies = proxies.concat(foam.proxies, nanopay.proxies, b2b.proxies, admin.proxies, merchant.proxies, interac.proxies)


module.exports = {
    classes: classes,
    abstractClasses: abstractClasses,
    skeletons: skeletons,
    proxies: proxies
}
