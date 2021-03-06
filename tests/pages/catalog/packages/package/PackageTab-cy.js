describe("Package Detail Tab", function() {
  beforeEach(function() {
    cy
      .configureCluster({
        mesos: "1-task-healthy",
        universePackages: true
      })
      .visitUrl({ url: "/catalog/packages/marathon?version=1.4.6" });
  });

  it("displays package information on package page", function() {
    cy.get(".page-body-content h1").should("contain", "marathon");
  });

  // Stalls tests in CI. TODO: Talk with Brian about this test.
  it("displays marathon package details", function() {
    cy.get(".page-body-content .pod p").as("information");

    cy
      .get("@information")
      .eq(0)
      .should(
        "contain",
        "A container orchestration platform for Mesos and DCOS"
      )
      .get("@information")
      .eq(1)
      .should(
        "contain",
        "We recommend a minimum of one node with at least 2 CPU shares and 1GB of RAM available for the Marathon DCOS Service."
      )
      .get("@information")
      .eq(2)
      .should("contain", "SCM: https://github.com/mesosphere/marathon.git")
      .get("@information")
      .eq(3)
      .should("contain", "Maintainer: support@mesosphere.io")
      .get("@information")
      .eq(4)
      .should(
        "contain",
        "Apache License Version 2.0: https://github.com/mesosphere/marathon/blob/master/LICENSE"
      );
  });

  it("displays image in the image viewer", function() {
    cy
      .get(".media-object-item-fill-image.image-rounded-corners.clickable")
      .eq(4)
      .click();

    cy
      .get(".modal.modal-image-viewer img")
      .should(
        "have.attr",
        "src",
        "http://www.clker.com/cliparts/0/f/d/b/12917289761851255679earth-map-huge.jpg"
      );
  });

  it("changes image in the image viewer by clicking left arrow", function() {
    cy
      .get(".media-object-item-fill-image.image-rounded-corners.clickable")
      .eq(4)
      .click();

    cy.get(".modal-image-viewer-arrow-container.clickable.backward").click();

    cy
      .get(".modal.modal-image-viewer img")
      .should(
        "have.attr",
        "src",
        "https://mesosphere.com/wp-content/themes/mesosphere/library/images/assets/marathon-0.6.0/mesosphere-marathon-app-list.png"
      );
  });

  it("changes image in the image viewer by clicking right arrow", function() {
    cy
      .get(".media-object-item-fill-image.image-rounded-corners.clickable")
      .eq(4)
      .click();

    cy.get(".modal-image-viewer-arrow-container.clickable.forward").click();

    cy
      .get(".modal.modal-image-viewer img")
      .should(
        "have.attr",
        "src",
        "https://mesosphere.com/wp-content/themes/mesosphere/library/images/assets/marathon-0.6.0/mesosphere-marathon-app-list.png"
      );
  });

  it("dropdown display all versions available", function() {
    cy.get(".dropdown-toggle").click();
    cy.get(".is-selectable").should("have.length", 4);
  });

  it("select available version on dropdown", function() {
    cy.get(".dropdown-toggle").click();
    cy.get(".is-selectable").eq(3).click();
    cy.window().then(function(window) {
      const result = window.location.hash.includes("0.2.1");
      expect(result).to.equal(true);
    });
  });
});
