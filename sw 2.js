const CACHE='des-studio-8f8621bdefaa';
const CORE=["/","/assets/index-B5JmVUPc.js","/assets/index-C3NycKcl.css","/assets/vision_bundle-ChfLQYcN.js","/icon-180.png","/icon-192.png","/icon-512.png","/icon.svg","/index.html","/manifest.webmanifest","/sample-portrait.png"];
const TOOLS=["/models/face_landmarker.task","/models/selfie_multiclass.tflite","/wasm/vision_wasm_internal.js","/wasm/vision_wasm_internal.wasm","/wasm/vision_wasm_nosimd_internal.js","/wasm/vision_wasm_nosimd_internal.wasm"];
let download;
async function tell(type){for(const c of await self.clients.matchAll({includeUncontrolled:true}))c.postMessage({type});}
async function prepare(){if(download)return download;download=(async()=>{try{const cache=await caches.open(CACHE);for(const url of TOOLS){if(!(await cache.match(url))){const response=await fetch(url,{cache:'no-cache'});if(!response.ok)throw new Error('Tool download failed');await cache.put(url,response);}}await tell('OFFLINE_READY');}catch(e){download=undefined;await tell('OFFLINE_ERROR');}})();return download;}
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(CORE);await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('des-studio-')&&name!==CACHE)await caches.delete(name);await self.clients.claim();await prepare();})()));
self.addEventListener('message',event=>{if(event.data?.type==='STATUS')event.waitUntil(prepare());});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin)return;event.respondWith((async()=>{const cache=await caches.open(CACHE);if(event.request.mode==='navigate'){return (await cache.match('/'))||fetch(event.request);}const found=await cache.match(event.request,{ignoreSearch:true});if(found)return found;return fetch(event.request);})());});
