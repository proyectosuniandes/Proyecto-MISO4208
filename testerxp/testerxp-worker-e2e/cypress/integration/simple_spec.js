describe('Mantisby login', function() {
    it('Visits Mantisbt and succesfull login', function() {
        cy.visit('http://lbmiso4208mantisbt2230-869d406e6bc0cec1.elb.us-east-1.amazonaws.com/mantis/login_page.php')
        cy.get('.login-container').find('input[name="username"]').click().type("administrator")
        cy.get('.login-container').find('input[type="submit"]').click()
        cy.get('.login-container').find('input[name="password"]').click().type("mantisbtprueba")
        cy.get('.login-container').find('input[type="submit"]').click()
        cy.get('.dropdown-toggle').contains('administrator')
    })

    it('Add Project succesfull', function() {
        cy.visit('http://lbmiso4208mantisbt2230-869d406e6bc0cec1.elb.us-east-1.amazonaws.com/mantis/login_page.php')
        cy.get('.login-container').find('input[name="username"]').click().type("administrator")
        cy.get('.login-container').find('input[type="submit"]').click()
        cy.get('.login-container').find('input[name="password"]').click().type("mantisbtprueba")
        cy.get('.login-container').find('input[type="submit"]').click()
        cy.get('.nav').contains('Manage')
        .should('have.attr', 'href')
        .then((href) => {
            cy.visit('http://lbmiso4208mantisbt2230-869d406e6bc0cec1.elb.us-east-1.amazonaws.com/'+href)
        })
        cy.get('.nav').contains('Manage Projects')
        .should('have.attr', 'href')
        .then((href) => {
            cy.visit('http://lbmiso4208mantisbt2230-869d406e6bc0cec1.elb.us-east-1.amazonaws.com/'+href)
        })
        cy.get('.form-inline').contains('Create New Project').click()
        const uuid = () => Cypress._.random(0, 1e6)
        const id = uuid()
        const testname = 'Pruebas Automaticas ' + id
        cy.get('.form-container').find('input[name="name"]').click().type(testname)
        cy.get('.form-container').find('textarea[name="description"]').click().type("Ejemplo pruebas Automaticas")
        cy.get('.form-container').find('input[type="submit"]').click()
        cy.get('.table-responsive').contains('Pruebas Automaticas')
    })



})
