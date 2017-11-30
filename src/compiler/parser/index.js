import {parseHTML} from './html-parser'

function makeAttrsMap(attrs){
	const map = {}
	for(let i = 0, l = attrs.length; i < l; i++){
		map[attrs[i].name] = attrs[i].value
	}

	return map
}

function decode(html){
	let decoder = document.createElement('div')
	decoder.innerHTML = html
	return decoder.textContent
}

const isPreTag = (tag) => tag === 'pre'

/**
 * parse html string to AST structure
 * ast = {attrsList, attrsMap, children, parent, tag, type=1}	//non text node
 * ast = {text, type=3} //text node
 */
export default function parse(template){
	const stack = []
	let root	//root of ast
	let currentParent	//parent node of current node
	let inPre = false

	function endPre(element) {
		if(isPreTag(element.tag)){
			inPre = false
		}
	}

	parseHTML(template, {
		start(tag, attrs, unary){
			const element = {
				type: 1,
				tag,
				attrsList: attrs,
				attrsMap: makeAttrsMap(attrs),
				parent: currentParent,
				children: []
			}

			if(isPreTag(element.tag)){
				inPre = true
			}

			if(!root){
				root = element
			}

			if(currentParent){
				currentParent.children.push(element)
			}

			if(!unary){
				currentParent = element
				stack.push(element)
			}else{
				endPre(element)
			}
		},
		end(){
			const element = stack[stack.length - 1]
			const lastNode = element.children[element.children.length - 1]
			if(lastNode && lastNode.type === 3 && lastNode.text === ' ' && !inPre){
				//delete the empty node that are end of child node
				element.children.pop()
			}

			stack.length -= 1
			currentParent = stack[stack.length - 1]
			endPre(element)
		},
		chars(text){
			if(!currentParent){
				return
			}

			const children = currentParent.children
			//if the texe node has many space and parent node
			//has other child, then need to create a single space
			//text node
			text = inPre || text.trim() ?
				decode(text) :
				(children.length ? ' ' : '')
			if(text){
				children.push({
					type: 3,
					text
				})
			}
		}
	})

	return root
}