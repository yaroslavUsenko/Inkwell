*** Settings ***
Resource    ../resources/keywords.resource

Suite Setup       Open Browser    about:blank    ${BROWSER}
Suite Teardown    Close Browser
Test Setup        Login As User    ${VALID_EMAIL}    ${VALID_PASSWORD}


*** Test Cases ***

# @SuccessfulLandOnAddBlogPost ─────────────────────────────────────────────────
@SuccessfulLandOnAddBlogPost - Successful Landing On Add A Blog/Post Page
    Click Link With Text    Add New Post
    Verify Current Page Is    /posts/create
    Verify Heading Is Visible    Add New Post

# @SuccessfulAddBlogPost ──────────────────────────────────────────────────────
@SuccessfulAddBlogPost - Successful Creation Of A Blog/Post
    Click Link With Text    Add New Post
    Fill Text Field       id:title          Title
    Fill Text Field       id:description    some short description
    Fill Text Field       id:body           some body
    Click Button With Text    Add Post
    Wait For Navigation To    /
    Verify Text Is Visible    Blog Post posted successfully!
