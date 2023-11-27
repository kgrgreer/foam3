foam.POM({
  name: "referral",
  projects: [
    { name: 'test/pom' }
],
  files: [
    { name: "ReferralCode",                       flags: "js|java" },
    { name: "CreateReferralCode",                 flags: "js|java" },
    { name: "ReferUserView",                   flags: "web" }
  ]
});