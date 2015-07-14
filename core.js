var showParticipants = function() {
    var participants = gapi.hangout.getParticipants();
    var retVal = '<h2>Participants:</h2><ul>';
    console.log(participants);
    for (var index in participants) {
        var participant = participants[index];

        if (!participant.person) {
            retVal += '<li>A participant not running this app</li>';
        }

        var broadcaster = '';
        if (participant.isBroadcaster) {
            broadcaster = '<b>*</b>';
        }
        retVal += '<li>' +
            broadcaster +
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

var showParticipantsPolling = setInterval(showParticipants, 2000);

var showCollaboration = function() {
    var participants = gapi.hangout.getParticipants();
    var retVal = 'None';
    var time = (new Date()).getTime();
    console.log(time, 'showCollaboration()', participants);
    if (participants) {
        for (var index in participants) {
            var participant = participants[index];

            if (participant && participant.person &&
                participant.isBroadcaster) {
                console.log('Broadcasting:',
                            participant.person.displayName);
                retVal = '<tt>' + time + ',' +
                    participant.person.id  + ',' +
                    participant.person.displayName + '</tt>';
            }
        }
    }
    var div = document.getElementById('collaboration');
    div.innerHTML = '<h2>Broadcaster:</h2>' + retVal;
};

var talkers = {};

// TODO: Throttle
gapi.hangout.av.onVolumesChanged.add(
    function(evt) {
        var recorderId = gapi.hangout.getLocalParticipantId();
        var volumes = evt.volumes;
        var user = 'unknown';
        var hangoutId = evt.target.h.v;
        // merge volumes into known talker state
        for (var k in volumes) {
            var talker = gapi.hangout.getParticipantById(k);
            console.log('Talking', talker);
            var i = new Image();
            i.src = 'https://wal.sh/collaboration-scoring/_.gif?' +
                (new Date()).getTime() + ',' +
                hangoutId + ',' +
                k + ',' +
                volumes[k] + ',' +
                recorderId;
            if(talkers[k]) {
                talkers[k] += volumes[k];
            } else {
                talkers[k] = volumes[k];
            }
        }

        var div = document.getElementById('talking');
        div.innerHTML = '<h2>Talking:</h2><pre>' +
            JSON.stringify(talkers) + '</pre>';
    });
