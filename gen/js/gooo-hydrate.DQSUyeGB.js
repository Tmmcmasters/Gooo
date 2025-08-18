window.fileRegistry=window.fileRegistry||new Map;const r=(e,t,o)=>{function n(){return o()}const i=n();window.fileRegistry.set(e,{mountPoint:t,hydrate:n,unMount:i.unmount})};export{r as g};
