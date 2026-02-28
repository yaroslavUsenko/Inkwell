*** Settings ***
Library     SeleniumLibrary    timeout=10s    implicit_wait=2s
Resource    variables.resource


*** Variables ***
${TIMEOUT}    10s


*** Keywords ***
# ── Navigation ───────────────────────────────────────────────────────────────

Open Page
    [Arguments]    ${path}
    Go To    ${BASE_URL}${path}

Verify Current Page Is
    [Arguments]    ${path}
    Location Should Be    ${BASE_URL}${path}

Wait For Navigation To
    [Arguments]    ${path}
    Wait Until Location Is    ${BASE_URL}${path}    timeout=${TIMEOUT}


# ── Form input ───────────────────────────────────────────────────────────────

Fill Text Field
    [Arguments]    ${locator}    ${value}
    Wait Until Element Is Visible    ${locator}
    Clear Element Text    ${locator}
    Input Text    ${locator}    ${value}

Select Option
    [Arguments]    ${locator}    ${value}
    Select From List By Value    ${locator}    ${value}


# ── Actions ──────────────────────────────────────────────────────────────────

Click Button With Text
    [Arguments]    ${text}
    Click Button    xpath=//button[contains(normalize-space(.), '${text}')]

Click Link With Text
    [Arguments]    ${text}
    Click Element    xpath=//a[contains(normalize-space(.), '${text}')]

Click First Link With Text
    [Arguments]    ${text}
    Click Element    xpath=(//a[contains(normalize-space(.), '${text}')])[1]

Focus Element
    [Arguments]    ${locator}
    Set Focus To Element    ${locator}


# ── Assertions ───────────────────────────────────────────────────────────────

Verify Text Is Visible
    [Arguments]    ${text}
    Wait Until Page Contains    ${text}    timeout=${TIMEOUT}

Verify Heading Is Visible
    [Arguments]    ${heading}
    Wait Until Element Is Visible    xpath=//h1[contains(normalize-space(.), '${heading}')] | //h2[contains(normalize-space(.), '${heading}')]

Verify Button Is Visible
    [Arguments]    ${text}
    Wait Until Element Is Visible    xpath=//button[contains(normalize-space(.), '${text}')]

Verify Button Is Disabled
    [Arguments]    ${text}
    Element Should Be Disabled    xpath=//button[contains(normalize-space(.), '${text}')]

Verify Link Is Visible
    [Arguments]    ${text}
    Wait Until Element Is Visible    xpath=//a[contains(normalize-space(.), '${text}')]

Verify Error Message
    [Arguments]    ${text}
    Wait Until Page Contains    ${text}    timeout=${TIMEOUT}


# ── High-level / compound keywords ───────────────────────────────────────────

Login As User
    [Documentation]    Full login flow: open /login → fill form → submit → wait for home.
    [Arguments]    ${username}    ${password}
    Open Page    /login
    Fill Text Field    id:username    ${username}
    Fill Text Field    id:password    ${password}
    Click Button With Text    Log In
    Wait For Navigation To    /

Verify User Is Logged In
    [Documentation]    Confirms all three post-login nav elements are present.
    Verify Heading Is Visible    All Posts
    Verify Button Is Visible     Logout
    Verify Link Is Visible       Add New Post
