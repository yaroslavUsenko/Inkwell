Feature: User Authentication — Logout
  As a logged-in Inkwell user
  I want to log out of my account
  So that my session is securely terminated

  Background:
    Given I am logged in with valid credentials

  @SuccessfulLogout
  Scenario: Successful logout and redirect to login page
    When I click the logout button
    Then I should be on the login page
