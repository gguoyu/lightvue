//真实dom操作

export function createElement(tagName){
    return document.createElement(tagName)
}

export function createTextNode(text){
    return document.createTextNode(text)
}

export function createComment(comment) {
    return document.createComment(comment)
}

export function insertBefore(parentNode, newNode, referenceNode) {
    parentNode.insertBefore(newNode, referenceNode)
}

export function removeChild(node,child) {
    node.removeChild(child)
}

export function appendChild(node, child) {
    node.appendChild(child)
}

export function parentNode(node) {
    return node.parentNode
}

export function nextSibling(node) {
    return node.nextSibling
}

export function tagName(node) {
    return node.tageName
}

export function setTextContent(node, text) {
    node.textContent = text
}

export function setAttribute(node, key, val) {
    node.setAttribute(key, val)
}
