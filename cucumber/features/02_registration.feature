Feature: User Authentication — Registration
  As a new visitor
  I want to register an account on Inkwell
  So that I can start writing blog posts

  Background:
    Given I open the registration page

  @SuccessfulRegistration
  Scenario: Successful registration with valid data
    When I fill in registration username with a unique value
    And I fill in registration email with a unique value
    And I fill in registration password with "Asdf@1234"
    And I fill in registration confirm password with "Asdf@1234"
    And I click the Register Now button
    Then I should be on the home page
    And I should see the "All Posts" heading
    And I should see the logout button
    And I should see the "Add New Post" link

  @DisabledRegistration
  Scenario: Register Now button disabled when username is empty
    When I focus and leave the registration username field empty
    And I fill in registration email with "test@example.com"
    And I fill in registration password with "Asdf@1234"
    And I fill in registration confirm password with "Asdf@1234"
    Then I should see the field validation error "The username is required and cannot be empty"
    And the Register Now button should be disabled

  @DisabledRegistration
  Scenario: Register Now button disabled when email is empty
    When I fill in registration username with "testuser"
    And I focus and leave the registration email field empty
    And I fill in registration password with "Asdf@1234"
    And I fill in registration confirm password with "Asdf@1234"
    Then I should see the field validation error "The email is required and cannot be empty"
    And the Register Now button should be disabled

  @DisabledRegistration
  Scenario: Register Now button disabled when email format is invalid
    When I fill in registration username with "testuser"
    And I fill in registration email with "invalid-email"
    And I fill in registration password with "Asdf@1234"
    And I fill in registration confirm password with "Asdf@1234"
    Then I should see the field validation error "The email address is not valid"
    And the Register Now button should be disabled

  @DisabledRegistration
  Scenario: Register Now button disabled when confirm password does not match
    When I fill in registration username with "testuser"
    And I fill in registration email with "test@example.com"
    And I fill in registration password with "Asdf@1234"
    And I fill in registration confirm password with "Wrong@1234"
    Then I should see the field validation error "The password and its confirm are not the same"
    And the Register Now button should be disabled
