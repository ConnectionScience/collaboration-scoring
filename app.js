var showParticipants = function() {
    var participants = gapi.hangout.getParticipants();
    var retVal = '<p>Participants: </p><ul>';
    console.log(participants);
    for (var index in participants) {
        var participant = participants[index];

        if (!participant.person) {
            retVal += '<li>A participant not running this app</li>';
        }
        retVal += '<li>' + participant.person.displayName + '</li>';
    }
    retVal += '</ul>';
    var div = document.getElementById('participants');
    div.innerHTML = retVal;
};

var showCollaboration = function() {
    var retVal = '<p>Broadcaster: </p>';
    var time = (new Date()).getTime();
    console.log(time, 'showCollaboration()');
    if (participants) {
        for (var index in participants) {
            var participant = participants[index];

            if (participant && participant.person && participant.isBroadcaster) {
                retVal += '<tt>' + time + ',' +
                    participant.person.id  + ',' +
                    participant.person.displayName + '</tt>';
            }
        }
    }
    var div = document.getElementById('collaboration');
    div.innerHTML = retVal;
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

    setInterval(showCollaboration, 3000);
};

// Wait for gadget to load.
gadgets.util.registerOnLoadHandler(init);
