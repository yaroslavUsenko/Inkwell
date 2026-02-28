*** Settings ***
Resource    ../resources/keywords.resource

Suite Setup       Open Browser    about:blank    ${BROWSER}
Suite Teardown    Close Browser
Test Setup        Login As User    ${VALID_EMAIL}    ${VALID_PASSWORD}


*** Test Cases ***

# @EdiProfile ─────────────────────────────────────────────────────────────────
@EdiProfile - Successful Edit Of Profile
    Click Link With Text    My Profile
    Fill Text Field       name:firstname    ashis
    Fill Text Field       name:lastname     raj
    Fill Text Field       name:age          25
    Select Option         name:gender       Male
    Fill Text Field       name:address      E-605
    Fill Text Field       name:website      https://example.com
    Click Button With Text    Update Profile
    Wait For Navigation To    /
    Verify Text Is Visible    Profile updated successfully!

# @ViewProfile ────────────────────────────────────────────────────────────────
@ViewProfile - Successful View Of Profile Page
    Click Link With Text    My Profile
    Verify Heading Is Visible    Your Profile
    Verify Text Is Visible       Email: usenko.0265@gmail.com
    Verify Text Is Visible       Age: 25
    Verify Text Is Visible       Gender: Male
    Verify Text Is Visible       Address: E-
    Verify Text Is Visible       Website: https://example.com
