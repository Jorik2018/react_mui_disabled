/*import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
*/


import { defineConfig , loadEnv} from 'vite'
import react from '@vitejs/plugin-react'



export default ({ mode }) => {


  let VITE_APP_VERSION = require('./package.json').version;
  var d=new Date();
  function de(v){return v.length < 2?('0'+v):v};
  
  let VITE_APP_BUILT_ON = 
  [d.getFullYear(), '' + de(''+(d.getMonth() + 1)), de('' + d.getDate())].join('-')+' '+
  [de(''+d.getHours()), de(''+d.getMinutes()), de(''+d.getSeconds())].join(':');

  process.env = {...process.env,VITE_APP_BUILT_ON,VITE_APP_VERSION, ...loadEnv(mode, process.cwd())};
  return defineConfig({
    plugins: [react()],
    base:process.env.VITE_BASE/*,
    server: {
      fs: {
        allow: ["D:/projects/nodejs/gra-utils","D:/projects/nodejs/react/react-ionic-pide"]
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    }*/
  })
}