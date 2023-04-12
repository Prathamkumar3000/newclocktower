//backend for socket io
//const io = require('socket.io')(8080);

const io = require('socket.io')(8080, {
    cors: {
      origin: 'http://127.0.0.1:5500',
      methods: ['GET', 'POST']
    }
  });


const users={"1":"hello","2":"yo","3":"hello2" , "4":"hello4","5":"was","6":"sup"};
//const users={};
const town=["Washerwoman", "Librarian", "Investigator", "Chef", "Empath", "Fortune Teller", "Undertaker", "Monk", "Ravenkeeper", "Virgin", "Slayer", "Soldier", "Mayor"]
const outsiders=["Butler", "Drunk", "Recluse", "Saint"];
const minions=["Poisoner", "Spy", "Scarlet Woman", "Baron"];
const demon=["imp"];
const roles={};

var array = new Array();
var random= new Array();
var position = new Array();
//var position=[["b","a",'h'],['e','d','c'],['f','e','d'],['g','f','e'],['c','b','a'],['h','g','f'],['a','h','g'],['d','c','b']];
var circle=new Array();
const check_and_circle=()=>{
    if(position.length==random.length){
        var i=0;
        console.log("in");
        while(circle.length<random.length){
            console.log("in while");
            if(i==0){
                circle.push(position[0][0]);
                circle.push(position[0][1]);
                circle.push(position[0][2]);
            }
            else if(i==position.length){
                i=1;
            }
            else{
                if(circle[circle.length-1]==position[i][0]){
                    circle.push(position[i][1]);
                    circle.push(position[i][2]);
                }
            }
            i++;
        }
    }
    console.log(circle);
}

const assigntown = ()=>{
    //console.log(users);
    var keys= Object.keys(users);
    for(let i=0;i<5;i++){
    var r = users[keys[Math.round(Math.random()*(keys.length+1))]];
    if(random.length==0) random.push(r);
    else{
        for(var j=0;j<random.length;j++){
            if(random[j]==r){
                console.log("matched");
                r = users[keys[keys.length*Math.random() << 0]];
                j= -1;
            }
        }
        while(r==undefined){
             r = users[keys[Math.round(Math.random()*(keys.length+1))]];
        }
        random.push(r);
    }
    }
    //console.log(random);
    //console.log(array);
    for(var i=0;i<5;i++){
        roles[random[i]]=town[array[i]];
    }
    console.log(roles);
}

const assignout=()=>{
    for(x in users){
        var u=false;
        for(var k=random.length-1;k>=0;k--){
            if(users[x]==random[k]){
                u=true;
            }
        }
        if(u==false){
            random.push(users[x]);
            var q=outsiders[Math.floor(Math.random()*5)];
            while(q==undefined){
                q=outsiders[Math.floor(Math.random()*5)];
            }
            roles[users[x]]=q;
            break;
        }
        else{
            u=false;
        }
    }
    console.log(roles);
}
const assignmin=()=>{
    for(x in users){
        var u=false;
        for(var k=random.length-1;k>=0;k--){
            if(users[x]==random[k]){
                u=true;
            }
        }
        if(u==false){
            random.push(users[x]);
            var q=minions[Math.floor(Math.random()*5)];
            while(q==undefined){
                q=minions[Math.floor(Math.random()*5)];
            }
            roles[users[x]]=q;
            break;
        }
        else{
            u=false;
        }
    }
    console.log(roles);
}
const assignimp=()=>{
    for(x in users){
        var u=false;
        for(var k=random.length-1;k>=0;k--){
            if(users[x]==random[k]){
                u=true;
            }
        }
        if(u==false){
            random.push(users[x]);
            roles[users[x]]=demon[0];
            break;
        }
        else{
            u=false;
        }
    }

    console.log(roles);
}

io.on('connection' , socket=>{
    socket.on('new-user-joined',Name => {
        users[socket.id]=Name;
        console.log(users);
        socket.emit("online-data",users);
        socket.broadcast.emit('user-joined',users); 
    });


    socket.on('send', message=>{
        if(message=="start game"){
            io.sockets.emit("game_started");
            socket.emit("hi");
        }
        else{
        socket.broadcast.emit('recieve',{message:message,Name:users[socket.id]})
        }
    })

    socket.on("start",()=>{
        var count=Object.keys(users).length;
        if(count<2){
            io.sockets.emit("game_closed");
        }
        else{
            for(let i=0;i<5;i++){
                var t = Math.floor(Math.random() * 13);
                if(array.length==0){
                    array.push(t);
                }
                else{
                    //var flag=false;
                    //while(flag==false){
                        for(var j=0;j<array.length;j++){
                            if(array[j]==t){
                                console.log("changing");
                                t = Math.floor(Math.random() * 13);
                                j=-1;
                            }
                        }
                        array.push(t);
                    //}

                }
            }
        }
        assigntown();
        if(count==7){
            assignmin();
            assignimp();
        }
        else if(count==8){
            assignout();
            assignmin();
            assignimp();
        }
        
        for(x in users){
            for(y in roles){
                if(users[x] == y){
                    io.to(x).emit("assigned",roles[y]);
                }
            }
        }

    })
    socket.on("left_right", data=>{
        position.push([data.left,data.Name,data.right]);
        console.log(position);
        check_and_circle();
    })

    socket.on('disconnect', message=>{
        socket.broadcast.emit('left',users[socket.id]);
        delete users[socket.id];
        socket.broadcast.emit("total_after_left",users)
    })
});

module.exports = io;