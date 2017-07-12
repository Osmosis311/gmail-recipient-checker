var gmail = Gmail();
var lastComposeCount = 0;
var userEmailDomain = '';
var alertWindows = [];

//Message variables
var msgOutsideRecipientWarning = '<b>WARNING: YOU HAVE AT LEAST ONE RECIPIENT OUTSIDE OF YOUR EMAIL DOMAIN</b>';
var msgMultipleRecipientWarning = '<b>WARNING: MULTIPLE RECIPIENT DOMAINS DETECTED</b>';

$(function () {
    var userEmail = gmail.get.user_email();
    userEmailDomain = userEmail.split('@')[1];
    gmail.observe.on('recipient_change', function () {
        setTimeout(checkCompose, 3000);
    });
    setInterval(function () {
        var compose = gmail.get.compose_ids();
        if (compose.length !== lastComposeCount) {
            lastComposeCount = compose.length;
            checkCompose();
        }
    }, 5000);
});

function checkCompose() {

    var compose = gmail.get.compose_ids();

    compose.forEach(function (compose_id) {

        var data = gmail.get.email_data(compose_id);
        var emails = [];
        var domains = [];
        var userDomainRecips = 0;

        if (!data || !data.threads) return;

        var thread_data = data.threads[data.last_email];

        var to_emails = [];
        var cc_emails = [];
        var bcc_emails = [];

        if (thread_data.to.length > 0) to_emails = thread_data.to[0].toString().match(/<[^\>]*\>/g);
        if (thread_data.cc.length > 0) cc_emails = thread_data.cc[0].toString().match(/<[^\>]*\>/g);
        if (thread_data.bcc.length > 0) bcc_emails = thread_data.bcc[0].toString().match(/<[^\>]*\>/g);

        var emailGroups = [to_emails, cc_emails, bcc_emails];

        emailGroups.forEach(group => {
           if(group && group.length > 0) {
               group.forEach(emailAddress => {
                   emails.push(cleanEmailAddress(emailAddress));
               });
           }
        });

        emails.forEach(function (e) {
            var email = e.split('@');
            var domain = email[1];
            if (domain != userEmailDomain) {
                domains.push(domain);
            } else {
                userDomainRecips += 1;
            }
        });

        var uniqueDomains = domains.filter(function (elem, pos) {
            return domains.indexOf(elem) == pos;
        });

        if (uniqueDomains.length > 1) {
            addNewAlertMessage(compose_id, msgMultipleRecipientWarning, 'error', thread_data.subject);
        } else if (userDomainRecips > 1 && uniqueDomains.length == 1) {
            addNewAlertMessage(compose_id, msgOutsideRecipientWarning, 'warning', thread_data.subject);
        }
    });

    alertWindows.forEach((alertWindow, index) => {
        if (compose.indexOf(alertWindow.compose_id) == -1) {
            if (alertWindow.noty) {
                alertWindow.noty.close();
            }
            alertWindows.splice(index, 1);
        }
    });

}

function addNewAlertMessage(compose_id, message, type, subject) {
    message = message + (subject ? ' <b>(' + subject + ')</b>' : '');
    var alertWindow = alertWindows.find(a => {
        return a.compose_id == compose_id
    });
    if (!alertWindow) {
        var note = noty({text: message, type: type});
        alertWindows.push({compose_id: compose_id, message: message, type: type, subject: subject, noty: note});
    } else {
        if (alertWindow.message != message) {
            alertWindow.noty.close();
            alertWindow.noty = noty({text: message, type: type});
        }
    }
}

function cleanEmailAddress(address) {
    return address.match(/\<.*\>/).toString().replace('<', '').replace('>', '')
}