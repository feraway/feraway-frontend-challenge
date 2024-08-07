import { TARGET_WALLET } from "../test-config";

describe("Page transfer and allowance", () => {
  afterEach(() => {
    cy.resetMetamaskAccount();
  });

  it("Should mint tokens to the target wallet", () => {
    cy.visit("http://localhost:3000");
    cy.contains("Connect Wallet").click();
    cy.contains("MetaMask").click();
    cy.acceptMetamaskAccess();
    cy.contains("Select token...").click();
    cy.get("[data-value=0x1D70D57ccD2798323232B2dD027B3aBcA5C00091]").click();
    cy.contains("Select an Operation").click();
    cy.contains("Mint Tokens").click();
    cy.contains("Mint for yourself?").click();
    cy.findByPlaceholderText("Please set an amount").focus().type("1");
    cy.contains("Confirm Mint").click();
    cy.get("[role=alertdialog]").contains("Confirm").click();
    // using confirmMetamaskPermissionToSpend instead of confirmMetamaskTransaction because the later was flaky
    cy.confirmMetamaskPermissionToSpend({ shouldWaitForPopupClosure: true });
    cy.contains("Last transaction pending");
    cy.contains("Last transaction confirmed", undefined, {
      timeout: 120000,
    });
  });

  it("Should transfer tokens to the target wallet", () => {
    cy.contains("Mint Tokens").click();
    cy.contains("Transfer Tokens").click();
    cy.findByPlaceholderText("Please set a target address")
      .focus()
      .clear()
      .type(TARGET_WALLET);
    cy.findByPlaceholderText("Please set an amount").focus().type("0.0001");
    cy.contains("Send Tokens").click();
    cy.contains("Confirm").click();
    cy.confirmMetamaskPermissionToSpend({ shouldWaitForPopupClosure: true });
    cy.contains("Last transaction pending");
    cy.contains("Last transaction confirmed", undefined, {
      timeout: 120000,
    });
  });

  it("Should set allowance to the target wallet", () => {
    cy.contains("Transfer Tokens").click();
    cy.contains("Set Allowance").click();
    cy.findByPlaceholderText("Please set a target address")
      .focus()
      .clear()
      .type(TARGET_WALLET);
    cy.contains("Use max allowance?").click();
    cy.get("[role=confirm-button]").click();
    cy.contains("Confirm").click();
    cy.confirmMetamaskPermissionToSpend({
      shouldWaitForPopupClosure: true,
    });
    cy.confirmMetamaskPermissionToSpend({
      shouldWaitForPopupClosure: true,
    });
    cy.contains("Last transaction pending");
    cy.contains("Last transaction confirmed", undefined, {
      timeout: 120000,
    });
  });
});
