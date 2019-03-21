(function () {
    try{
        var links = document.querySelectorAll('a.external');

        for (var i = 0; i < links.length; ++i) {
            links[i].onclick = function() {
                ga('send', 'event', 'outbound', 'click', this.href);
            };
        }

        window.addEventListener('error', function(e) {
            ga('send', 'exception', {
                'exDescription': e.message,
                'exFatal': false
            });
        });
    }catch(e){
        ga('send', 'exception', {
            'exDescription': err.message,
            'exFatal': false
        });
    }
})();