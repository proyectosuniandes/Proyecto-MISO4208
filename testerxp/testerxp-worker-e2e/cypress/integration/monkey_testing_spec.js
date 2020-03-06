describe('Dollibar under test monkeys', function() {

    it('Visits Dollinnar and survives monkeys', function() {
        cy.visit('http://localhost/dolibarr/')
        cy.get('.login_table').find('input[name="username"]').click().type("admin")
        cy.get('.login_table').find('input[name="password"]').click().type("Temporal01")
        cy.get('.login_table').find('input[type="submit"]').click()
        cy.wait(1000);
        
        var genArr = Array.from({length:15},(v,k)=>k+1)
        cy.wrap(genArr).each((index) => {
             var aleatorio = getRandomInt(0, 3);
             randomClick(30, aleatorio);
        })
    })
})

function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    };

function randomClick(monkeysLeft, randomEvent) {

    var elementos = ['a','input', 'a'];

    var monkeysLeft = monkeysLeft;
    if(monkeysLeft > 0 ) {
      if(cy.contains(elementos[randomEvent])){
          cy.get(elementos[randomEvent]).then($links => {
              if($links.length > 0) {
                var randomLink = $links.get(getRandomInt(0, $links.length));
                if(randomEvent == 1 && !Cypress.dom.isHidden(randomLink)) {
                    cy.wrap(randomLink).click({force: true}).type("Texto aleatorio");
                    monkeysLeft = monkeysLeft - 1;
                } else if(!Cypress.dom.isHidden(randomLink)) {
                    cy.wrap(randomLink).click({force: true});
                    monkeysLeft = monkeysLeft - 1;
                } else {
                  monkeysLeft = monkeysLeft - 1;
                }
              }
              setTimeout(randomClick, 1000, monkeysLeft);
          });
        } else {
            setTimeout(randomClick, 1000, monkeysLeft);
        }
    }
}