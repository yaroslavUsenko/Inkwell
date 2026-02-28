*** Settings ***
Resource    ../resources/keywords.resource

Suite Setup       Open Browser    about:blank    ${BROWSER}
Suite Teardown    Close Browser
Test Setup        Login As User    ${VALID_EMAIL}    ${VALID_PASSWORD}


*** Test Cases ***

# @SuccessfulLogout ───────────────────────────────────────────────────────────
@SuccessfulLogout - Successful Logout And Redirect To Login Page
    Click Button With Text    Logout
    Wait For Navigation To    /login
