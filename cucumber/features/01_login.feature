Feature: User Authentication — Login
  As a registered Inkwell user
  I want to log in to my account
  So that I can access the blog platform

  Background:
    Given I open the login page

  @SuccessfulLogin
  Scenario: Successful login with valid credentials
    When I enter "usenko.0265@gmail.com" in the username field
    And I enter "654321" in the password field
    And I click the Log In button
    Then I should be on the home page
    And I should see the "All Posts" heading
    And I should see the logout button
    And I should see the "Add New Post" link

  @failedLogin
  Scenario Outline: Failed login with invalid credentials
    When I enter "<username>" in the username field
    And I enter "<password>" in the password field
    And I click the Log In button
    Then I should remain on the login page
    And I should see the error message "Invalid username/password, Try again!"

    Examples:
      | username | password |
      | araj     | !23      |
      | ARAJ     | !23      |
      | aRaJ     | !23      |
      | Test     | !23      |

  @DisabledLogin
  Scenario: Log In button is disabled when username field is empty
    When I focus and leave the username field empty
    And I enter "Asdf@1234" in the password field
    Then I should see the field validation error "The username is required and cannot be empty"
    And the Log In button should be disabled

  @DisabledLogin
  Scenario: Log In button is disabled when password field is empty
    When I enter "araj" in the username field
    And I focus and leave the password field empty
    Then I should see the field validation error "The Password is required and cannot be empty"
    And the Log In button should be disabled
