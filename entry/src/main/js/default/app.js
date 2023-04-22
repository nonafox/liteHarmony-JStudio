import brightness from '@system.brightness'

export default {
    onCreate() {
        console.info('Application onCreate')
        brightness.setKeepScreenOn({
            keepScreenOn: true
        })
    },
    onDestroy() {
        console.info('Application onDestroy')
    }
}
