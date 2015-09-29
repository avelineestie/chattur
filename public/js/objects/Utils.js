var Utils = (
    function(){
        function getTimestamp(){
            var now = new Date();
            var day = ('0' + now.getDate()).slice(-2);
            var month = ('0' + (now.getMonth() + 1)).slice(-2);
            var year = now.getFullYear();
            var hour = ('0' + now.getHours()).slice(-2);
            var min = ('0' + now.getMinutes()).slice(-2);
            var sec = ('0' + now.getSeconds()).slice(-2);

            return day + '/' + month + "/" + year + " " + hour + ":" + min + ":" + sec;
        }

        return{
            getTimestamp:getTimestamp
        }

    }
);

module.exports = Utils;