#
# Be sure to run `pod lib lint swiftfoam.podspec' to ensure this is a
# valid spec before submitting.
#
# Any lines starting with a # are optional, but their use is encouraged
# To learn more about a Podspec see http://guides.cocoapods.org/syntax/podspec.html
#

Pod::Spec.new do |s|
s.name             = 'swiftfoam'
s.version          = '1.0.0'
s.summary          = 'FOAM for Swift'
s.description      = 'Various tools written in Swift for the MintChip platform'
s.homepage         = 'https://github.com/nanoPayinc/NANOPAY/tree/master/swiftfoam'
s.license          = { :type => 'MIT', :file => 'LICENSE' }
s.author           = { 'Kenny Kan' => 'kenny@nanopay.net' }
s.source           = { :git => 'https://github.com/nanoPayinc/NANOPAY.git', :tag => s.version.to_s }
s.ios.deployment_target = '8.0'
s.source_files = 'swiftfoam/*'
end
