/* Standalone shim: gives the app the small part of the Claude viewer API it uses,
   so the same single file runs as a normal website / phone app.
   AI is OPTIONAL. Without a key, cards, progress, pacing, the log and backups all work.
   - claude.use('sample')    -> uses YOUR key, kept in this browser only. Two providers, chosen by the key:
        key starting "sk-ant-" -> Anthropic API (paid)
        any other key         -> Google Gemini API (has a free tier, no card needed)
   - claude.use('downloads') -> saves a file through a normal browser download
   - claude.use('db'|'user') -> null, so the app stores everything in this browser (localStorage)
*/
(function(){
  if(window.claude&&window.claude.use)return;
  const KEY='laoshi_api_key';
  const CLAUDE={quick:'claude-haiku-5-5',default:'claude-sonnet-5-5',complex:'claude-opus-5-5'};
  function getKey(){
    let k='';try{k=localStorage.getItem(KEY)||''}catch(e){}
    if(!k){
      k=window.prompt('AI features need a key. Free option: create one at aistudio.google.com (Get API key, no card) and paste it here. It starts with AIza. Leave empty to skip; everything else keeps working. The key stays only in this browser.')||'';
      k=k.trim();
      if(k)try{localStorage.setItem(KEY,k)}catch(e){}
    }
    return k.trim();
  }
  // Anthropic keys start with sk-ant-. Anything else is treated as a Google (Gemini) key, whatever its format.
  const isGemini=k=>!/^sk-ant-/i.test(k);
  async function http(url,init){
    let res;
    try{res=await fetch(url,init)}catch(e){throw {code:(e&&e.name==='AbortError')?'cancelled':'upstream_error',message:'Network error: '+String(e&&e.message||e)}}
    if(res.ok)return res.json();
    let d='';try{const j=await res.json();d=(j&&j.error&&(j.error.message||j.error.status))||JSON.stringify(j).slice(0,200)}catch(e){}
    const bad=res.status===401||res.status===403||(res.status===400&&/api key|API_KEY/i.test(d));
    if(bad){try{localStorage.removeItem(KEY)}catch(e){}throw {code:'not_granted',message:'Key rejected ('+res.status+'): '+d}}
    if(res.status===429)throw {code:'rate_limited',message:'Rate limited: '+d};
    if(res.status===404)throw {code:'upstream_error',message:'Model not found: '+d};
    throw {code:'upstream_error',message:'HTTP '+res.status+': '+d};
  }
  // Pick a current free Gemini model for this key once, then remember it. Models get retired,
  // so the name is looked up instead of hard-coded.
  async function pickGeminiModel(key,signal,force){
    let stored='';try{stored=force?'':(localStorage.getItem('laoshi_gemini_model')||'')}catch(e){}
    if(stored)return stored;
    const j=await http('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200',{signal,headers:{'x-goog-api-key':key}});
    const names=(j.models||[]).filter(m=>(m.supportedGenerationMethods||[]).includes('generateContent')).map(m=>String(m.name).replace(/^models\//,''));
    const score=n=>{
      if(/image|tts|embed|live|audio|vision|robotics|computer|exp|preview|thinking|gemma|learn/i.test(n))return -1;
      const m=/^gemini-(\d+(?:\.\d+)?)-flash(-lite)?$/.exec(n);
      return m?parseFloat(m[1])*10+(m[2]?0:5):0;
    };
    names.sort((a,b)=>score(b)-score(a));
    const pick=names.find(n=>score(n)>0)||names.find(n=>/flash/i.test(n)&&score(n)>=0)||names[0];
    if(!pick)throw {code:'upstream_error',message:'No Gemini model available for this key'};
    try{localStorage.setItem('laoshi_gemini_model',pick)}catch(e){}
    return pick;
  }
  async function callGemini(key,input,opts,wantJson){
    const turns=typeof input==='string'?[{role:'user',content:input}]:input;
    const contents=turns.map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]}));
    const body={contents,generationConfig:{maxOutputTokens:8192,temperature:0.7}};
    if(wantJson)body.generationConfig.responseMimeType='application/json';
    const go=async force=>{
      const model=await pickGeminiModel(key,opts&&opts.signal,force);
      return http('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent',
        {method:'POST',signal:opts&&opts.signal,headers:{'content-type':'application/json','x-goog-api-key':key},body:JSON.stringify(body)});
    };
    let j;
    try{j=await go(false)}
    catch(e){
      if(e&&e.code==='upstream_error'&&/Model not found|not supported|NOT_FOUND/i.test(String(e.message))){
        try{localStorage.removeItem('laoshi_gemini_model')}catch(x){}
        j=await go(true);
      }else throw e;
    }
    const c=(j.candidates||[])[0]||{};
    const text=((c.content&&c.content.parts)||[]).map(p=>p.text||'').join('');
    return {text,truncated:c.finishReason==='MAX_TOKENS'};
  }
  async function callClaude(key,input,opts){
    const messages=typeof input==='string'?[{role:'user',content:input}]:input.map(m=>({role:m.role,content:m.content}));
    const j=await http('https://api.anthropic.com/v1/messages',{method:'POST',signal:opts&&opts.signal,
      headers:{'content-type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:CLAUDE[(opts&&opts.modelTier)||'default']||CLAUDE.default,max_tokens:8000,messages})});
    return {text:(j.content||[]).filter(b=>b.type==='text').map(b=>b.text).join(''),truncated:j.stop_reason==='max_tokens'};
  }
  async function call(input,opts,wantJson){
    const key=getKey();
    if(!key)throw {code:'not_granted',message:'No API key'};
    const r=isGemini(key)?await callGemini(key,input,opts,wantJson):await callClaude(key,input,opts);
    if(!r.text.trim())throw {code:'empty_completion',message:'Empty reply'};
    if(opts&&opts.onText)try{opts.onText({text:r.text,delta:r.text})}catch(e){}
    return {text:r.text,truncated:r.truncated,modelTierApplied:(opts&&opts.modelTier)||'default'};
  }
  function parseJSON(t){
    try{return JSON.parse(t)}catch(e){}
    const f=/```(?:json)?\s*([\s\S]*?)```/.exec(t);if(f)try{return JSON.parse(f[1])}catch(e){}
    const a=t.search(/[\[{]/),b=Math.max(t.lastIndexOf('}'),t.lastIndexOf(']'));
    if(a>=0&&b>a)try{return JSON.parse(t.slice(a,b+1))}catch(e){}
    throw {code:'invalid_json',message:'Reply was not JSON',text:t};
  }
  const sample=(input,opts)=>call(input,opts,false);
  sample.json=async(input,opts)=>parseJSON((await call(input,opts,true)).text);
  sample.needsKey=()=>{try{return !localStorage.getItem(KEY)}catch(e){return true}};
  sample.limits=async()=>({maxPromptBytes:262144});
  const downloads={save:async({filename,data})=>{
    const b=new Blob([data],{type:'application/json'}),a=document.createElement('a');
    a.href=URL.createObjectURL(b);a.download=filename;document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);}};
  window.claude={use:async name=>name==='sample'?sample:name==='downloads'?downloads:null,
    forgetKey:()=>{try{localStorage.removeItem(KEY)}catch(e){}}};
})();
