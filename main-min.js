const splitTemplate=(e,t,n)=>`\n        <div class="split" onClick="onRecordStart(${n})">\n          <div class="index">#${e+1}</div>\n          <span class="tile">${t}</span>\n          <a>Continue</a>\n        </div>\n      `,formatNumber=(e,t=2)=>`00000000${e}`.slice(-t),isNumeric=e=>"string"!=typeof e?"number"==typeof e:!isNaN(e)&&!isNaN(parseFloat(e)),getSeconds=e=>{let t=0;const n=e.match(/(\d+)\s*d/),a=e.match(/(\d+)\s*h/),r=e.match(/(\d+)\s*m/),l=e.match(/(\d+)\s*s/);return n&&(t+=86400*parseInt(n[1])),a&&(t+=3600*parseInt(a[1])),r&&(t+=60*parseInt(r[1])),l&&(t+=parseInt(l[1])),t};let isRunning=!1,delta=0,_previous=0,splits=[],_total=6e4,_newTotal=6e4;const _time=document.querySelector("#time"),_reset=document.querySelector("#reset"),_start=document.querySelector("#start"),_input=document.querySelector("#input"),_splits=document.querySelector("#splits"),_handleToggle=()=>{isRunning=!isRunning,isRunning?_handleStart():_total=_newTotal},onRecordStart=e=>{_total=e,delta=0,isRunning=!0,_handleStart()},_handleSaveCurrent=()=>{const e=JSON.parse(localStorage.getItem("@records")||"[]");e.unshift(_total-delta),localStorage.setItem("@records",JSON.stringify(e.slice(0,10))),_handleRecordUIUpdate()},_handleReset=()=>{isRunning=!1,_handleSaveCurrent(),requestAnimationFrame((()=>{let e=getSeconds(_input.value);isNumeric(_input.value)&&(e=60*_input.value),_total=1e3*e,delta=0,_handleRecordUIUpdate(),_handleUiPrint()}))},_handleStart=()=>{_previous=window.performance.now(),_handlePoll()},_handlePoll=()=>{isRunning&&requestAnimationFrame(_handlePoll),_start.children[0].innerText=isRunning?"Pause":"Start",_start.className=isRunning?"start running":"start regular";const e=window.performance.now();delta+=e-_previous,_previous=e,_handleUiUpdate()},_getTimeFormat=e=>{const t=e/1e3,n=t/60,a=n/60;return`${formatNumber(Math.floor(a))}:${formatNumber(Math.floor(n%60))}:${formatNumber(Math.floor(t%60))}`},_handleAddSplit=()=>{splits.unshift(delta),_handleUiUpdate()};let _lastUpdate;const _handleUiUpdate=()=>{const e=Date.now();_lastUpdate+20>e||(_time.innerText=_getTimeFormat(_total-delta),_lastUpdate=e)},_handleUiPrint=e=>{_time.innerText=_getTimeFormat(_total)},_handleRecordUIUpdate=()=>{const e=[...JSON.parse(localStorage.getItem("@records")||"[]")];_splits.innerHTML=e.map(((e,t)=>splitTemplate(t,_getTimeFormat(e||0),e))).join("")},_handleChange=e=>{let t=getSeconds(e.target.value);isNumeric(e.target.value)&&(t=60*e.target.value),_newTotal=1e3*t,isRunning||(_total=1e3*t),_handleUiUpdate()};_handleRecordUIUpdate(),_handleUiUpdate(),_start.addEventListener("click",_handleToggle),_reset.addEventListener("click",_handleReset),_input.addEventListener("input",_handleChange);