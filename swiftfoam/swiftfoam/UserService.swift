//
//  UserService.swift
//  swiftfoam
//
//  Created by Kenny Kan on 2017-10-03.
//  Copyright © 2017 nanoPay Corporation. All rights reserved.
//

public class UserService: Service {
  public static let instance: UserService = UserService()

  private var loggedInUser: User?

  init() {
    super.init(withURL: ServiceURL.User)
  }

  public func register(user: User, callback: @escaping (Any?) -> Void) {

  }

  public func login(withUsername username: String,
                    andPassword pass: String,
                    callback: @escaping (Any?) -> Void)
  {
    
  }

  /*
   * loggedInUser is private, thus a user cannot modify it unless the user has logged
   * in properly. Therefore, this function should be used to check if there is a valid
   * user logged in
   */
  public func isUserLoggedIn() -> Bool {
    return loggedInUser != nil
  }

  public func update(user: User, callback: @escaping (Any?) -> Void) {

  }

  public func get(userWithId id: Int, callback: @escaping (Any?) -> Void) {

  }
}
