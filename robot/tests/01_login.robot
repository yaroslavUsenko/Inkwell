*** Settings ***
Resource    ../resources/keywords.resource

Suite Setup       Open Browser    about:blank    ${BROWSER}
Suite Teardown    Close Browser
Test Setup        Open Page    /login


*** Test Cases ***

# @SuccessfulLogin ─────────────────────────────────────────────────────────────
@SuccessfulLogin - Successful Login With Valid Credentials
    Fill Text Field       id:username    ${VALID_EMAIL}
    Fill Text Field       id:password    ${VALID_PASSWORD}
    Click Button With Text    Log In
    Wait For Navigation To    /
    Verify User Is Logged In


# @failedLogin ────────────────────────────────────────────────────────────────
@failedLogin - Failed Login With Wrong Credentials: araj / !23
    Fill Text Field       id:username    araj
    Fill Text Field       id:password    !23
    Click Button With Text    Log In
    Verify Current Page Is    /login
    Verify Error Message      Invalid username/password, Try again!

@failedLogin - Failed Login With Uppercase Username: ARAJ / !23
    Fill Text Field       id:username    ARAJ
    Fill Text Field       id:password    !23
    Click Button With Text    Log In
    Verify Current Page Is    /login
    Verify Error Message      Invalid username/password, Try again!

@failedLogin - Failed Login With Mixed-Case Username: aRaJ / !23
    Fill Text Field       id:username    aRaJ
    Fill Text Field       id:password    !23
    Click Button With Text    Log In
    Verify Current Page Is    /login
    Verify Error Message      Invalid username/password, Try again!

@failedLogin - Failed Login With Wrong Username: Test / !23
    Fill Text Field       id:username    Test
    Fill Text Field       id:password    !23
    Click Button With Text    Log In
    Verify Current Page Is    /login
    Verify Error Message      Invalid username/password, Try again!


# @DisabledLogin ──────────────────────────────────────────────────────────────
@DisabledLogin - Log In Button Disabled When Username Is Blank
    # Focus username field then move away without typing
    Focus Element         id:username
    Fill Text Field       id:password    Asdf@1234
    Focus Element         id:password
    Verify Error Message      The username is required and cannot be empty
    Verify Button Is Disabled    Log In
    Verify Current Page Is    /login

@DisabledLogin - Log In Button Disabled When Password Is Blank
    Fill Text Field       id:username    araj
    # Focus password field then move away without typing
    Focus Element         id:password
    Focus Element         id:username
    Verify Error Message      The Password is required and cannot be empty
    Verify Button Is Disabled    Log In
    Verify Current Page Is    /login
