import fs from '@system.file'

import app from '@system.app'
import router from '@system.router'
import configuration from '@system.configuration'
import storage from '@system.storage'
import vibrator from '@system.vibrator'
import sensor from '@system.sensor'
import geolocation from '@system.geolocation'
import device from '@system.device'
import brightness from '@system.brightness'
import battery from '@system.battery'
// @ts-ignore
import bluetooth from '@system.bluetooth'
// @ts-ignore
import wearengine from '@system.wearengine'

const DEVICE_WIDTH = 336, DEVICE_HEIGHT = 480
const DISPLAYER_PAGES = 3, BGS = [0x99bbff, 0xff66a3, 0x000000]
const DISPLAYER0_DEFAULT_CONTENT = `e()`, DISPLAYER0_DEFAULT_POINTER = 2
const KEYBOARD_GENERALS = '\\n \\s :: <- -> √'
const JUMP_LENGTH = 15
const POINTER_CHAR = '┃'
const DOCS_DIR = 'internal://app/docs', DOCS_DEFAULT_NAME = 'index.js'
const APIS = {
    file: fs,
    app: app,
    router: router,
    configuration: configuration,
    storage: storage,
    vibrator: vibrator,
    sensor: sensor,
    geolocation: geolocation,
    device: device,
    brightness: brightness,
    battery: battery,
    wearengine: wearengine,
    bluetooth: bluetooth
}

const ensureFile = (dir, then, err) => {
    fs.access({
        uri: dir,
        success: then,
        fail() {
            fs.writeText({
                uri: dir,
                text: '',
                success: then,
                fail: err
            })
        }
    })
}
const ensureDir = (dir, then, err) => {
    fs.access({
        uri: dir,
        success: then,
        fail() {
            fs.mkdir({
                uri: dir,
                success: then,
                fail: err
            })
        }
    })
}

export default {
    data: {
        displayPage: 0,
        display0: DISPLAYER0_DEFAULT_CONTENT,
        display1: '',
        display2: DOCS_DEFAULT_NAME,
        pointer0: DISPLAYER0_DEFAULT_POINTER,
        pointer1: 0,
        pointer2: DOCS_DEFAULT_NAME.length,
        displayerHeight0: 1,
        displayerHeight1: 1,
        displayerHeight2: 1,
        keyPages: [
            [
                'q w e r t y'.split(' '),
                'a s d f g h'.split(' '),
                'z x c v b n'.split(' '),
                KEYBOARD_GENERALS.split(' ')
            ],
            [
                'u i o p j k'.split(' '),
                'l m , ; ? :'.split(' '),
                '< > { } [ ]'.split(' '),
                KEYBOARD_GENERALS.split(' ')
            ],
            [
                '1 2 3 0 + -'.split(' '),
                '4 5 6 . * /'.split(' '),
                '7 8 9 ( ) ='.split(' '),
                KEYBOARD_GENERALS.split(' ')
            ],
            [
                '% & | ^ ! ~'.split(' '),
                '" \' ` \\ @ #'.split(' '),
                '$ _'.split(' '),
                KEYBOARD_GENERALS.split(' ')
            ],
            [
                'ok js op mt fo'.split(' '),
                '++ -- == Aa'.split(' '),
                '<< >> ::: ↑ ↓ ×'.split(' '),
                KEYBOARD_GENERALS.split(' ')
            ]
        ],
        dictionary: {
            '\\n': '\n',
            '\\s': ' ',
            'ok': 'Object.keys()',
            'js': 'JSON.stringify()',
            'op': 'Object.getPrototypeOf()',
            'mt': 'Math.',
            'fo': 'for(let i=0;i<;i++){}'
        },
        dictionary2: {
            '<-': 'pointer-left',
            '->': 'pointer-right',
            '++': 'displayer-zoom-in',
            '--': 'displayer-zoom-out',
            '==': 'displayer-zoom-reset',
            '×': 'displayer-clear',
            '<<': 'pointer-jump-left',
            '>>': 'pointer-jump-right',
            '::': 'input-backspace',
            ':::': 'input-backspace-jump',
            'Aa': 'input-case',
            '√': 'execute',
            '↑': 'fs-save',
            '↓': 'fs-sync'
        }
    },

    calc_display() {
        const pointerId = 'pointer' + this.displayPage,
            displayId = 'display' + this.displayPage
        let arr = this[displayId].split('')
        arr.splice(this[pointerId], 0, POINTER_CHAR)
        return arr.join('')
    },
    calc_displayerHeight() {
        const displayerHeightId = 'displayerHeight' + this.displayPage
        return DEVICE_HEIGHT * this[displayerHeightId]
    },
    calc_displayerBg() {
        return BGS[this.displayPage]
    },
    calc_keyBg(v) {
        return v in this.dictionary || v in this.dictionary2
            ? BGS[1] : BGS[0]
    },

    changeDisplay(data) {
        if (data.globalX < DEVICE_WIDTH / 2)
            this.displayPage = this.displayPage == 0
                ? DISPLAYER_PAGES - 1 : this.displayPage - 1
        else
            this.displayPage = (this.displayPage + 1) % DISPLAYER_PAGES
    },
    api_e(data){
        this.display1 += data + '\n'
        this.pointer1 = this.display1.length
        this.displayPage = 1
    },
    api_e1(data) {
        this.display1 += data
        this.pointer1 = this.display1.length
        this.displayPage = 1
    },
    api_ce() {
        this.display1 = ''
        this.pointer1 = 0
        this.displayPage = 1
    },
    key(key) {
        const pointerId = 'pointer' + this.displayPage,
            displayId = 'display' + this.displayPage,
            displayerHeightId = 'displayerHeight' + this.displayPage
        const allowEdit = this.displayPage == 0 || this.displayPage == 2

        if (key in this.dictionary2) {
            key = this.dictionary2[key]
            if (key == 'pointer-left') {
                this[pointerId] > 0 && this[pointerId] --
            }
            else if (key == 'pointer-right') {
                this[pointerId] < this[displayId].length && this[pointerId] ++
            }
            else if (key == 'pointer-jump-left') {
                    this[pointerId] - JUMP_LENGTH >= 0
                    ? this[pointerId] -= JUMP_LENGTH
                    : this[pointerId] = 0
            }
            else if (key == 'pointer-jump-right') {
                    this[pointerId] + JUMP_LENGTH <= this[displayId].length
                    ? this[pointerId] += JUMP_LENGTH
                    : this[pointerId] = this[displayId].length
            }
            else if (key == 'displayer-zoom-in') {
                this[displayerHeightId] ++
            }
            else if (key == 'displayer-zoom-out') {
                if (this[displayerHeightId] > 1)
                    this[displayerHeightId] --
            }
            else if (key == 'displayer-zoom-reset') {
                this[displayerHeightId] = 1
            }
            else if (key == 'displayer-clear') {
                this[displayId] = ''
                this[pointerId] = 0
            }
            else if (allowEdit && key == 'input-backspace') {
                if (this[pointerId] > 0) {
                    const arr = this[displayId].split('')
                    arr.splice(this[pointerId] - 1, 1)
                    this[displayId] = arr.join('')
                    this[pointerId] --
                }
            }
            else if (allowEdit && key == 'input-backspace-jump') {
                if (this[pointerId] - JUMP_LENGTH >= 0) {
                    const arr = this[displayId].split('')
                    arr.splice(this[pointerId] - JUMP_LENGTH, JUMP_LENGTH)
                    this[displayId] = arr.join('')
                    this[pointerId] -= JUMP_LENGTH
                }
                else {
                    const arr = this[displayId].split('')
                    arr.splice(0, this[pointerId])
                    this[displayId] = arr.join('')
                    this[pointerId] -= this[pointerId]
                }
            }
            else if (allowEdit && key == 'input-case') {
                if (this[pointerId] > 0) {
                    const arr = this[displayId].split('')
                    const ochar = arr[this[pointerId] - 1]
                    const nchar = ochar.toLowerCase() == ochar
                        ? ochar.toUpperCase() : ochar.toLowerCase()
                    arr.splice(this[pointerId] - 1, 1, nchar)
                    this[displayId] = arr.join('')
                }
            }
            else if (key == 'execute') {
                try {
                    const func = new Function(
                        'e', 'e1', 'ce', 'apis',
                        `try { ${this.display0} } catch (ex) { e('ERROR: ' + ex) }`
                    )
                    func(this.api_e, this.api_e1, this.api_ce, APIS)
                }
                catch (ex) {
                    this.api_e('ERROR: ' + ex)
                }
                this.displayPage = 1
            }
            else if (key == 'fs-save') {
                const t = this
                ensureDir(DOCS_DIR, () => {
                    fs.writeText({
                        uri: DOCS_DIR + '/' + t.display2,
                        text: t.display0,
                        success() {
                            t.api_e('INFO: saved successfully.')
                        },
                        fail() {
                            t.api_e('ERROR: save failed.')
                        }
                    })
                }, (a) => t.api_e('ERROR: failed to init.' + a))
            }
            else if (key == 'fs-sync') {
                const t = this
                const dir = DOCS_DIR + '/' + t.display2
                const fail = (a) => t.api_e('ERROR: failed to init.' + a)

                ensureDir(DOCS_DIR, () => {
                    ensureFile(dir, () => {
                        fs.readText({
                            uri: dir,
                            success(data) {
                                const { text } = data
                                t.display0 = text
                                t.pointer0 = text.length
                                t.api_e('INFO: synced successfully.')
                            },
                            fail() {
                                t.api_e('ERROR: failed to sync or the file is empty.')
                            }
                        })
                    }, fail)
                }, fail)
            }
        }
        else if (allowEdit && key in this.dictionary) {
            const arr = this[displayId].split('')
            arr.splice(this[pointerId], 0, this.dictionary[key])
            this[displayId] = arr.join('')
            this[pointerId] += this.dictionary[key].length
        }
        else if (allowEdit) {
            const arr = this[displayId].split('')
            arr.splice(this[pointerId], 0, key)
            this[displayId] = arr.join('')
            this[pointerId] += key.length
        }
        else {
            this.displayPage = 0
        }
    }
}
