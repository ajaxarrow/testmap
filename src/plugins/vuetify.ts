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
            color: 'primary',
            class: 'text-none satoshi-md btn-spacing'
        },
        VBtnPrimary: {
            color: 'primary',
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
            color: 'secondary',
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
                    // Environmental Green Palette for CENRO
                    primary: '#2E7D32',        // Forest Green - main actions
                    secondary: '#4CAF50',      // Bright Green - secondary actions
                    tertiary: '#66BB6A',       // Light Green - accents
                    accent: '#81C784',         // Mint Green - highlights
                    success: '#4CAF50',        // Green success
                    warning: '#FF8F00',        // Amber warning
                    error: '#D32F2F',          // Red error
                    info: '#2E7D32',           // Use primary green for info
                    
                    // Nature-inspired background colors
                    background: '#F1F8E9',     // Very light green background
                    surface: '#FFFFFF',        // White surface
                    border: '#C8E6C9',         // Light green border
                    
                    // Gray scale with green undertones
                    gs10: '#1B5E20',           // Dark forest green
                    gs20: '#2E7D32',           // Primary green
                    gs30: '#388E3C',           // Medium green
                    gs40: '#4CAF50',           // Secondary green
                    gs50: '#66BB6A',           // Light green
                    gs60: '#81C784',           // Lighter green
                    gs70: '#A5D6A7',           // Very light green
                    gs80: '#C8E6C9',           // Pale green
                    gs90: '#E8F5E8',           // Almost white green
                    
                    // Environmental surface colors
                    sb10: '#F1F8E9',           // Light green tint
                    sb20: '#E8F5E8',           // Very light green
                    
                    // Nature dark colors (for contrast)
                    bs10: '#0D2818',           // Very dark forest
                    bs20: '#1B5E20',           // Dark forest
                    bs50: '#2E7D32',           // Primary forest green
                    
                    // Environmental specific colors
                    forest: '#1B5E20',         // Deep forest
                    leaf: '#4CAF50',           // Fresh leaf green
                    sage: '#689F38',           // Sage green
                    moss: '#558B2F',           // Moss green
                    earth: '#5D4037',          // Earth brown
                    water: '#0277BD',          // Water blue
                    sky: '#81C784'             // Light sky green
                }
            }
        }
    }
});

export default vuetify