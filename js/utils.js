const ipcRender = require('electron').ipcRenderer
const ipcMain = require('electron').ipcMain

/*
  I don't want to use jQuery, but I also hate writing document.querySelector[All](element)
   a million times, so I wrote my own selector functions.
 */

const q = ele => document.querySelectorAll(ele).length > 1 ? document.querySelectorAll(ele) : document.querySelector(ele)
const qi = (id) => document.getElementById(id)
const qc = cls => document.getElementsByClassName(cls)

/*
  I do a lot of element creation, so this shortens it.
  ele = element to create
  attrs = any attributes to add to the element in object format
    most typical style elements like {style: {width: '100px'}}
    and the id of the element
  listeners = any event listeners to add. also in object form
    example: {'console-message': (e)=>console.log(e.message)
 */

const create = (ele, attrs, listeners) => {
  // create element
  const e = document.createElement(ele)
  // add any attributes
  if (attrs) {
    for (let key in attrs) {
      if (attrs.hasOwnProperty(key)) {
        if (typeof attrs[key] === 'object') {
          for (let k in attrs[key]) {
            e[key][k] = attrs[key][k]
          }
        } else {
          if (key === 'class') e.classList.add(attrs[key])
          else if (key.includes('data')) e.setAttribute(key, attrs[key])
          else e[key] = attrs[key]
        }
      }
    }
  }
  // add any event listeners
  if (listeners) {
    for (let l in listeners) {
      if (listeners.hasOwnProperty(l)) e.addEventListener(l, listeners[l])
    }
  }
  return e
}

/* ipc messaging shortcuts
 There is a LOT of messaging in this app
 so I shortened it to make it less keystrokes
  msg = message to send
  channel = channel to use
  type = 'r' for ipcRender.send,
         'h' for ipcRender.sendToHost or
         else ipcMain.send()
 */
const send = (msg, channel = 'default', type = 'h') => {
  if (type === 'h') ipcRender.sendToHost(channel, msg)
  else if (type === 'r') ipcRender.send(channel, msg)
  else ipcMain.send(channel, msg)
}


// This gets rid of the Issue from the text
// A lot of times the text is something like
// Batman Issue #51. This removes the issue
// and grabs the title of the comic itself
const removeIssue = (txt, ind) => {
  if (!ind) ind = 0
  // TODO: There are some comics that just have the title and issue: SEE DEADPOOL (1997) -1
  txt = txt.replace(/[\n,\r]/g, ' ')
  const possibilities = ['Issue', 'Full', 'TPB', 'Special', '_Special', 'Annual', '_Annual']
  const regex = `${possibilities[ind]}(?!.*${possibilities[ind]})`
  if (txt.match(regex)) return txt.substr(0, txt.match(regex).index - 1)
  else if (ind === possibilities.length) return txt
  else return removeIssue(txt, ind + 1)
}

module.exports = {
  q: q,
  qi: qi,
  qc: qc,
  send: send,
  create: create,
  removeIssue: removeIssue
}