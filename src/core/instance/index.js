/**
 * Created by birdguo on 2017/12/4.
 */
import patch from 'core/vdom/patch'
import compile from 'compiler/index'
import generate from 'compiler/codegen/index'

import {_toString} from '../util/index'
import {createTextVNode, createElementVNode} from '../vdom/vnode'

import {warn, hasOwn, isPlainObject} from '../util/index'
