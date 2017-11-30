import parse from 'compiler/parser/index'
import VNode from 'core/vdom/vnode'

export default function generate(ast) {
	return genElement(ast)
}

function genElement(el){
	let vnode = null

	if(el){
		if(el.type == 1){
			//non text node
			vnode = new VNode(el.tag, getChildren(el), undefined, null)
		}else if(el.type == 3){
			//text node
			vnode = new VNode(null, [], el.text, null)
		}
	}

	return vnode
}

function getChildren(el) {
	const children = el.children
	const childrenVode = []

	if(children.length){
		children.forEach((c) => {
			childrenVode.push(genElement(c))
		})
	}

	return childrenVode
}
