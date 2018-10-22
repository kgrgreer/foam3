require('./files.js');

var classes = [
  'net.nanopay.iso8583.ISOComponent',
  'net.nanopay.iso8583.ISOField',
  'net.nanopay.iso8583.ISOMessage',
  'net.nanopay.iso8583.ISOPackager',
];
var abstractClasses = [];
var skeletons = [];
var proxies = [];
var blacklist = [];

module.exports = {
  classes: classes,
  abstractClasses: abstractClasses,
  skeletons: skeletons,
  proxies: proxies,
  blacklist: blacklist
};
