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
  // Models get retired (Google may still LIST a model that new users can no longer call), so the
  // name is never hard-coded: rank the models this key lists, try them in order, and remember
  // the first that answers.
  async function geminiCandidates(key,signal){
    const j=await http('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200',{signal,headers:{'x-goog-api-key':key}});
    const names=(j.models||[]).filter(m=>(m.supportedGenerationMethods||[]).includes('generateContent')).map(m=>String(m.name).replace(/^models\//,''));
    const score=n=>{
      if(/image|tts|embed|live|audio|vision|robotics|computer|exp|thinking|gemma|learn|dialog|aqa/i.test(n))return -1;
      if(n==='gemini-flash-latest')return 1000;
      if(n==='gemini-flash-lite-latest')return 900;
      const m=/^gemini-(\d+(?:\.\d+)?)-(flash|pro)(-lite)?(-preview.*)?$/.exec(n);
      if(!m)return 0;
      return parseFloat(m[1])*10+(m[2]==='flash'?5:0)+(m[3]?-2:0)+(m[4]?-3:0);
    };
    return names.filter(n=>score(n)>=0).sort((a,b)=>score(b)-score(a)).slice(0,8);
  }
  const retired=m=>/no longer available|not found|NOT_FOUND|not supported|deprecated|is not available|404/i.test(String(m||''));
  const busy=m=>/503|500|overload|high demand|UNAVAILABLE|try again later/i.test(String(m||''));
  const nap=ms=>new Promise(r=>setTimeout(r,ms));
  async function callGemini(key,input,opts,wantJson){
    const turns=typeof input==='string'?[{role:'user',content:input}]:input;
    const contents=turns.map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]}));
    const body={contents,generationConfig:{maxOutputTokens:8192,temperature:0.7}};
    if(wantJson)body.generationConfig.responseMimeType='application/json';
    const send=model=>http('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent',
      {method:'POST',signal:opts&&opts.signal,headers:{'content-type':'application/json','x-goog-api-key':key},body:JSON.stringify(body)});
    let stored='';try{stored=localStorage.getItem('laoshi_gemini_model')||''}catch(e){}
    let j=null,lastErr=null;
    if(stored){
      try{j=await send(stored)}
      catch(e){
        if(e&&e.code==='upstream_error'&&retired(e.message)){try{localStorage.removeItem('laoshi_gemini_model')}catch(x){}lastErr=e}
        else if(e&&e.code==='upstream_error'&&busy(e.message)){lastErr=e}
        else if(e&&e.code==='rate_limited'){lastErr=e}
        else throw e;
      }
    }
    if(!j){
      const cands=await geminiCandidates(key,opts&&opts.signal);
      if(!cands.length)throw {code:'upstream_error',message:'No Gemini text model is available for this key'};
      let busyCount=0,quotaCount=0;
      for(let round=0;round<2&&!j;round++){
        if(round===1){if(!busyCount)break;await nap(3000)}
        const tried=[];
        for(const m of cands){
          try{j=await send(m);try{localStorage.setItem('laoshi_gemini_model',m)}catch(x){}break}
          catch(e){
            tried.push(m);
            if(e&&e.code==='upstream_error'&&retired(e.message)){lastErr=e;continue}
            if(e&&e.code==='upstream_error'&&busy(e.message)){busyCount++;lastErr=e;continue}
            if(e&&e.code==='rate_limited'){quotaCount++;lastErr=e;continue}
            throw e;
          }
        }
      }
      if(!j){
        if(quotaCount&&!busyCount){
          const daily=/PerDay|per day|daily/i.test(String(lastErr&&lastErr.message||''));
          throw {code:'rate_limited',message:(daily?'The free daily limit is used up. It resets once a day, so try again tomorrow, or use the Claude project chat for this. ':'The free per-minute limit is used up. Wait a minute and try again. ')+'('+String(lastErr&&lastErr.message||'').slice(0,120)+')'};
        }
        if(busyCount)throw {code:'rate_limited',message:'The free Google models are busy right now. Try again in a minute. ('+(lastErr&&lastErr.message||'')+')'};
        throw {code:'upstream_error',message:'No listed model accepted the request. Last error: '+(lastErr&&lastErr.message||'')};
      }
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
