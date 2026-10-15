/* Standalone shim: gives the app the small part of the Claude viewer API it uses,
   so the same single file runs as a normal website / phone app.
   - claude.use('sample')    -> calls the Anthropic Messages API with YOUR key (kept in this browser only)
   - claude.use('downloads') -> saves a file through a normal browser download
   - claude.use('db'|'user') -> null, so the app stores everything in this browser (localStorage)
*/
(function(){
  if(window.claude&&window.claude.use)return;
  const KEY='laoshi_api_key';
  const MODELS={quick:'claude-haiku-5-5',default:'claude-sonnet-5-5',complex:'claude-opus-5-5'};
  function getKey(){
    let k='';try{k=localStorage.getItem(KEY)||''}catch(e){}
    if(!k){k=window.prompt('Paste your Anthropic API key. It is stored only in this browser and sent only to api.anthropic.com.')||'';if(k)try{localStorage.setItem(KEY,k.trim())}catch(e){}}
    return k.trim();
  }
  async function call(input,opts){
    const key=getKey();
    if(!key)throw {code:'not_granted',message:'No API key'};
    const messages=typeof input==='string'?[{role:'user',content:input}]:input.map(m=>({role:m.role,content:m.content}));
    let res;
    try{
      res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',signal:opts&&opts.signal,
        headers:{'content-type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
        body:JSON.stringify({model:MODELS[(opts&&opts.modelTier)||'default']||MODELS.default,max_tokens:8000,messages})});
    }catch(e){throw {code:e&&e.name==='AbortError'?'cancelled':'upstream_error',message:String(e)}}
    if(res.status===401||res.status===403){try{localStorage.removeItem(KEY)}catch(e){}throw {code:'not_granted',message:'API key rejected'}}
    if(res.status===429)throw {code:'rate_limited',message:'Rate limited'};
    if(!res.ok)throw {code:'upstream_error',message:'HTTP '+res.status};
    const j=await res.json();
    const text=(j.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('');
    if(!text.trim())throw {code:'empty_completion',message:'Empty reply'};
    if(opts&&opts.onText)try{opts.onText({text,delta:text})}catch(e){}
    return {text,truncated:j.stop_reason==='max_tokens',modelTierApplied:(opts&&opts.modelTier)||'default'};
  }
  function parseJSON(t){
    try{return JSON.parse(t)}catch(e){}
    const f=/```(?:json)?\s*([\s\S]*?)```/.exec(t);if(f)try{return JSON.parse(f[1])}catch(e){}
    const a=t.search(/[\[{]/),b=Math.max(t.lastIndexOf('}'),t.lastIndexOf(']'));
    if(a>=0&&b>a)try{return JSON.parse(t.slice(a,b+1))}catch(e){}
    throw {code:'invalid_json',message:'Reply was not JSON',text:t};
  }
  const sample=(input,opts)=>call(input,opts);
  sample.json=async(input,opts)=>parseJSON((await call(input,opts)).text);
  sample.needsKey=()=>{try{return !localStorage.getItem(KEY)}catch(e){return true}};
  sample.limits=async()=>({maxPromptBytes:262144});
  const downloads={save:async({filename,data})=>{
    const b=new Blob([data],{type:'application/json'}),a=document.createElement('a');
    a.href=URL.createObjectURL(b);a.download=filename;document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);}};
  window.claude={use:async name=>name==='sample'?sample:name==='downloads'?downloads:null,
    forgetKey:()=>{try{localStorage.removeItem(KEY)}catch(e){}}};
})();
