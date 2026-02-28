*** Settings ***
Resource    ../resources/keywords.resource

Suite Setup       Open Browser    about:blank    ${BROWSER}
Suite Teardown    Close Browser
Test Setup        Login As User    ${VALID_EMAIL}    ${VALID_PASSWORD}


*** Test Cases ***

# @SuccessfulAddComment ───────────────────────────────────────────────────────
@SuccessfulAddComment - Successful Add Comment To A Blog/Post
    Click First Link With Text    Читати
    Fill Text Field    name:message    Some test comment
    Click Button With Text         Add Comment
    Verify Text Is Visible         Comment added to the Post
