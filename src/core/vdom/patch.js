/**
 * Created by birdguo on 2017/11/28.
 */

import * as nodeOps from './node-ops'

function isUndef(s){
	return s == null
}

function isDef(s){
	return s != null
}

//检查是否是相同节点
function sameVnode(vnode1, vnode2){
	return vnode1.tag === vnode2.tag
}

//移除节点
function removeNode(el){
	const parent = nodeOps.parentNode(el)

	if(parent){
		nodeOps.removeChild(parent, el)
	}
}

/**
 * @description 将节点插入dom
 *
 * @param parent
 * @param elm
 * @param ref
 */
function insert(parent, elm, ref) {
	//父节点存在才插入
	if(parent){
		if(ref){
			//参考节点存在则插入到参考节点之前
			nodeOps.insertBefore(elm, parent, ref)
		}else{
			nodeOps.appendChild(elm, parent)
		}
	}
}

/**
 * @description 创建子节点
 *
 * @param vnode
 * @param children
 */
function createChildren(vnode, children){
	//子节点存在则创建
	if(Array.isArray(children)){
		for(let i = 0; i < children.length; i++){
			//将子节点创建到父节点的dom上
			createElm(children[i], vnode.elm, null)
		}
	}
}

/**
 * @description 建立dom节点
 *
 * @param vnode
 * @param parentElm
 * @param refElm
 */
function createElm(vnode, parentElm, refElm) {
	const children = vnode.children
	const tag = vnode.tag

	if(isDef(tag)){	//非文本节点
		//先创建节点
		vnode.elm = nodeOps.createComment(vnode.tag)

		//再创建子节点
		createChildren(vnode, children)

	}else{	//文本节点
		vnode.elm = nodeOps.createTextNode(vnode.text)

	}
}

/**
 * @description 添加指定的虚拟节点
 *
 * @param parentElm
 * @param refElm
 * @param vnodes
 * @param startIdx
 * @param endIdx
 */
function addVnodes(parentElm, refElm, vnodes, startIdx, endIdx) {
	for(; startIdx <= endIdx; ++startIdx){
		createElm(vnodes[startIdx], parentElm, refElm)
	}
}

/**
 * @description 删除指定的虚拟节点
 *
 * @param parentElm
 * @param vnodes
 * @param startIdx
 * @param endIdx
 */
function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
	for(; startIdx <= endIdx; ++startIdx){
		const ch = vnodes[startIdx]
		if(isDef(ch)){
			removeNode(ch.elm)
		}
	}
}


function patchVnode(oldVnode, newVnode, removeOnly) {
	if(oldVnode === newVnode){
		return
	}

	const elm = newVnode.elm = oldVnode.elm
	const oldCh = oldVnode.children
	const ch = newVnode.children

	if(isUndef(newVnode.text)){	//非文本节点
		if(isDef(oldCh) && isDef(ch)){
			if(oldCh !== ch){
				updateChildren(elm, oldCh, ch, removeOnly)
			}
		}else if(isDef(ch)){
			if(isDef(oldVnode.text)){
				nodeOps.setTextContent(elm, '')
			}
			addVnodes(elm, null, ch, 0, ch.length - 1)
		}else if(isDef(oldCh)){
			removeVnodes(elm, oldCh, 0, oldCh.length - 1)
		}else if(isDef(oldVnode.text)){
			nodeOps.setTextContent(elm, '')
		}
	}else if(oldVnode.text !== newVnode.text){	//文本节点
		nodeOps.setTextContent(elm, newVnode.text)
	}
}

/**
 * @description 更新子节点
 *
 * @param parentElm
 * @param oldCh
 * @param newCh
 * @param removeOnly
 */
function updateChildren(parentElm, oldCh, newCh, removeOnly) {
	//old node's children list start index
	let oldStartIdx = 0;
	//new node's children list start index
	let newStartIdx = 0;
	//old node's children list end index
	let oldEndIdx = oldCh.length - 1;
	//new node's children list end index
	let newEndIdx = newCh.length - 1;
	//old node's children list start vnode
	let oldStartVnode = oldCh[oldStartIdx]
	//old node's children list end vnode
	let oldEndVnode = oldCh[oldEndIdx];
	//new node's children list start vnode
	let newStartVnode = newCh[newStartIdx]
	//new node's children list end vnode
	let newEndVnode = newCh[newEndIdx]

	let oldKeyToIdx, idxInOld, elmToMove, refElm

	const canMove = !removeOnly

	while(oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx){
		if(isUndef(oldStartVnode)){
			oldStartVnode = oldCh[++oldStartIdx]
		}else if(isUndef(oldEndVnode)){
			oldEndVnode = oldCh[--oldEndIdx]
		}else if(sameVnode(oldStartVnode, newStartVnode)){
			patchVnode(oldStartVnode, newStartVnode)
			oldStartVnode = oldCh[++oldStartIdx]
			newStartVnode = newCh[++newStartIdx]
		}else if(sameVnode(oldEndVnode, newEndVnode)){
			patchVnode(oldEndVnode, newEndVnode)
			oldEndVnode = oldCh[--oldEndIdx]
			newEndVnode = newCh[--newEndIdx]
		}else if(sameVnode(oldStartVnode, newEndVnode)){
			patchVnode(oldStartVnode, newEndVnode)
			canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
			oldStartVnode = oldCh[++oldStartIdx]
			newEndVnode = newCh[--newEndIdx]
		}else if(sameVnode(oldEndVnode, newStartVnode)){
			patchVnode(oldEndVnode, newStartVnode)
			canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
			oldEndVnode = oldCh[--oldEndIdx]
			newStartVnode = newCh[++newStartIdx]
		}else{
			createElm(newStartVnode, parentElm, oldStartVnode.elm)
			newStartVnode = newCh[++newStartIdx]
		}
	}
}

/**
 * @description 讲vnode渲染到dom中
 *
 * @param oldVnode
 * @param newVnode
 * @returns {*}
 */
export default function patch(oldVnode, newVnode) {
	let isInitialPatch = false

	if(sameVnode(oldVnode, newVnode)){
		//两个vnode节点的根节点一致
		patchVnode(oldVnode, newVnode)
	}else{
		//根节点不同
		//拿到原dom的容器，将新节点的dom生成进去
		//然后移除原节点
		const oldElm = oldVnode.elm
		const parentElm = nodeOps.parentNode(oldElm)

		createElm(newVnode, parentElm, nodeOps.nextSibling(oldElm))

		if(parentElm !== null){
			removeVnodes(parentElm, [oldVnode], 0, 0)
		}
	}

	return newVnode.elm
}
