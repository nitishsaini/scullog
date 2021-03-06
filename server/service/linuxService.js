var exec = require('co-exec');
var os = require('os');

module.exports = {
    status : function *(services){
        var res = {};
        if(!Array.isArray(services))
            services = [services];
        try{
            var s = yield exec('service --status-all');
            var runRe = /(.*) \(pid.*\) is running/g;
            var stopRe = /(.*) is stopped/g;
            var m = [];
            var temp;
            for (var i=0;(temp = runRe.exec(s)) !== null;i++) {
                m.push(temp[1].trim());
                m.push(true);
            }
            for (i=0;(temp = stopRe.exec(s)) !== null;i++) {
                m.push(temp[1].trim());
                m.push(false);
            }
            console.log(m);
            res.data = services.reduce(function(r,s){
                var i = m.indexOf(s);
                if(i>-1){
                    r[s] = m[++i];
                }
                return r;
            },{});
        }catch(e){
            console.error(e, "Error, while retrieving status of service");
            res.error = e;
        }
        return res;
    },
    stop : function *(service){
        var res = {data:{name:service,action:'stop'}};
        try{
            var s = yield exec(`service "${service}" stop`);
            if(new RegExp("Stopping.*OK").test(s)){
                res.data.status = "success";
            }else{
                res.error = s;
            }
        }catch(e){
            console.error(e, "Error, while stopping service");
            res.error = e;
        }
        return res;
    },
    start:function *(service){
        var res = {data:{name:service,action:'start'}};
        try{
            var s = yield exec(`service "${service}" start`);
            if(new RegExp("Starting.*OK").test(s)){
                res.data.status = "success";
            }else{
                res.error = s;
            }
        }catch(e){
            console.error(e, "Error, while starting service");
            res.error = e;
        }
        return res;
    },
    restart: function *(service){
        var res = {data:{name:service,action:'restart'}};
        try{
            var s = yield exec(`service "${service}" restart`);
            if(new RegExp("Stopping.*OK.*\\s*.*Starting.*OK").test(s)){
                res.data.status = "success";
            }else{
                res.error = s;
            }
        }catch(e){
            console.error(e, "Error, while restarting service");
            res.error = e;
        }
        return res;
    }
}