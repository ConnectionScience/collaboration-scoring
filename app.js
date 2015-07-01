var showParticipants = function() {
    var participants = gapi.hangout.getParticipants();
    var retVal = '<p>Participants: </p><ul>';
    console.log(participants);
    for (var index in participants) {
        var participant = participants[index];

        if (!participant.person) {
            retVal += '<li>A participant not running this app</li>';
        }
        retVal += '<li>' +
            '<img width="16" height="16" src="' +
            participant.person.image.url +
            '"/> ' +
            participant.person.displayName +
            ' <tt>' + participant.person.id + '</tt>' +
            '</li>';
    }
    retVal += '</ul>';
    var div = document.getElementById('participants');
    div.innerHTML = retVal;
};

var showCollaboration = function() {
    var retVal = 'None';
    var time = (new Date()).getTime();
    console.log(time, 'showCollaboration()', participants);
    if (participants) {
        for (var index in participants) {
            var participant = participants[index];

            if (participant && participant.person &&
                participant.isBroadcaster) {
                console.log('Broadcasting: ',
                            participant.person.displayName);
                retVal = '<tt>' + time + ',' +
                    participant.person.id  + ',' +
                    participant.person.displayName + '</tt>';
            }
        }
    }
    var div = document.getElementById('collaboration');
    div.innerHTML = '<p>Broadcaster: </p>' + retVal;
};

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
};

// Wait for gadget to load.
if (typeof gadgets !== 'undefined') {
    gadgets.util.registerOnLoadHandler(init);
} else {
    console.warn('gadgets not available');
    console.log('showParticipants and showCollaboration can be run from console');
}
