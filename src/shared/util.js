/**
 * Created by birdguo on 2017/11/29.
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

export const no = () => false
