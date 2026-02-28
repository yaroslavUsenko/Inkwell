Feature: Blog Post Management
  As a logged-in Inkwell user
  I want to create new blog posts
  So that I can share my thoughts with the community

  Background:
    Given I am logged in with valid credentials

  @SuccessfulLandOnAddBlogPost
  Scenario: Navigate to the Add New Post page
    When I click the "Add New Post" navigation link
    Then I should be on the create post page
    And I should see the "Add New Post" heading

  @SuccessfulAddBlogPost
  Scenario: Successfully create a new blog post
    When I click the "Add New Post" navigation link
    And I fill in the post title with "Title"
    And I fill in the post description with "some short description"
    And I fill in the post content with "some body"
    And I click the Add Post button
    Then I should be on the home page
    And I should see the success message "Blog Post posted successfully!"
