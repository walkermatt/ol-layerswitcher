describe('startActive option', function () {
  var map, target;

  beforeEach(function () {
    target = document.createElement('div');
    document.body.appendChild(target);
    map = new ol.Map({
      target: target,
      layers: []
    });
  });

  afterEach(function () {
    document.body.removeChild(target);
    map = null;
    target = null;
  });

  describe('startActive: false', function () {
    it('is initially hidden when startActive: false', function () {
      var switcher = new LayerSwitcher({
        startActive: false
      });
      map.addControl(switcher);
      expect(switcher.element.classList).to.not.contain('shown');
      expect(jQuery('.layer-switcher .panel:visible').length).to.be(0);
    });
  });

  describe('startActive: true', function () {
    it('is initially shown when startActive: true', function () {
      var switcher = new LayerSwitcher({
        startActive: true
      });
      map.addControl(switcher);
      expect(switcher.element.classList).to.contain('shown');
      expect(jQuery('.layer-switcher .panel:visible').length).to.be(1);
    });
  });
});
