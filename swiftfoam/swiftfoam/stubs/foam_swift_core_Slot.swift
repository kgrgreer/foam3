// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class Slot: AbstractFObject {

  lazy var swiftGet$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    
    return self!.`swiftGet`(
        )
  }
])
      
  }()

  public static let SWIFT_GET: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "swiftGet"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var swiftSet$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let value = args[0]

    
    return self!.`swiftSet`(
        _: value)
  }
])
      
  }()

  public static let SWIFT_SET: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "swiftSet"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var swiftSub$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let listener = args[0] as! Listener

    
    return self!.`swiftSub`(
        _: listener)
  }
])
      
  }()

  public static let SWIFT_SUB: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "swiftSub"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var linkFrom$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let s2 = args[0] as! Slot

    
    return self!.`linkFrom`(
        _: s2)
  }
])
      
  }()

  public static let LINK_FROM: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "linkFrom"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var linkTo$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let other = args[0] as! Slot

    
    return self!.`linkTo`(
        _: other)
  }
])
      
  }()

  public static let LINK_TO: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "linkTo"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var follow$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let other = args[0] as! Slot

    
    return self!.`follow`(
        _: other)
  }
])
      
  }()

  public static let FOLLOW: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "follow"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var mapFrom$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let other = args[0] as! Slot

    let f = args[1] as! (Any?) -> Any?

    
    return self!.`mapFrom`(
        _: other, _: f)
  }
])
      
  }()

  public static let MAP_FROM: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "mapFrom"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var mapTo$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let other = args[0] as! Slot

    let f = args[1] as! (Any?) -> Any?

    
    return self!.`mapTo`(
        _: other, _: f)
  }
])
      
  }()

  public static let MAP_TO: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "mapTo"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var map$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let f = args[0] as! (Any?) -> Any?

    
    return self!.`map`(
        _: f)
  }
])
      
  }()

  public static let MAP: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "map"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var dot$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let name = args[0] as! String

    
    return self!.`dot`(
        _: name)
  }
])
      
  }()

  public static let DOT: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "dot"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  private static var classInfo_: ClassInfo = ClassInfo_()

  public func `swiftGet`() -> Any? {
    fatalError()
  }

  public func `swiftSet`(_ value: Any?) {
    fatalError()
  }

  public func `swiftSub`(_ listener: @escaping Listener) -> Subscription {
    fatalError()
  }

  public func `linkFrom`(_ s2: Slot) -> Subscription {
    
let s1 = self
var feedback1 = false
var feedback2 = false

let l1 = { () -> Void in
  if feedback1 { return }

  if !FOAM_utils.equals(s1.swiftGet(), s2.swiftGet()) {
    feedback1 = true
    s2.swiftSet(s1.swiftGet())
    if !FOAM_utils.equals(s1.swiftGet(), s2.swiftGet()) { s1.swiftSet(s2.swiftGet()) }
    feedback1 = false
  }
}

let l2 = { () -> Void in
  if feedback2 { return }

  if !FOAM_utils.equals(s1.swiftGet(), s2.swiftGet()) {
    feedback2 = true
    s1.swiftSet(s2.swiftGet())
    if !FOAM_utils.equals(s1.swiftGet(), s2.swiftGet()) { s2.swiftSet(s1.swiftGet()) }
    feedback2 = false
  }
}

var sub1: Subscription? = s1.swiftSub { (_, _) in l1() }
var sub2: Subscription? = s2.swiftSub { (_, _) in l2() }

l2()

return Subscription {
  sub1?.detach()
  sub2?.detach()
  sub1 = nil
  sub2 = nil
}
      
  }

  public func `linkTo`(_ other: Slot) -> Subscription {
    
return other.linkFrom(self)
      
  }

  public func `follow`(_ other: Slot) -> Subscription {
    
let l = { () -> Void in
  if !FOAM_utils.equals(self.swiftGet(), other.swiftGet()) {
    self.swiftSet(other.swiftGet())
  }
}
l()
return other.swiftSub { (_, _) in l() }
      
  }

  public func `mapFrom`(_ other: Slot, _ f: @escaping (Any?) -> Any?) -> Subscription {
    
let l = { () -> Void in
  self.swiftSet(f(other.swiftGet()))
}
l()
return other.swiftSub { (_, _) in l() }
      
  }

  public func `mapTo`(_ other: Slot, _ f: @escaping (Any?) -> Any?) -> Subscription {
    
return other.mapFrom(self, f)
      
  }

  public func `map`(_ f: @escaping (Any?) -> Any?) -> ExpressionSlot {
    
return ExpressionSlot([
  "code": { (args: [Any?]) -> Any? in f(args[0]) },
  "args": [self]
])
      
  }

  public func `dot`(_ name: String) -> SubSlot {
    
let s = SubSlot([
  "parentSlot": self,
  "name": name,
])
onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return Slot.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return Slot.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {


  case "swiftGet": return `swiftGet$`

  case "swiftSet": return `swiftSet$`

  case "swiftSub": return `swiftSub$`

  case "linkFrom": return `linkFrom$`

  case "linkTo": return `linkTo$`

  case "follow": return `follow$`

  case "mapFrom": return `mapFrom$`

  case "mapTo": return `mapTo$`

  case "map": return `map$`

  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.swift.core.Slot"

    lazy var label: String = "Slot"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [SWIFT_GET,SWIFT_SET,SWIFT_SUB,LINK_FROM,LINK_TO,FOLLOW,MAP_FROM,MAP_TO,MAP,DOT]

    lazy var cls: AnyClass = Slot.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return Slot(args, x)
    }

  }

}