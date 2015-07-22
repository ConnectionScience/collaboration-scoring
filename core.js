var embed = document.getElementById('embed');
embed.contentWindow.postMessage('core.js', '*');

var showParticipants = function() {
    console.log(participants);
    embed.contentWindow.postMessage(JSON.stringify(participants), '*');
};

var showParticipantsPolling = setInterval(showParticipants, 5000);

var talkers = {};

// TODO: Throttle
gapi.hangout.av.onVolumesChanged.add(
    function(evt) {
        embed.contentWindow.postMessage(JSON.stringify(evt), '*');
        var recorderId = gapi.hangout.getLocalParticipantId();
        var volumes = evt.volumes;
        var user = 'unknown';
        var hangoutId = evt.target.h.v;
        // merge volumes into known talker state
        for (var k in volumes) {
            var talker = gapi.hangout.getParticipantById(k);
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

    });
