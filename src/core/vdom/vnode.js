/**
 * Created by birdguo on 2017/11/27.
 * @description 虚拟Node节点类文件
 */

export default class VNode {
	constructor (
		//标签名
		tag,
		//attr, 属性暂不加
		//子节点
		children,
		//文本节点
		text,
		//真实dom对象
		elm
	) {
		this.tag = tag
		this.children = children
		this.text = text
		this.elm = elm
	}
}

/**
 * @description 创建一个空节点
 *
 * @returns {VNode}
 */
export const createEmptyVNode = () => {
	const node = new VNode()
	node.text = ''

	return node
}

/**
 * @description 创建元素节点
 *
 * @param tag
 * @param children
 */
export function createElementVNode(tag, children) {
	if(!tag){
		return createEmptyVNode()
	}

	return new VNode(tag, children, undefined, undefined)
}

/**
 * @description 创建文本节点
 *
 * @param val
 * @returns {VNode}
 */
export function createTextVNode(val) {
	return new VNode(undefined, undefined, String(val))
}
