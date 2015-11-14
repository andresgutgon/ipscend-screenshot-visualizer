// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

	"use strict";

  var IpesendPreviewName= 'ipesendPreview';
  var DEFAULT_IPFS_HASH = 'QmdqoXTW5WGEMiU1QiUnhBMHQpiVnQ8sKSUrN3pb6k3PxF';
  var defaults = {
    base_ipfs_url: 'http://localhost:8080/ipfs/',
    ipfs_host: 'localhost',
    ipfs_port: '5001',
    time_machine_settings: {
      speed: 0,
      offsetTop: 40,
      delta_z: 8,
      decay_constant: 0.5,
      size_ratio : 0.75
    },
    position: 0
  };

  // The actual plugin constructor
  function IpesendPreview ( element, options ) {
    this.element = element;
    this._name = IpesendPreviewName;
    this.settings = $.extend({}, defaults, options );
    this._defaults = defaults;

    this.loading = $(this.settings.loading);
    this.forward = $(this.settings.forward_button);
    this.back = $(this.settings.back_button);
    this.position = this.settings.position;
    this.ipfs = new window.ipfsAPI(this.settings.ipfs_host, this.settings.ipfs_port);
    this.init();
  }

  $.extend(IpesendPreview.prototype, {
    init: function () {
      var self = this;
      this.versions = [];
      var hash = window.document.location.hash.slice(1) || DEFAULT_IPFS_HASH;

      this.ipfs.cat(hash, function (err, res) {
        if (err || !res) {
          return console.error('err', err)
        }

        res.forEach(function (version) {
          if (version.snapshot) {
            self.versions.push({
              snapshot: self.settings.base_ipfs_url + version.snapshot,
              hash: version.hash,
              timestamp: version.timestamp,
            });
          }
        });

        self.createTimeMachine();
      });


    },
    createTimeMachine: function () {
      var self = this;
      var ctx = this.element.getContext('2d');

      var images = [];
      this.versions.forEach(function (version) {
        images.push(version.snapshot);
      });

      var imagesDoneLoading = function(tm, successCount, failCount){
          console.log('foooooooooooo');

          if (failCount > 0){
            console.log('Some images failed to load');
          }

          self.loading.hide();
          //for(var i=0;i<images.length;i++){
              //$("#all-items").append('<li id="item-'+i+'" class="item">Item '+i+'</li>');
          //}
          //$(".item").click(function(){
              //position = parseInt($(this).attr("id").split("-")[1]);
              //tm.moveTo(position);
              //position = images.length - 1 - position;
          //});
      };

      this.timemachine = TimeMachine.create(images, ctx, this.settings.time_machine_settings, imagesDoneLoading);

      this.back.click(function () {
        self.timemachine.backward();
      });

      this.forward.click(function () {
        self.timemachine.forward();
      });
    }
  });

  $.fn[IpesendPreviewName] = function (options) {
    return this.each(function() {
      var plugin_name = 'plugin_' + IpesendPreviewName;
      if (!$.data( this, plugin_name)) {
        $.data( this, plugin_name, new IpesendPreview(this, options));
      }
    });
  };

})( jQuery, window, document );

