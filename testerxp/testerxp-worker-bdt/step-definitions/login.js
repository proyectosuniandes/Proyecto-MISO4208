module.exports = function () {
    this.Given('I go to losestudiantes home screen', () => {
        helpers.loadPage('https://losestudiantes.co/');
        if (helpers.getElementsContainingText('button', 'Cerrar')) {
            driver.findElement(By.xpath("//*[text()='Cerrar']")).click();
        }
    });

    this.When('I open the login screen', () => {
        driver.findElement(By.xpath("//*[text()='Ingresar']")).click();
    });

    this.When('I fill a right email and password', () => {
        var vPanel = driver.findElement(By.className("cajaLogIn"));
        vPanel.findElement(By.name("correo")).sendKeys("en.jimenez@uniandes.edu.co");
        vPanel.findElement(By.name("password")).sendKeys("tallerpruebas02");
    });

    this.When('I try to login', () => {
        var vPanel = driver.findElement(By.className("cajaLogIn"));
        vPanel.findElement(By.className("logInButton ")).click();
    });

    this.Then('I already logged', () => {
        assert.isOk('everything', driver.findElement(By.id("cuenta")))
    });
};