*** Settings ***
Resource    ../resources/keywords.resource

Suite Setup       Open Browser    about:blank    ${BROWSER}
Suite Teardown    Close Browser
Test Setup        Open Page    /register


*** Test Cases ***

# @SuccessfulRegistration ─────────────────────────────────────────────────────
@SuccessfulRegistration - Redirects To Home With Nav After Valid Credentials
    Fill Text Field       id:username    asdf.asdf
    Fill Text Field       id:email       asdf.asdf@example.com
    Fill Text Field       id:password    Asdf@1234
    Fill Text Field       id:confirm     Asdf@1234
    Click Button With Text    Register Now
    Wait For Navigation To    /
    Verify Heading Is Visible    All Posts
    Verify Button Is Visible     Logout
    Verify Link Is Visible       Add New Post


# @DisabledRegistration ───────────────────────────────────────────────────────
@DisabledRegistration - Shows Error And Disables Submit When Username Is Blank
    Focus Element         id:username
    Fill Text Field       id:email       asdf.asdf@example.com
    Fill Text Field       id:password    Asdf@1234
    Fill Text Field       id:confirm     Asdf@1234
    Verify Error Message      The username is required and cannot be empty
    Verify Button Is Disabled    Register Now
    Verify Current Page Is    /register

@DisabledRegistration - Shows Error And Disables Submit When Email Is Blank
    Fill Text Field       id:username    asdf
    Focus Element         id:email
    Fill Text Field       id:password    Asdf@1234
    Fill Text Field       id:confirm     Asdf@1234
    Focus Element         id:username
    Verify Error Message      The email is required and cannot be empty
    Verify Button Is Disabled    Register Now
    Verify Current Page Is    /register

@DisabledRegistration - Shows Error And Disables Submit When Email Is Invalid
    Fill Text Field       id:username    asdf
    Fill Text Field       id:email       asdf
    Fill Text Field       id:password    Asdf@1234
    Fill Text Field       id:confirm     Asdf@1234
    Verify Error Message      The email address is not valid
    Verify Button Is Disabled    Register Now
    Verify Current Page Is    /register

@DisabledRegistration - Shows Error And Disables Submit When Confirm Password Is Blank
    Fill Text Field       id:username    asdf
    Fill Text Field       id:email       asdf.asdf@example.com
    Fill Text Field       id:password    Asdf@1234
    Focus Element         id:confirm
    Focus Element         id:password
    Verify Error Message      The confirm password is required and cannot be empty
    Verify Button Is Disabled    Register Now
    Verify Current Page Is    /register

@DisabledRegistration - Shows Error And Disables Submit When Password Mismatch
    Fill Text Field       id:username    asdf
    Fill Text Field       id:email       asdf.asdf@example.com
    Fill Text Field       id:confirm     Asdf@1234
    Focus Element         id:password
    Focus Element         id:username
    Verify Error Message      The password and its confirm are not the same
    Verify Button Is Disabled    Register Now
    Verify Current Page Is    /register
