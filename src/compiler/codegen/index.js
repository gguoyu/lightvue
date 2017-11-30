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

/**
 * parse html string to AST structure
 * ast = {attrsList, attrsMap, children, parent, tag, type=1}	//non text node
 * ast = {text, type=3} //text node
 */
export default function parse(template){
	const stack = []
	let root
	let currentParent

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

			if(!root){
				root = element
			}

			if(currentParent){
				currentParent.children.push(element)
			}

			if(!unary){
				currentParent = element
				stack.push(element)
			}
		},
		end(){
			stack.length -= 1
			currentParent = stack[stack.length - 1]
		},
		chars(text){
			if(!currentParent){
				return
			}

			const children = currentParent.children
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