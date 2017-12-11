import parse from 'compiler/index'
import VNode from 'core/vdom/vnode'

/**
 * @description 生成函数
 *
 * <div>
 *     <span>abc{{a}}xxx{{b}}def</span>
 * </div>
 *
 * this == Vue Instance == vm
 *
 * generate to:
 *
 * function render(){
 * 	with(this){
 * 		return _c("div", [
 * 			_c("span", [
 * 				_v("abc" + _s(a) + "xxx" + _s(b) + "def")
 * 			])
 * 		])
 * 	}
 * }
 *
 * @param ast
 * @returns {{render: string}}
 */
export function generate(ast) {
	const code = ast ? genElement(ast) : '_c("div")'

	return {
		render: ("with(this){return " + code + "}")
	}
}

function genElement(el){
	let code

	const children = getChildren(el)

	code = `_c('${el.tag}' ${children ? `,${children}` : ''
	})`

	return code
}

function getChildren(el) {
	const children = el.children

	if(children.length){
		return `[${(children.map(genNode).join(','))}]`
	}
}

function  genNode(node) {
	if(node.type === 1){
		return genElement(node)
	}else{
		return genText(node)
	}
}

function genText(text) {
	return `_v(${text.type === 2
		? text.expression	//no need for () because already wrapped in _s()
		: JSON.stringify(text.text)
	})`
}
