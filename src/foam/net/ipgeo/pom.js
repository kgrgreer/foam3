foam.POM({
  name: "ipgeo",

  javaDependencies: [
    'com.maxmind.geoip2:geoip2:4.2.0',
  ],

  files: [
    { name: "GeolocationSupport",                       flags: "js|java" },
    { name: "IPGeolocationInfo",                        flags: "js|java" }
  ]
});
