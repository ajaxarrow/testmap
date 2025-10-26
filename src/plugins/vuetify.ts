import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
// import colors from 'vuetify/lib/util/colors'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'


const vuetify = createVuetify({
    components,
    directives,
    aliases: {
        VBtnPrimary: components.VBtn,
        VBtnPrimaryPlain: components.VBtn,
        VBtnAuth: components.VBtn,
        VBtnPrimaryFilled: components.VBtn,
        VBtnPrimaryAlt: components.VBtn
    },
    defaults: {
        VBtnPrimaryFilled: {
            color: 'bs50',
            class: 'text-none satoshi-md btn-spacing'
        },
        VBtnPrimary: {
            color: 'bs50',
            rounded: true,
            height: "44",
            class: 'text-none satoshi-md mx-2',
            width: '130'
        },
        VBtnPrimaryPlain: {
            rounded: true,
            height: "44",
            class: 'text-none satoshi-md mx-2',
            width: '130'
        },
        VBtnPrimaryAlt: {
            color: 'bs50',
            height: "44",
            class: 'text-none satoshi-md mx-1',
        },

        VBtnAuth: {
            variant: "outlined",
            rounded: true,
            height: "50",
            class: 'text-none satoshi-md mx-2',
            width: "280"
        }

    },
    theme: {
        themes: {
            light: {
                dark: false,
                colors: {
                    primary: '#3291C7',
                    secondary: '#32C8B4',
                    warning: '#C83246',
                    border: '#E5ECF6',
                    background: '#F0F5F9',
                    gs10: '#191919',
                    gs20: '#5F6061',
                    gs30: '#5E5E5E',
                    gs40: '#8C8C8C',
                    gs50: '#BABABA',
                    gs60: '#191919',
                    gs70: '#E4E4E4',
                    gs80: '#EEEEEE',
                    gs90: '#fafafa',
                    sb10: '#F8FDFF',
                    sb20: '#EBF4F9',
                    bs10: '#050E14',
                    bs20: '#0A1D28',
                    bs50: '#23668B'
                }
            }
        }
    }
});

export default vuetify