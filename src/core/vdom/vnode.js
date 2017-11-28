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
