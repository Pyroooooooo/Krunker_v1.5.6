const { WebSocketServer } = require('ws')
const msgpack = require("msgpack-lite")
let _ws = null 
let CURRENT_GAME_TIME = (4*60)-1 //-1 cuz we have NEVER seen the timer at 4:00
module.exports = (mapIndex,callback) => {
    const wss = new WebSocketServer({ port: 8080 })
    wss.on('connection', function connection(ws) {
        console.log("=> WebSocket connected")
        _ws = ws
        ws.on('error', console.error)
        ws.sendToWs = (array) => {
            if(ws.CLOSED != 3){_ws=null;return};
            let packet = new Uint8Array(array)
            let padding = 2
            let signature = packet.slice(-padding)
            ws.send(Buffer.from(Uint8Array.from([...msgpack.encode(array), ...signature])))
        }

        ws.on('message', function message(message) {
            const data = Array.from(msgpack.decode(new Uint8Array(message)))
            const label = data[0]
            if(label != "i" && label != "a" && label != "po"){ //[i displays player coords and player weapon coord?] [a is to prevent account login attempts from logging into console] & [po is just ping pong messages]
                console.log(data)
            }
            if (label == "po") {
                ws.sendToWs(["pir", 1])
                setTimeout(()=>{
                    ws.sendToWs(['pi', null])
                },5e3)
                return 
            }

            if(label === "etrg"){
                ws.sendToWs(['start',0,true,false,true])
                //ws.sendToWs([8,...[0, 10,10,10,0,0,0,true, false, false, 0, 0, 0, 0, true, false]])
//0, x , y , z , xvel, yvel, zvel, onGround, didjump, onladder, aimval, crouchval, players.swapweap, slidetimer, canslide, onterrain
                return
            }

        })

        ws.sendToWs(['pi', null])
        
        ws.ID = makeid(5) //ws id gen

        //load things

        ws.sendToWs(['load', 20000, ws.ID])
        ws.sendToWs(['io-init',ws.ID])
        //now the object passed inside the array is not designed for 1.5.6 but works just fine
        //this can be modified too, eg the billboard
        sendLoadMap(mapIndex)

        setInterval(() => {
            ws.sendToWs(['t', parseTimeString(CURRENT_GAME_TIME)])
            if(CURRENT_GAME_TIME > 0){
                CURRENT_GAME_TIME = CURRENT_GAME_TIME-1
            } else {
                CURRENT_GAME_TIME = (4*60)-1
            }
        }, 1e3)
    })

    wss.on("listening", () => {
        console.log("=> WebSocket open")
        callback()
    })

    function parseTimeString(time){
        let minutes = parseInt(time/60)
        let seconds = time-(60*minutes)
        if(seconds<10){seconds = "0"+(seconds.toString())}
        const format = `${"0"+(minutes.toString())}:${seconds}`
        return format
    }
    
    function makeid(length) {
        let result = ''
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        const charactersLength = characters.length
        let counter = 0
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength))
            counter += 1
        }
        return result
    }
    
    function makeidwithdashes(e) {
        //'afdcb8fe-1f73-45b7-b299-e1d09328de2e'
        let length = e || 36
        let result = ''
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
        const charactersLength = characters.length
        let counter = 0
        let addDashPos = [8, 13, 18, 23]
        while (counter < length) {
            if (addDashPos.includes(counter)) {
                result += "-"
            } else {
                result += characters.charAt(Math.floor(Math.random() * charactersLength))
            }
            counter += 1
        }
        return result
    }
}
module.exports.resetMap = (newindex) => {
    sendLoadMap(newindex?newindex:Math.floor(Math.random()*4))
}

function sendLoadMap(id){
    _ws.sendToWs([
        "init",
        id ? id : 4, 
        0,
        0,
        null,
        null,
        {
            "cost": 0,
            "deltaMlt": 1,
            "maxPlayers": 2,
            "minPlayers": 0,
            "gameTime": 4,
            "warmupTime": 0,
            "gamRounds": 1,
            "intermTmr": 30,
            "forceSpawn": 0,
            "lives": 0,
            "scoreLimit": 0,
            "keepTScore": false,
            "objtvTime": 1,
            "forceC": true,
            "logTim": true,
            "lstChkT": false,
            "gravMlt": 1,
            "fallDmg": 0,
            "fallDmgThr": 0,
            "jumpMlt": 1,
            "fixMov": false,
            "slidTime": 1,
            "slidSpd": 1,
            "impulseMlt": 1,
            "wallJP": 1,
            "strafeSpd": 1.2,
            "canSlide": true,
            "airStrf": false,
            "autoJump": false,
            "bDrop": false,
            "healthMlt": 1,
            "hitBoxPad": 0.6,
            "fiRat": 1,
            "reSpd": 1,
            "hpRegen": true,
            "killRewards": true,
            "headshotOnly": false,
            "noSecondary": false,
            "noStreaks": false,
            "disableB": false,
            "throwMel": true,
            "chrgWeps": true,
            "selTeam": false,
            "frFire": false,
            "nameTeam1": "Team 1",
            "nameTeam2": "Team 2",
            "nameTeam3": "Team 3",
            "nameTeam4": "Team 4",
            "nameTeam5": "Team 5",
            "t1Dmg": 1,
            "t2Dmg": 1,
            "t3Dmg": 1,
            "t4Dmg": 1,
            "t5Dmg": 1,
            "allowSpect": true,
            "thirdPerson": false,
            "nameTags": false,
            "nameTagsFR": false,
            "kCams": true,
            "aAnon": true,
            "specSlots": 2,
            "tmSize": 3,
            "noCosm": false,
            "tstCmp": false,
            "limitClasses": 0,
            "noDraws": false,
            "bstOfR": false,
            "headClipFix": false,
            "maxPS": false,
            "promServ": false,
            "maps": [
                0,
                1,
                2,
                3,
                4,
                6,
                7,
                8,
                9,
                10,
                11,
                12,
                13,
                14,
                15,
                16,
                19,
                21,
                22,
                23,
                24,
                25,
                26,
                28
            ],
            "modes": null,
            "classes": [
                0,
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                11,
                12,
                13,
                15
            ]
        },
        null,
        0,
        null,
        {
            "gor": 1,
            "lockT": 0,
            "roundC": 0,
            "bill": {
                "t": "KICK SNIPERS OUTTA KRUNKER",
                "tc": "#e3e3e3",
                "bc": "#000000"
            },
            "zone": 0,
            "lck": 0,
            "obj": [
                null,
                0
            ],
            "pwup": [
                0,
                0,
                0
            ],
            "flg": [
                [
                    523,
                    -198,
                    41,
                    -233,
                    0,
                    null
                ],
                [
                    525,
                    249,
                    24,
                    209,
                    0,
                    null
                ],
                [
                    544,
                    -153,
                    32,
                    241,
                    0,
                    null
                ]
            ],
            "dest": [
                539,
                541
            ]
        },
        {},
        true,
        false,
        false,
        "e466edb1-8bc4-41d7-9c0e-5968ab47b369",
        "a10417ad-d10e-447e-90b1-8e1b116ace6d",
        193300
    ])
}