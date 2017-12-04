/**
 * Created by birdguo on 2017/11/29.
 */
import {makeMap, no} from 'shared/util'

//无需成对闭合的标签
export const isUnaryTag = makeMap(
	'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,link,meta,param,source,track,wbr',
	true
)

//Elements that you can, intentionally, leave open
//(and which close themselves)
export const canBeLeftOpenTag = makeMap(
	'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source',
	true
)

//HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
//Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
export const isNonPhrasingTag = makeMap(
	'address,article,aside,base,blockquote,body,caption,col,colgroup,' +
	'dd,details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
	'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
	'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,' +
	'thead,title,tr,track',
	true
)

//单个属性正则标识
const singleAttrIdentifier = /([^\s"'<>/=]+)/
const singleAttrAssign = /(?:=)/
const singleAttrValues = [
	//双引号属性
	/"([^"]*)"+/.source,
	//单引号属性
	/'([^']*)'+/.source,
	//属性值，无引号
	/([^\s"'=<>`]+)/.source,
]

const attribute = new RegExp(
	'^\\s*' + singleAttrIdentifier.source +
	'(?:\\s*(' + singleAttrAssign.source + ')' +
	'\\s*(?:' + singleAttrValues.join('|') + '))?'
)

const ncname = '[a-zA-Z_][\\w\\-\\.]*'
const qnameCapture = '((?:' + ncname + '\\:)?' + ncname + ')'
const startTagOpen = new RegExp('^<' + qnameCapture)
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp('^<\\/' + qnameCapture + '[^>]*>')
const doctype = /^<!DOCTYPE [^>]+>/i
const comment = /^<!--/
const conditionalComment = /^<!-\[/

let IS_REGEX_CAPTURING_BROKEN = false
'x'.replace(/x(.)?/g, function(m, g){
	IS_REGEX_CAPTURING_BROKEN = g === ''
})

//special Elements
const isScriptOrStyle = makeMap('script,style', true)
const reCache = {}

const decodingMap = {
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&amp;': '&',
	'&#10;': '\n',
}

const encodedAttr = /&(?:lt|gt|quot|amp);/g
const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#10);g/

//check whether current browserencodes a char inside attribute values
function shouldDecode(content, encoded) {
	const div = document.createElement('div')
	div.innerHTML = `<div a="${content}">`

	return div.innerHTML.indexOf(encoded) > 0
}

const shouldDecodeNewLines = shouldDecode('\n', '&#10;')

function decodeAttr(value) {
	const re = shouldDecodeNewLines ? encodedAttrWithNewLines : encodedAttr
	return value.replace(re, match => decodingMap[match])
}

export function parseHTML(html , options) {
	/*
	options = {
		chars: 解析到文本的回调
		start: 解析到标签起始的回调
		end: 解析到标签结束的回调
	}
	 */
	const stack = []
	let index = 0;
	let last, lastTag

	while(html){
		last = html
		if(!lastTag || !isScriptOrStyle(lastTag)){
			let textEnd = html.indexOf('<')
			if(textEnd === 0){
				//comment
				if(comment.test(html)){//move pointer to end of "<!-- xxx -->"
					const commentEnd = html.indexOf('-->')

					if(commentEnd >= 0){
						advance(commentEnd + 3)
						continue
					}
				}

				//contidional comment
				if(conditionalComment.test(html)){	//move pointer to end of "<![if xxx]> xxx <![endif]>"
					const conditionalEnd = html.indexOf(']>')

					if(conditionalEnd >= 0){
						advance(conditionalEnd + 2)
						continue
					}
				}

				//doctype
				const doctypeMatch = html.match(doctype)	//doctypeMatch = []
				if(doctypeMatch){	//move pointer to end of "<!DOCTYPE xxx>"
					advance(doctypeMatch[0].length)
					continue
				}

				//end of the tag
				const endTagMatch = html.match(endTag)
				if(endTagMatch){
					const curIndex = index
					advance(endTagMatch[0].length)
					//handle stack info, callback parent
					parseEndTag(endTagMatch[1], curIndex, index)
					continue
				}

				//start of tag, exp: "<xxx attr='xx'>"
				const startTagMatch = parseStartTag()	//
				if(startTagMatch){
					handleStartTag(startTagMatch)
					continue
				}
			}

			//handle text node
			let text, rest, next
			if(textEnd >= 0){
				rest = html.slice(textEnd)
				while(
					!endTag.test(rest) &&
					!startTagOpen.test(rest) &&
					!comment.test(rest) &&
					!conditionalComment.test(rest)
				){
					next = rest.indexOf('<', 1)
					if(next < 0){
						break
					}

					textEnd += next
					rest = html.slice(textEnd)
				}
				text = html.substring(0, textEnd)
				advance(textEnd)
			}

			if(textEnd < 0){
				text = html
				html = ''
			}

			if(options.chars && text){
				options.chars(text)
			}
		}else{
			//lastTag is script or style or noscript
			var stackedTag = lastTag.toLowerCase()
			var reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>', 'i'))
			var endTagLength = 0
			var rest = html.replace(reStackedTag, function (all, text, endTag) {
				endTagLength = endTag.length
				if(options.chars){
					options.chars(text)
				}

				return ''
			})

			index += html.length - rest.length
			html = rest
			parseEndTag(stackedTag, index - endTagLength, index)	//closed script style noscript tag
		}

		if(html === last){
			//if the pointer still no moving wheather handle up.then the rest string as text node, break circle
			options.chars && options.chars(html)

			if(!stack.length && options.warn){	//if there is element at top stack, means not closed. then warn
				options.warn (`Mal-formatted tag at end of template: ${html}`)
			}

			break
		}
	}

	//closed tag
	parseEndTag()

	function advance(n) {
		index += n
		html = html.substring(n)
	}

	function parseStartTag() {
		const start = html.match(startTagOpen)
		if(start){
			const match = {
				tagName: start[1],
				attrs: [],
				start: index
			}
			advance(start[0].length)

			//explain attribute
			let end, attr
			while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))){
				advance(attr[0].length)
				match.attrs.push(attr)
			}

			if(end){
				match.unarySlash = end[1]
				advance(end[0].length)
				match.end = index
				return match
			}
		}
	}

	function handleStartTag(match){
		const tagName = match.tagName
		const unarySlash = match.unarySlash

		if(lastTag === 'p' && isNonPhrasingTag(tagName)){
			//tag "p" can not be embed some tag, like div
			//so if found the situtation, must be end before
			//<p><span></span><div></div></p> =>
			//browser render:
			//<p><span></span></p><div></div><p></p>
			//so we need end of p first if we found can not
			//embed tag and parse </p> to <p></p>
			parseEndTag(lastTag)
		}

		if(canBeLeftOpenTag(tagName) && lastTag === tagName){
			//
			parseEndTag(tagName)
		}

		const unary = isUnaryTag(tagName) || tagName === 'html' && lastTag === 'head' || !!unarySlash

		const l = match.attrs.length
		const attrs = new Array(l)

		for(let i = 0; i < l; i++){
			const args = match.attr[i]
			//hackish work around FF bug
			if(IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1){
				if(args[3] === ''){
					delete args[3]
				}
				if(args[4] === ''){
					delete args[4]
				}
				if(args[5] === ''){
					delete args[5]
				}
			}

			const value = args[3] || args[4] || args[5] || ''
			attrs[i] = {
				name: args[1],
				value: decodeAttr(value)
			}
		}

		if(!unary){	//if not unary tag, then push to stack
			stack.push({
				tag: tagName,
				lowerCaseTag: tagName.toLowerCase(),
				attrs: attrs
			})
			lastTag = tagName
		}

		if(options.start){
			options.start(tagName, attrs, unary, match.start, match.end)
		}
	}

	function parseEndTag(tagName, start, end) {
		let pos, lowerCaseTagName

		if(start == null){
			start = index
		}

		if(end == null){
			end = index
		}

		if(tagName){
			lowerCaseTagName = tagName.toLowerCase()
		}

		if(tagName){
			for(pos = stack.length - 1; pos >= 0; pos--){
				if(stack[pos].lowerCaseTag === lowerCaseTagName){
					break
				}
			}
		}else{
			//clear all stack
			pos = 0
		}

		if(pos >= 0){
			//close all tag not closed
			for(let i = stack.length - 1; i >= pos; i--){
				if((i > pos || !tagName) && options.warn){	//has not closed tag, then warn
					options.warn(`tag <${stack[i].tag}> has no matching end tag.`)
				}

				if(options.end){
					options.end(stack[i].tag, start, end)
				}
			}

			stack.length = pos
			lastTag = pos && stack[pos - 1].tag
		}else if(lowerCaseTagName === 'br'){
			//single </br> parse to <br>
			if(options.start){
				options.start(tagName, [], true, start, end)
			}
		}else if(lowerCaseTagName === 'p'){
			//single </p> parset to <p></p>
			if(options.start){
				options.start(tagName, [], false, start, end)
			}
			if(options.end){
				options.end(tagName, start, end)
			}
		}else{
			//if we can not found matched start tag, then we
			//ignore end tag
		}
	}
}
