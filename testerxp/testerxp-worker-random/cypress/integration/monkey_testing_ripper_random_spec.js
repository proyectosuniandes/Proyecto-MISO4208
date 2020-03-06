describe('Mantisbt', function() {
    it('visits Mantisbt and survives monkeys', function() {
        cy.visit('http://localhost/login_page.php');
        cy.get('.login-container').find('input[name="username"]').click().type("administrator")
        cy.get('.login-container').find('input[type="submit"]').click()
        cy.get('.login-container').find('input[name="password"]').click().type("MISO4208")
        cy.get('.login-container').find('input[type="submit"]').click()
        cy.get('.dropdown-toggle').contains('administrator')
        cy.wait(1000);
        randomClick(2);
    })
})
function randomClick(monkeysLeft) {

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    };

	var monkeysLeft = monkeysLeft;
    if(monkeysLeft > 0) {
        cy.get('a').then($links => {
            var randomLink = $links.get(getRandomInt(0, $links.length));
            if(!Cypress.Dom.isHidden(randomLink)) {
                cy.wrap(randomLink).click({force: true});
                monkeysLeft = monkeysLeft - 1;
            }
			cy.wait(1000);
			randomClick(monkeysLeft);
        });
    }   
}
