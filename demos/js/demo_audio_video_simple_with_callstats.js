var selfEasyrtcid = "";
var selfRoomName = "";
var callInitiator = false;

var appId = "";
var appSecret = "";
var callStats;

function csInitCallback (err, msg){
    console.log("CallStats Initializing Status: err= "+err+" msg= "+msg);
}

function connect() {
    easyrtc.setVideoDims(640,480);
    easyrtc.setRoomOccupantListener(convertListToButtons);

    callStats = new callstats($,io,jsSHA);
    easyrtc.easyApp("easyrtc.audioVideoSimple", "selfVideo", ["callerVideo"], loginSuccess, loginFailure);
    easyrtc.setOnCall( function(easyrtcId, slot) {
        console.log("call with " + easyrtcId + " established");
        if (!callInitiator) {
            var pc = easyrtc.getPeerConnectionByUserId(easyrtcId);
            console.log("Pc is ",pc);
            callStats.addNewFabric(pc, easyrtcId, callStats.fabricUsage.multiplex, selfRoomName);
        }
    });
 }


function clearConnectList() {
    var otherClientDiv = document.getElementById('otherClients');
    while (otherClientDiv.hasChildNodes()) {
        otherClientDiv.removeChild(otherClientDiv.lastChild);
    }
}


function convertListToButtons (roomName, data, isPrimary) {
    selfRoomName = roomName;
    clearConnectList();
    var otherClientDiv = document.getElementById('otherClients');
    for(var easyrtcid in data) {
        var button = document.createElement('button');
        button.onclick = function(easyrtcid) {
            return function() {
                performCall(easyrtcid);
            };
        }(easyrtcid);

        var label = document.createTextNode(easyrtc.idToName(easyrtcid));
        button.appendChild(label);
        otherClientDiv.appendChild(button);
    }
}


function performCall(otherEasyrtcid) {
    easyrtc.hangupAll();
    callInitiator = true;
    var successCB = function(user, msg) {
        console.log("success ",user,msg);
        var pc = easyrtc.getPeerConnectionByUserId(otherEasyrtcid);
        console.log("Pc is ",pc);
        callStats.addNewFabric(pc, otherEasyrtcid, callStats.fabricUsage.multiplex, selfRoomName);
    };
    var failureCB = function() {

    };

    var acceptCB = function(wasAccepted, id) {
        if( wasAccepted ){
            console.log("call accepted by " + easyrtc.idToName(id));
        }
        else {
            console.log("call rejected" + easyrtc.idToName(id));
        }
    }

    easyrtc.call(otherEasyrtcid, successCB, failureCB, acceptCB);
}


function loginSuccess(easyrtcid) {
    selfEasyrtcid = easyrtcid;
    document.getElementById("iam").innerHTML = "I am " + easyrtc.cleanId(easyrtcid);
    callStats.initialize(appId, appSecret, selfEasyrtcid, csInitCallback);
}


function loginFailure(errorCode, message) {
    easyrtc.showError(errorCode, message);
}
