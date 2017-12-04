/**
 * Created by birdguo on 2017/12/4.
 */
const hasConsole = typeof console !== 'undefined'

export function warn(msg, vm) {
	if(hasConsole){
		console.error(`[Vue warn]: ${msg}`)
	}
}
