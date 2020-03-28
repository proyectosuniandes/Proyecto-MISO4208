Feature: Login into losestudiantes
    As an user I want to authenticate myself within losestudiantes website in order to rate teachers

Scenario: Login successful
    Given I go to losestudiantes home screen
    When I open the login screen
    And I fill a right email and password
    And I try to login
    Then I already logged