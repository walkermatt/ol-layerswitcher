describe('activationMode option', function () {
  var map, target;

  beforeEach(function () {
    target = document.createElement('div');
    target.style.height = '200px';
    document.body.appendChild(target);
    map = new ol.Map({
      target: target,
      layers: [
        new ol.layer.Tile({
          title: 'OSM',
          visible: true,
          source: new ol.source.TileDebug()
        })
      ]
    });
  });

  afterEach(function () {
    document.body.removeChild(target);
    map = null;
    target = null;
  });

  describe("activationMode: 'click'", function () {
    it('When hidden a button with tipLabel tooltip (and aria-label) for opening the panel is visible', function () {
      var tipLabel = '31374e11-b51d-49ff-a3c7-5dd99adbbe74';
      var switcher = new LayerSwitcher({
        activationMode: 'click',
        tipLabel: tipLabel,
        startActive: false
      });
      map.addControl(switcher);
      // Panel is initally hidden (and hence should be displaying the button used
      // to open it
      expect(jQuery('.layer-switcher .panel:visible').length).to.be(0);
      expect(jQuery('.layer-switcher button:visible').length).to.be(1);
      expect(jQuery('.layer-switcher button:visible').attr('title')).to.equal(
        tipLabel
      );
      expect(
        jQuery('.layer-switcher button:visible').attr('aria-label')
      ).to.equal(tipLabel);
    });
    it('When hidden shows panel when button is clicked', function () {
      var switcher = new LayerSwitcher({
        activationMode: 'click',
        startActive: false
      });
      map.addControl(switcher);
      // Panel is initally not shown
      expect(jQuery('.layer-switcher .panel:visible').length).to.be(0);
      // Click the button
      jQuery('.layer-switcher button').click();
      // Has shown class, panel is visible
      expect(switcher.element.classList).to.contain('shown');
      expect(jQuery('.layer-switcher .panel:visible').length).to.be(1);
    });
    it('When shown a button with collapseTipLabel tooltip (and aria-label) for closing the panel is visible', function () {
      var collapseTipLabel = '66db642e-70c5-4ab1-8830-e2c472650a07';
      var switcher = new LayerSwitcher({
        activationMode: 'click',
        collapseTipLabel: collapseTipLabel,
        startActive: true
      });
      map.addControl(switcher);
      // Panel is initally shown (and hence should be displaying the button used
      // to close it
      expect(jQuery('.layer-switcher .panel:visible').length).to.be(1);
      expect(jQuery('.layer-switcher button:visible').length).to.be(1);
      expect(jQuery('.layer-switcher button:visible').attr('title')).to.equal(
        collapseTipLabel
      );
      expect(
        jQuery('.layer-switcher button:visible').attr('aria-label')
      ).to.equal(collapseTipLabel);
    });
    it('When shown hides panel when button is clicked', function () {
      var switcher = new LayerSwitcher({
        activationMode: 'click',
        startActive: true
      });
      map.addControl(switcher);
      // Panel is initally shown
      expect(jQuery('.layer-switcher .panel:visible').length).to.be(1);
      // Click the button
      jQuery('.layer-switcher button').click();
      // Doesn't have shown class, panel is invisible
      expect(switcher.element.classList).to.not.contain('shown');
      expect(jQuery('.layer-switcher .panel:visible').length).to.be(0);
    });
    it('When shown clicking the map does not hide the panel', function () {
      var switcher = new LayerSwitcher({
        activationMode: 'click',
        startActive: true
      });
      map.addControl(switcher);
      // Panel is initally shown
      expect(switcher.element.classList).to.contain('shown');
      expect(jQuery('.layer-switcher .panel:visible').length).to.be(1);
      // Click the map
      jQuery('#map').click();
      // Panel should still be shown as activationMode is 'click'
      expect(switcher.element.classList).to.contain('shown');
      expect(jQuery('.layer-switcher .panel:visible').length).to.be(1);
    });
    it('Adds a layer-switcher-activation-mode-click class to the control', function () {
      var switcher = new LayerSwitcher({
        activationMode: 'click'
      });
      map.addControl(switcher);
      expect(switcher.element.classList).to.contain(
        'layer-switcher-activation-mode-click'
      );
    });
    it('Updates button state when closed via hidePanel', function () {
      var label = '+';
      var tipLabel = 'Open layers';
      var switcher = new LayerSwitcher({
        startActive: true,
        activationMode: 'click',
        label: label,
        tipLabel: tipLabel,
      });
      map.addControl(switcher);
      switcher.hidePanel();
      expect(jQuery('.layer-switcher button').text()).to.be(
        label
      );
      expect(jQuery('.layer-switcher button').attr('title')).to.be(
        tipLabel
      );
      expect(jQuery('.layer-switcher button').attr('aria-label')).to.be(
        tipLabel
      );
    });
    it('Updates button state when opened via showPanel', function () {
      var collapseLabel = 'x';
      var collapseTipLabel = 'Close layers';
      var switcher = new LayerSwitcher({
        startActive: false,
        activationMode: 'click',
        collapseLabel: collapseLabel,
        collapseTipLabel: collapseTipLabel,
      });
      map.addControl(switcher);
      switcher.showPanel();
      expect(jQuery('.layer-switcher button').text()).to.be(
        collapseLabel
      );
      expect(jQuery('.layer-switcher button').attr('title')).to.be(
        collapseTipLabel
      );
      expect(jQuery('.layer-switcher button').attr('aria-label')).to.be(
        collapseTipLabel
      );
    });
  });

  describe("activationMode: 'mouseover'", function () {
    // NOTE: As mouseover is the default, showing/ hiding is tested in ./ol-layerswitcher.js
    it('Adds a layer-switcher-activation-mode-mouseover class to the control', function () {
      var switcher = new LayerSwitcher({
        activationMode: 'mouseover'
      });
      map.addControl(switcher);
      expect(switcher.element.classList).to.contain(
        'layer-switcher-activation-mode-mouseover'
      );
    });
  });
});
