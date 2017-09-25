// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class RPCMessage: Message {

  public var name: String {
    get {
      
if _name_inited_ {
  return _name_!
}

return ""

      
    }
set(value) {
      
self.set(key: "name", value: value)
      
    }
  }

  var _name_: String! = nil

  var _name_inited_: Bool = false

  public static let NAME: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "name"
  let classInfo: ClassInfo
  let transient = false
  let label = "Name" // TODO localize
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

  private lazy var name_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "name",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var name_Value_Sub_: Subscription?

  public var name$: Slot {
    get {
      return self.name_Value_
    }
set(value) {
      
self.name_Value_Sub_?.detach()
self.name_Value_Sub_ = self.name$.linkFrom(value)
self.onDetach(self.name_Value_Sub_!)
      
    }
  }

  public var args: [Any?] {
    get {
      
if _args_inited_ {
  return _args_!
}

return []

      
    }
set(value) {
      
self.set(key: "args", value: value)
      
    }
  }

  var _args_: [Any?]! = nil

  var _args_inited_: Bool = false

  public static let ARGS: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "args"
  let classInfo: ClassInfo
  let transient = false
  let label = "Args" // TODO localize
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

  private lazy var args_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "args",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var args_Value_Sub_: Subscription?

  public var args$: Slot {
    get {
      return self.args_Value_
    }
set(value) {
      
self.args_Value_Sub_?.detach()
self.args_Value_Sub_ = self.args$.linkFrom(value)
self.onDetach(self.args_Value_Sub_!)
      
    }
  }

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_name_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> String {
    
if let newValue = newValue as? String { return newValue }
if newValue != nil { return String(describing: newValue!) }
return ""
        
  }

  private func `_name_preSet_`(_ oldValue: Any?, _ newValue: String) -> String {
    return newValue
  }

  private func `_name_postSet_`(_ oldValue: Any?, _ newValue: String) {
    
  }

  private func `_args_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> [Any?] {
    return newValue as! [Any?]
  }

  private func `_args_preSet_`(_ oldValue: Any?, _ newValue: [Any?]) -> [Any?] {
    return newValue
  }

  private func `_args_postSet_`(_ oldValue: Any?, _ newValue: [Any?]) {
    
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return RPCMessage.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return RPCMessage.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "name":
    _name_inited_ = false
    _name_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "name"]) {
      _ = pub(["propertyChange", "name", name$])
    }
    break

  case "args":
    _args_inited_ = false
    _args_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "args"]) {
      _ = pub(["propertyChange", "args", args$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "name": return `_name_inited_`

  case "args": return `_args_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "name": return `name`

  case "args": return `args`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "name": return `name$`

  case "args": return `args$`


  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "name$":
    name$ = value as! Slot
    return
  case "name":
  
    let oldValue: Any? = _name_inited_ ? self.`name` : nil
    _name_ = _name_preSet_(oldValue, _name_adapt_(oldValue, value))
    _name_inited_ = true
    _name_postSet_(oldValue, _name_)
    if hasListeners(["propertyChange", "name"]) && !FOAM_utils.equals(oldValue, _name_) {
      _ = pub(["propertyChange", "name", name$])
    }
    return

  case "args$":
    args$ = value as! Slot
    return
  case "args":
  
    let oldValue: Any? = _args_inited_ ? self.`args` : nil
    _args_ = _args_preSet_(oldValue, _args_adapt_(oldValue, value))
    _args_inited_ = true
    _args_postSet_(oldValue, _args_)
    if hasListeners(["propertyChange", "args"]) && !FOAM_utils.equals(oldValue, _args_) {
      _ = pub(["propertyChange", "args", args$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.box.RPCMessage"

    lazy var label: String = "RPCMessage"

    lazy var parent: ClassInfo? = Message.classInfo()

    lazy var ownAxioms: [Axiom] = [NAME,ARGS]

    lazy var cls: AnyClass = RPCMessage.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return RPCMessage(args, x)
    }

  }

}