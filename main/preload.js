const msgpack = require('msgpack-lite')
window.LOG = console.log
class HookedWebSocket extends WebSocket {
	constructor(...args){
        let data = [...args]
        data[0] = "ws://localhost:8080/"
        super(data)
		this.addEventListener('message', ({ data: packet }) => {
			let [ label, ...data ] = msgpack.decode(new Uint8Array(packet))
			window.LOG('%c <= ','background:#FF6A19;color:#000',[label, ...data])
		});
		window.LOG('-> WebSocket was just hooked')
	}
};
window.WebSocket = HookedWebSocket;