Feature: Blog Post Comments
  As a logged-in Inkwell user
  I want to add comments to blog posts
  So that I can engage with other writers

  Background:
    Given I am logged in with valid credentials

  @SuccessfulAddComment
  Scenario: Successfully add a comment to a blog post
    When I open the first blog post
    And I write the comment "This is a great article!"
    And I click the Add Comment button
    Then I should see the success message "Comment added to the Post"
