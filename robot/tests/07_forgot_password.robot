*** Settings ***
Resource    ../resources/keywords.resource

Suite Setup       Open Browser    about:blank    ${BROWSER}
Suite Teardown    Close Browser
Test Setup        Open Page    /forgot-password


*** Test Cases ***

# @SuccessfulForgotPassword ───────────────────────────────────────────────────
@SuccessfulForgotPassword - Submit Forgot Password Form With Valid Email
    Fill Text Field       id:email    asdf@example.com
    Click Button With Text    Submit
    Verify Current Page Is    /forgot-password

# @failedForgotPassword ───────────────────────────────────────────────────────
@failedForgotPassword - Submit Forgot Password Form With Non-Existent Email
    Fill Text Field       id:email    asdf.invalid@example.com
    Click Button With Text    Submit
    Verify Current Page Is    /forgot-password
    Verify Error Message      No account with that email address exists.
