// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class BoxRegistryBox: BoxRegistry, Box {

  public var registrySkeleton: Box? {
    get {
      
if _registrySkeleton_inited_ {
  return _registrySkeleton_
}

self.set(key: "registrySkeleton", value: _registrySkeleton_factory_())
return _registrySkeleton_!

      
    }
set(value) {
      
self.set(key: "registrySkeleton", value: value)
      
    }
  }

  var _registrySkeleton_: Box? = nil

  var _registrySkeleton_inited_: Bool = false

  public static let REGISTRY_SKELETON: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "registrySkeleton"
  let classInfo: ClassInfo
  let transient = false
  let label = "Registry Skeleton" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var registrySkeleton_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "registrySkeleton",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var registrySkeleton_Value_Sub_: Subscription?

  public var registrySkeleton$: Slot {
    get {
      return self.registrySkeleton_Value_
    }
set(value) {
      
self.registrySkeleton_Value_Sub_?.detach()
self.registrySkeleton_Value_Sub_ = self.registrySkeleton$.linkFrom(value)
self.onDetach(self.registrySkeleton_Value_Sub_!)
      
    }
  }

  lazy var send$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let msg = args[0] as! Message

    
    return try self!.`send`(
        _: msg)
  }
])
      
  }()

  public static let SEND: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "send"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  private static var classInfo_: ClassInfo = ClassInfo_()

  public func `SubBoxMessage_create`(_ args: [String:Any?] = [:]) -> SubBoxMessage {
    
return __subContext__.create(SubBoxMessage.self, args: args)!
      
  }

  public func `Message_create`(_ args: [String:Any?] = [:]) -> Message {
    
return __subContext__.create(Message.self, args: args)!
      
  }

  public func `HelloMessage_create`(_ args: [String:Any?] = [:]) -> HelloMessage {
    
return __subContext__.create(HelloMessage.self, args: args)!
      
  }

  public func `SkeletonBox_create`(_ args: [String:Any?] = [:]) -> SkeletonBox {
    
return __subContext__.create(SkeletonBox.self, args: args)!
      
  }

  private func `_registrySkeleton_factory_`() -> Box? {
    return SkeletonBox_create(["data": self])
  }

  private func `_registrySkeleton_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Box? {
    return newValue as! Box?
  }

  private func `_registrySkeleton_preSet_`(_ oldValue: Any?, _ newValue: Box?) -> Box? {
    return newValue
  }

  private func `_registrySkeleton_postSet_`(_ oldValue: Any?, _ newValue: Box?) {
    
  }

  public func `send`(_ msg: Message) throws {
    
if let object = msg.object as? SubBoxMessage {
  let name = object.name

  if let reg = registry_[name] as? Registration {
    msg.object = object.object;
    try reg.localBox.send(msg);
  } else {
    if let errorBox = msg.attributes["errorBox"] as? Box {
      try errorBox.send(
        Message_create([
          "object": NoSuchNameException_create(["name": name ])
        ]))
    }
  }
} else if let _ = msg.object as? HelloMessage {
} else {
  try registrySkeleton!.send(msg)
}
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return BoxRegistryBox.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return BoxRegistryBox.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "registrySkeleton":
    _registrySkeleton_inited_ = false
    _registrySkeleton_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "registrySkeleton"]) {
      _ = pub(["propertyChange", "registrySkeleton", registrySkeleton$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "registrySkeleton": return `_registrySkeleton_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "registrySkeleton": return `registrySkeleton`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "registrySkeleton": return `registrySkeleton$`


  case "send": return `send$`

  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "registrySkeleton$":
    registrySkeleton$ = value as! Slot
    return
  case "registrySkeleton":
  
    let oldValue: Any? = _registrySkeleton_inited_ ? self.`registrySkeleton` : nil
    _registrySkeleton_ = _registrySkeleton_preSet_(oldValue, _registrySkeleton_adapt_(oldValue, value))
    _registrySkeleton_inited_ = true
    _registrySkeleton_postSet_(oldValue, _registrySkeleton_)
    if hasListeners(["propertyChange", "registrySkeleton"]) && !FOAM_utils.equals(oldValue, _registrySkeleton_) {
      _ = pub(["propertyChange", "registrySkeleton", registrySkeleton$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.box.BoxRegistryBox"

    lazy var label: String = "Box Registry Box"

    lazy var parent: ClassInfo? = BoxRegistry.classInfo()

    lazy var ownAxioms: [Axiom] = [REGISTRY_SKELETON,SEND]

    lazy var cls: AnyClass = BoxRegistryBox.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return BoxRegistryBox(args, x)
    }

  }

}