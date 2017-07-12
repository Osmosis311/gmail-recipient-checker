window.onload = function () {
    var jq  = document.createElement('script');
    jq.src  = chrome.extension.getURL("js/jquery-1.11.1.min.js");
    jq.type = "text/javascript";
    document.getElementsByTagName('body')[0].appendChild(jq)

    var sm  = document.createElement('script');
    sm.src  = chrome.extension.getURL("js/gmail.js");
    sm.type = "text/javascript";
    document.getElementsByTagName('body')[0].appendChild(sm);

    setTimeout(function () {
        var st  = document.createElement('script');
        st.src  = chrome.extension.getURL("js/jquery.noty.packaged.min.js");
        st.type = "text/javascript";
        document.getElementsByTagName('body')[0].appendChild(st);
    }, 3000);

    setTimeout(function () {
        var sb  = document.createElement('script');
        sb.src  = chrome.extension.getURL("js/main.js");
        sb.type = "text/javascript";
        document.getElementsByTagName('body')[0].appendChild(sb);
    }, 3000);
}
