require('../common/src/net/nanopay/common/files.js')

var foam = require('../../foam2/tools/classes.js')
foam.classes = foam.classes.map(function(element) { return [ '../foam2/src/', element ]; })
foam.abstractClasses = foam.abstractClasses.map(function(element) { return ['../foam2/src/', element ]; })
foam.skeletons = foam.skeletons.map(function(element) { return ['../foam2/src/', element ]; })
foam.proxies = foam.proxies.map(function(element) { return ['../foam2/src/', element ]; })

var common = require('../common/classes.js')
common.classes = common.classes.map(function(element) { return [ 'common/src/', element ]; })
common.abstractClasses = common.abstractClasses.map(function(element) { return [ 'common/src/', element ]; })
common.skeletons = common.skeletons.map(function(element) { return [ 'common/src/', element ]; })
common.proxies = common.proxies.map(function(element) { return [ 'common/src/', element ]; })

var b2b = require('../b2b/classes.js')
b2b.classes = b2b.classes.map(function(element) { return [ 'b2b/src/', element ]; })
b2b.abstractClasses = b2b.abstractClasses.map(function(element) { return [ 'b2b/src/', element ]; })
b2b.skeletons = b2b.skeletons.map(function(element) { return [ 'b2b/src/', element ]; })
b2b.proxies = b2b.proxies.map(function(element) { return [ 'b2b/src/', element ]; })

var retail = require('../retail/classes.js')
retail.classes = retail.classes.map(function(element) { return [ 'retail/src/', element ]; })
retail.abstractClasses = retail.abstractClasses.map(function(element) { return [ 'retail/src/', element ]; })
retail.skeletons = retail.skeletons.map(function(element) { return [ 'retail/src/', element ]; })
retail.proxies = retail.proxies.map(function(element) { return [ 'retail/src/', element ]; })

var admin = require('../admin-portal/classes.js')
admin.classes = admin.classes.map(function(element) { return [ 'admin-portal/src/', element ]; })
admin.abstractClasses = admin.abstractClasses.map(function(element) { return [ 'admin-portal/src/', element ]; })
admin.skeletons = admin.skeletons.map(function(element) { return [ 'admin-portal/src/', element ]; })
admin.proxies = admin.proxies.map(function(element) { return [ 'admin-portal/src/', element ]; })

var ingenico = require('../ingenico/classes.js')
ingenico.classes = retail.classes.map(function(element) { return [ 'ingenico/src/', element ]; })
ingenico.abstractClasses = retail.abstractClasses.map(function(element) { return [ 'ingenico/src/', element ]; })
ingenico.skeletons = retail.skeletons.map(function(element) { return [ 'ingenico/src/', element ]; })
ingenico.proxies = retail.proxies.map(function(element) { return [ 'ingenico/src/', element ]; })

var interac = require('../retail/classes.js')
interac.classes = interac.classes.map(function(element) { return [ 'interac/src/', element ]; })
interac.abstractClasses = interac.abstractClasses.map(function(element) { return [ 'interac/src/', element ]; })
interac.skeletons = interac.skeletons.map(function(element) { return [ 'interac/src/', element ]; })
interac.proxies = interac.proxies.map(function(element) { return [ 'interac/src/', element ]; })

var transaction = require('../transaction-service/tools/classes.js')
transaction.classes = transaction.classes.map(function(element) { return [ 'transaction-service/src/', element ]; })
transaction.abstractClasses = transaction.abstractClasses.map(function(element) { return [ 'transaction-service/src/', element ]; })
transaction.skeletons = transaction.skeletons.map(function(element) { return [ 'transaction-service/src/', element ]; })
transaction.proxies = transaction.proxies.map(function(element) { return [ 'transaction-service/src/', element ]; })

var exchangeRate = require('../exchange-rate/tools/classes.js')
exchangeRate.classes = exchangeRate.classes.map(function(element) { return [ 'exchange-rate/src/', element ]; })
exchangeRate.abstractClasses = exchangeRate.abstractClasses.map(function(element) { return [ 'exchange-rate/src/', element ]; })
exchangeRate.skeletons = exchangeRate.skeletons.map(function(element) { return [ 'exchange-rate/src/', element ]; })
exchangeRate.proxies = exchangeRate.proxies.map(function(element) { return [ 'exchange-rate/src/', element ]; })

var classes = [];
classes = classes.concat(foam.classes, common.classes, b2b.classes, retail.classes, admin.classes, ingenico.classes, interac.classes, transaction.classes, exchangeRate.classes)

var abstractClasses = [];
abstractClasses = abstractClasses.concat(foam.abstractClasses, common.abstractClasses, b2b.abstractClasses, retail.abstractClasses, admin.abstractClasses, ingenico.abstractClasses, interac.abstractClasses, transaction.abstractClasses, exchangeRate.abstractClasses)

var skeletons = [];
skeletons = skeletons.concat(foam.skeletons, common.skeletons, b2b.skeletons, retail.skeletons, admin.skeletons, ingenico.skeletons, interac.skeletons, transaction.skeletons, exchangeRate.skeletons)

var proxies = [];
proxies = proxies.concat(foam.proxies, common.proxies, b2b.proxies, retail.proxies, admin.proxies, ingenico.proxies, interac.proxies, transaction.proxies, exchangeRate.proxies)


module.exports = {
    classes: classes,
    abstractClasses: abstractClasses,
    skeletons: skeletons,
    proxies: proxies
}