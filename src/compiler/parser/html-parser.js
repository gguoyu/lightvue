/**
 * Created by birdguo on 2017/11/29.
 */
import {makeMap, no} from 'shared/util'

//无需成对闭合的标签
export const isUnaryTag = makeMap(
	'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,link,meta,param,source,track,wbr',
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
	/([^\s"'=<>`]*)+/.source,
]

const attribute = new RegExp(
	'' + singleAttrIdentifier.source +
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
		if(!lastTag ||!isScriptOrStyle(lastTag)){

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

			}
		}
	}
}
