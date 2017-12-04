/**
 * Created by birdguo on 2017/11/29.
 */

/**
 * @description convert a value to a string that is actually rendered.
 *
 * @param val
 * @private
 */
export function _toString(val){
	return val == null
		? ''
		: typeof val === 'object'
			? JSON.stringify(val, null, 2)
			: String(val)
}

/**
 * @description make map and return a function for checking if a ke is in that map
 *
 * @param str
 * @param expectsLowerCase
 * @returns {function(*): *}
 */
export function makeMap(str, expectsLowerCase) {
	const map = Object.create(null)
	const list = str.split(',')

	for(let i = 0; i < list.length; i++){
		map[list[i]] = true
	}

	return expectsLowerCase
		? val => map[val.toLowerCase()]
		: val=> map[val]
}

const hasOwnProperty = Object.prototype.hasOwnProperty

/**
 * @description check wheather the object has the property
 *
 * @param obj
 * @param key
 * @returns {*}
 */
export function hasOwn(obj, key){
	return hasOwnProperty.call(obj, key)
}

const toString = Object.prototype.toString
const OBJECT_STRING = '[object Object]'

/**
 * @description strict object type check, only returns true for plain JavaScript objects.
 *
 * @param obj
 * @returns {boolean}
 */
export function isPlainObject(obj) {
	return toString.call(obj) === OBJECT_STRING
}

/**
 * @description perform no operation
 */
export function noop() {

}

export const no = () => false
