// Dependency: core

var init = function() {
  // When API is ready...
  gapi.hangout.onApiReady.add(
      function(eventObj) {
        if (eventObj.isApiReady) {
          document.getElementById('showParticipants')
            .style.visibility = 'visible';
        }
      });

    setInterval(showCollaboration, 10000);

    var avEvents = [ 'onCameraMute', 'onHasCamera', 'onHasMicrophone',
                     'onHasSpeakers',
                     'onLocalAudioNotificationsMuteChanged',
                     'onLocalParticipantVideoMirroredChanged',
                     'onMicrophoneMute']; // , 'onVolumesChanged'
    avEvents.map(function(e, i, c) {
        gapi.hangout.av[e].add(
            function(evt) {
                console.log(e, evt);
            }
        );
    });

    var hangoutEvents = ['onApiReady', 'onAppVisible',
                         'onAutoLoadChange',
                         'onEnabledParticipantsChanged',
                         'onParticipantsAdded', 'onParticipantsChanged',
                         'onParticipantsDisabled',
                         'onParticipantsEnabled',
                         'onParticipantsRemoved',
                         'onPreferredLocaleChanged', 'onPublicChanged',
                         'onTopicChanged'];

    avEvents.map(function(e, i, c) {
        gapi.hangout[e].add(
            function(evt) {
                console.log(e, evt);
            }
        );
    });

    gapi.hangout.av.effects.onFaceTrackingDataChanged.add(
        function(evt) {
                console.log('onFaceTrackingDataChanged', evt);
        });


    var dataEvents = ['onMessageReceived', 'onStateChanged'];

    dataEvents.map(function(e, i, c) {
        gapi.hangout.data[e].add(
            function(evt) {
                console.log(e, evt);
            }
        );
    });

};

// Wait for gadget to load.
if (typeof gadgets !== 'undefined') {
    gadgets.util.registerOnLoadHandler(init);
} else {
    console.warn('gadgets not available');
    console.log('showParticipants and showCollaboration can be run from console');
}
