const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const choose=(id,label,opts,extra={})=>({id,label,fmt:DD,opts,req:true,...extra});
const text=(id,label,extra={})=>({id,label,fmt:'여러 줄 입력',req:true,...extra});
const cancel=TYPES[0];
cancel.subs=['취소 요청','반품·교환 접수 지원','기존 취소·반품·교환 변경 또는 철회','구매확정 후 취소·환불','처리 방법·기준 문의'];
cancel.fields=[
 choose('reason','취소 사유',['품절·재고부족','단종·입고지연','가격·쿠폰 오등록','리콜·상품 문제','고객 요청','기타'],{subs:['취소 요청']}),
 choose('scope','취소할 범위',['선택한 주문 전체','주문의 일부 옵션','같은 옵션의 수량 일부','본상품 또는 추가옵션 일부','확인 전'],{subs:['취소 요청']}),
 text('target','취소할 옵션과 수량',{dep:{id:'scope',in:['주문의 일부 옵션','같은 옵션의 수량 일부','본상품 또는 추가옵션 일부']},hint:'예: 주문옵션번호 / 옵션명 / 취소 요청 수량. 요청 내용은 담당자가 처리 가능 여부를 확인합니다.'}),
 text('price','정상 가격과 잘못 적용된 가격·쿠폰',{dep:{id:'reason',in:['가격·쿠폰 오등록']}}),
 text('recall','상품 문제와 요청 내용',{dep:{id:'reason',in:['리콜·상품 문제','기타']}}),
 choose('operation','요청 종류',['반품 접수 지원','교환 접수 지원'],{subs:['반품·교환 접수 지원']}),
 text('change','변경·철회할 내용과 사유',{subs:['기존 취소·반품·교환 변경 또는 철회']}),
 text('claimreason','반품·교환 또는 환불 사유',{subs:['반품·교환 접수 지원','구매확정 후 취소·환불']}),
 text('ord','주문번호 또는 주문옵션번호',{req:true,subs:{not:['처리 방법·기준 문의']},hint:'여러 건이면 한 줄에 하나씩 적어주세요. 일부 옵션 요청은 주문옵션번호를 함께 적어주세요.'}),
 choose('st','현재 주문 상태',['결제완료·배송준비중','송장 등록 후 실제 미출고','실제 출고·배송중','배송완료','구매확정','여러 주문의 상태가 다름','확인 전'],{subs:{not:['처리 방법·기준 문의']}}),
 choose('agr','고객 안내·동의 여부',['안내했고 동의받음','안내했으나 연락되지 않음','안내했으나 의견이 다름','아직 안내 전','여러 주문의 상황이 다름','확인 전'],{subs:{not:['처리 방법·기준 문의']}}),
 choose('col','회수 상태',['회수 전','회수 중','회수 완료','회수 불필요','확인 전'],{subs:['반품·교환 접수 지원','구매확정 후 취소·환불']}),
 choose('fault','파트너님이 파악한 귀책',['구매자','파트너','고객과 의견이 다름','확인 전'],{subs:['반품·교환 접수 지원','구매확정 후 취소·환불']}),
];
const shipping=TYPES[1];
shipping.fields.push(text('carrier','택배사',{fmt:'한 줄 입력',subs:['송장 등록·수정']}),text('newtracking','등록·변경할 송장번호',{fmt:'한 줄 입력',subs:['송장 등록·수정'],hint:'여러 건은 주문옵션별 목록을 첨부하고 “첨부파일 참고”로 적어주세요.'}),text('oldtracking','기존 송장번호',{fmt:'한 줄 입력',req:false,subs:['송장 등록·수정']}));
for(const t of TYPES){
 t.fields=t.fields.filter(f=>!f.fmt.includes('첨부'));
 for(const f of t.fields){
  if(f.id==='ord'){ f.needsIdentifier=f.req; f.req=false; }
  if(['st','real','agr','fault'].includes(f.id)&&f.opts&&!f.opts.some(o=>/모름|확인 전/.test(o)))f.opts.push('확인 전');
  if(f.id==='cp'){f.req=false;f.hint='발행 전이거나 번호를 모르면 비워두셔도 됩니다.'}
  if(f.id==='sol'){f.label='연동 방식·솔루션명과 문제 상황';f.hint='직접 API를 연동했다면 “직접 연동”으로 적어주세요. 솔루션 측 답변은 있을 때만 적어주세요.'}
  if(f.label==='귀책')f.label='파트너님이 파악한 귀책';
  if(f.label==='구매확정일 또는 귀속월'){f.fmt='한 줄 입력';f.hint='예: 2026-11 또는 2026-11-10'}
 }
}
const names=['취소·교환·반품','주문·배송','상품관리','판매활동 관리','리뷰·상품문의','광고·프로모션','정산','전산·상품노출','기타'];
let selected=-1,sub='',vals={},files=[],drafts={};
function show(f,seen=new Set()){
 if(sub==='잘 모르겠어요')return false;
 if(seen.has(f.id))return false;seen.add(f.id);
 if(f.dep){const p=TYPES[selected].fields.find(x=>x.id===f.dep.id);return !!p&&show(p,seen)&&f.dep.in.includes(vals[p.id]);}
 if(f.dep2&&f.dep2.in.includes(vals[f.dep2.id])&&sub==='상품문의 답변 수정·삭제')return true;
 if(!f.subs)return true;return Array.isArray(f.subs)?f.subs.includes(sub):!f.subs.not.includes(sub);
}
function required(f){return typeof f.req==='object'?!f.req.except.includes(sub):!!f.req}
function activeFields(){return selected<0||(!sub&&TYPES[selected].subs.length)?[]:TYPES[selected].fields.filter(f=>show(f))}
function bodyRequired(i,s){return i===8||s==='잘 모르겠어요'||/방법|기준|정산 일정|수수료|세금계산서|상품광고|기획전|브랜드홈|담당 MD/.test(s)}
function needsBody(){return bodyRequired(selected,sub)}
function field(f){const v=vals[f.id]??'';let control;const id='field-'+f.id;
 const attrs=`id="${id}" data-field="${f.id}" ${required(f)?'required':''}`;
 if(f.fmt===DD)control=`<select ${attrs}><option value="">선택해 주세요</option>${f.opts.map(o=>`<option value="${esc(o)}" ${v===o?'selected':''}>${esc(o)}</option>`).join('')}</select>`;
 else if(f.fmt==='체크박스')control=(f.opts||[f.label]).map(o=>`<label class="check"><input type="checkbox" id="field-${f.id}" data-field="${f.id}" value="${esc(o)}" ${(Array.isArray(v)?v:[]).includes(o)?'checked':''}>${esc(o)}</label>`).join('');
 else if(f.fmt==='여러 줄 입력')control=`<textarea ${attrs} rows="3">${esc(v)}</textarea>`;
 else control=`<input ${attrs} type="${({'날짜':'date','이메일':'email','전화번호':'tel','URL':'url','정수':'number'})[f.fmt]||'text'}" ${f.fmt==='정수'?'min="1" step="1"':''} value="${esc(v)}">`;
 return `<div class="field"><label for="${id}">${esc(f.label)} ${required(f)?'*':'<small>선택</small>'}</label>${control}${f.hint?`<p class="help">${esc(f.hint)}</p>`:''}</div>`;
}
function renderFields(){
 const fs=activeFields();$('#fields').innerHTML=fs.map(field).join('');
 const order=fs.find(f=>f.id==='ord');
 if(order){$('#fields').insertAdjacentHTML('beforeend','<div class="field"><label class="check"><input type="checkbox" id="unknownOrder" '+(vals.unknownOrder?'checked':'')+'>주문번호 확인이 어려워 상담원의 도움이 필요해요</label></div>');}
 $('#bodyLabel').innerHTML=needsBody()?'문의 내용 *':'추가로 전달할 내용 <small>선택</small>';
 $('#body').required=needsBody();$('#body').placeholder=needsBody()?'궁금한 점이나 요청하시는 내용을 알려주세요.':'이미 적은 내용은 다시 쓰지 않으셔도 됩니다.';
 $('#fileHint').textContent='선택';
 $('#detailsSection').hidden=selected<0||(!sub&&TYPES[selected].subs.length>0);
 renderLiveSpec();
}
function selectType(i){
 if(selected>=0)drafts[selected]={sub,vals,body:$('#body').value};
 selected=i;$('#categorySelect').value=String(i);const d=drafts[i]||{sub:'',vals:{},body:''};sub=d.sub;vals=d.vals;$('#body').value=d.body;
 $('#categories').innerHTML=names.map((n,j)=>`<button type="button" class="category ${j===i?'active':''}" data-category="${j}" aria-pressed="${j===i}">${n}</button>`).join('');
 $('#requests').innerHTML=TYPES[i].subs.length?`<div class="field"><label for="request">무엇을 요청하시나요? *</label><select id="request"><option value="">선택해 주세요</option>${[...TYPES[i].subs,'잘 모르겠어요'].map(s=>`<option ${sub===s?'selected':''}>${esc(s)}</option>`).join('')}</select></div>`:'<p class="notice">분류하기 어려운 문의도 괜찮아요. 아래에 내용을 남겨주세요.</p>';
 renderFields();$('#error').textContent='';
}
$('#categories').innerHTML=names.map((n,i)=>`<button type="button" class="category" data-category="${i}" aria-pressed="false">${n}</button>`).join('');
$('#categories').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(b)selectType(+b.dataset.category)});
$('#requests').addEventListener('change',e=>{sub=e.target.value;renderFields();$('#error').textContent=''});
$('#fields').addEventListener('input',e=>{const id=e.target.dataset.field;if(id){if(e.target.type==='checkbox')vals[id]=[...$('#fields').querySelectorAll(`[data-field="${id}"]:checked`)].map(x=>x.value);else vals[id]=e.target.value;}if(e.target.id==='unknownOrder')vals.unknownOrder=e.target.checked;});
$('#fields').addEventListener('change',e=>{if(e.target.tagName==='SELECT'){const id=e.target.dataset.field;renderFields();$('#field-'+id)?.focus();}});
function renderFiles(){$('#fileList').innerHTML=files.map((f,i)=>`<li><span>${esc(f.name)} · ${Math.ceil(f.size/1024)}KB</span><button type="button" data-remove="${i}" aria-label="${esc(f.name)} 삭제">삭제</button></li>`).join('')}
$('#attachments').addEventListener('change',e=>{let warnings=[];for(const f of e.target.files){if(!/\.(xlsx?|csv|pdf|png|jpe?g|webp|mp4|mov)$/i.test(f.name)){warnings.push('지원하지 않는 파일 형식입니다.');continue;}if(f.size>10*1024*1024){warnings.push('파일당 10MB 이하로 첨부해 주세요.');continue;}if(files.length>=5){warnings.push('최대 5개까지 첨부할 수 있습니다.');break;}if(!files.some(x=>x.name===f.name&&x.size===f.size))files.push(f);}e.target.value='';renderFiles();$('#error').textContent=warnings.join(' ')});
$('#fileList').addEventListener('click',e=>{if(e.target.dataset.remove!==undefined){files.splice(+e.target.dataset.remove,1);renderFiles()}});
$('#form').addEventListener('submit',e=>{e.preventDefault();$('#error').textContent='';
 const fail=(msg,el)=>{$('#error').textContent=msg;el?.focus();};
 if(selected<0)return fail('문의 유형을 선택해 주세요.',$('[data-category]'));
 if(TYPES[selected].subs.length&&!sub)return fail('요청하시는 내용을 선택해 주세요.',$('#request'));
 const fs=activeFields();let invalid;
 for(const f of fs){const v=vals[f.id];const el=$('#field-'+f.id);if(required(f)&&(!v||(typeof v==='string'&&!v.trim())||(Array.isArray(v)&&!v.length))){invalid=el;break;}if(el&&!el.checkValidity()){invalid=el;break;}}
 if(invalid)return fail('필수 항목 또는 입력 형식을 확인해 주세요.',invalid);
 if(fs.some(f=>f.id==='ord'&&(typeof f.needsIdentifier==='object'?!f.needsIdentifier.except.includes(sub):f.needsIdentifier))&&!String(vals.ord||'').trim()&&!files.some(f=>/\.(xlsx?|csv|pdf)$/i.test(f.name))&&!vals.unknownOrder)return fail('주문번호를 입력하거나 목록 파일을 첨부해 주세요. 확인이 어렵다면 도움 요청을 선택해 주세요.',$('#field-ord'));
 if(needsBody()&&!$('#body').value.trim())return fail('문의 내용을 작성해 주세요.',$('#body'));
 for(const id of ['email','phone']){const el=$('#'+id);if(!el.checkValidity()||(id==='phone'&&!/^[\d+()\-\s]{7,20}$/.test(el.value)))return fail('연락처를 확인해 주세요.',el);}
 const lines=[`제목: ${$('#title').value.trim()||names[selected]+' · '+(sub||'기타')}`,`문의 유형: ${names[selected]}`,`요청 내용: ${sub||'기타'}`,'',...fs.map(f=>`${f.label}: ${Array.isArray(vals[f.id])?vals[f.id].join(', '):vals[f.id]||'미입력'}`)];
 if(fs.some(f=>f.id==='ord')&&vals.unknownOrder)lines.push('주문번호 확인: 상담원 도움 요청');
 if($('#body').value.trim())lines.push('',`추가 내용: ${$('#body').value.trim()}`);
 lines.push('',`첨부: ${files.map(f=>f.name).join(', ')||'없음'}`,'샵: 샘플 리빙 스토어',`회신 이메일: ${$('#email').value}`,`연락처: ${$('#phone').value}`);
 $('#preview').textContent=lines.join('\n');$('#success').textContent='';$('#submitDemo').disabled=false;$('#confirm').showModal();
});
$('#closeDialog').onclick=$('#back').onclick=()=>$('#confirm').close();
$('#submitDemo').onclick=()=>{$('#success').textContent='접수 체험을 완료했습니다. 실제 문의·파일은 전송되지 않았습니다.';$('#submitDemo').disabled=true;};

function condition(f,t){
 if(f.dep){const parent=t.fields.find(p=>p.id===f.dep.id);return `${condition(parent,t)} → 「${parent.label}」 = ${f.dep.in.join(' / ')}`;}
 let base=!f.subs?'요청 구분 전체 (잘 모르겠어요 제외)':Array.isArray(f.subs)?f.subs.join(' / '):`요청 구분 중 ${f.subs.not.join(' / ')} 제외`;
 if(f.dep2){const parent=t.fields.find(p=>p.id===f.dep2.id);base+=` 또는 상품문의 답변 수정·삭제 → 「${parent.label}」 = ${f.dep2.in.join(' / ')}`;}
 return base;
}
function requirement(f){
 if(f.needsIdentifier)return typeof f.needsIdentifier==='object'?`대체 가능 · ${f.needsIdentifier.except.join(' / ')}에서는 선택`:'대체 가능';
 return typeof f.req==='object'?`${f.req.except.join(' / ')}에서는 선택, 나머지 필수`:f.req?'필수':'선택';
}
function specTable(rows){return `<div class="table-scroll"><table class="spec-table"><thead><tr><th>항목</th><th>입력 형식</th><th>필수 여부</th><th>표시 조건·선택지</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>`;}
function row(label,format,req,detail,on){return `<tr class="${on===false?'inactive':''}"><td>${esc(label)}${on===true?'<span class="pill">현재 표시</span>':''}</td><td>${esc(format)}</td><td>${esc(req)}</td><td>${detail}</td></tr>`;}
function fieldRow(f,t,on){return row(f.label,f.fmt,requirement(f),`<div>${esc(condition(f,t))}</div>${f.opts?`<div class="option-list">${f.opts.map(o=>`<span>${esc(o)}</span>`).join('')}</div>`:''}${f.hint?`<p class="help">${esc(f.hint)}</p>`:''}${f.needsIdentifier?'<p class="help">번호 입력 / 주문 목록 파일(XLS·XLSX·CSV·PDF) 첨부 / 확인 어려움 체크 중 하나를 충족하면 접수 가능</p>':''}`,on);}
function renderLiveSpec(){
 if(selected<0)return;
 const t=TYPES[selected];$('#specPath').textContent=`${names[selected]}${sub?' › '+sub:''}`;
 const fs=activeFields();const ids=new Set(fs.map(f=>f.id));
 let rows=t.fields.map(f=>fieldRow(f,t,ids.has(f.id)));
 if(!sub&&t.subs.length){$('#liveSpec').innerHTML='<div class="notice">요청 구분을 선택하면 현재 표시되는 항목을 강조합니다.</div>'+specTable(rows);return;}
 if(fs.some(f=>f.id==='ord'))rows.push(row('주문번호 확인이 어려움','체크박스','선택','주문번호 입력란이 표시될 때. 체크하면 번호·목록 첨부 없이 접수 가능',true));
 rows.push(row(needsBody()?'문의 내용':'추가로 전달할 내용','여러 줄 입력',needsBody()?'필수':'선택','선택한 요청의 본문 규칙 적용',true));
 rows.push(row('파일 첨부','파일 · 다중','선택','XLS / XLSX / CSV / PDF / PNG / JPG / JPEG / WEBP / MP4 / MOV. 목업 기준 10MB/파일, 최대 5개',true));
 $('#liveSpec').innerHTML=specTable(rows)+'<p class="help">옅은 행은 현재 숨겨진 항목입니다. 숨겨진 항목은 제출 내용과 필수 검증에서 제외합니다.</p>';
}
function renderDocumentation(){
 $('#commonSpec').innerHTML=specTable([
 row('문의 유형','단일 선택','필수',names.map(esc).join(' / ')),
 row('요청 구분','단일 선택','필수','기타를 제외한 유형에서 노출. 모든 목록 마지막에 ‘잘 모르겠어요’ 제공'),
 row('유형별 입력','항목별','항목별','아래 정의에 따라 조건부 표시. 선택 변경 시 작성값은 화면 내에서 보관하되 숨겨진 값은 제출하지 않음'),
 row('문의 내용 / 추가 설명','여러 줄 입력','조건부','기타·잘 모르겠어요·아래 유형별 지정 요청은 필수. 나머지는 선택'),
 row('제목','한 줄 입력','선택','기존 화면의 제목 입력란 유지. 미입력 시 목업 미리보기에서는 문의 유형 + 요청 구분을 사용하며 실제 기본 제목 처리는 개발 협의'),
 row('파일 첨부','파일 · 다중','선택 / 번호 대체','XLS·XLSX·CSV·PDF·PNG·JPG·JPEG·WEBP·MP4·MOV. 목업 기준 파일당 10MB, 최대 5개. 실제 허용 범위·제한은 AICX 확정 필요'),
 row('샵 정보','자동 표시','자동','샵 식별값은 로그인 정보로 연결. 목업은 가상 샵 정보'),
 row('회신 이메일 / 연락처','이메일 / 전화번호','필수','자동 채움 + 수정 가능. 목업은 예시 기본값'),
 row('확인 → 접수 체험','미리보기','—','노출 중인 항목·추가 설명·첨부 파일명·연락처만 미리보기. 실제 서버 전송 없음')
 ])+'<div class="rules"><p><b>단일·다중 선택:</b> 문의 유형·요청 구분·일반 드롭다운은 단일 선택. 체크박스 목록만 복수 선택.</p><p><b>모름 경로:</b> ‘잘 모르겠어요’는 유형별 항목을 숨기고 본문을 필수로 전환. 식별정보 확인이 어려운 처리 요청도 도움 요청 체크 후 접수 가능.</p><p><b>입력 유지:</b> 유형·요청 구분을 바꾸어도 작성값을 세션 내 보관. 새로고침하면 초기화하며 서버·로컬 저장소에 저장하지 않음. 공통 첨부와 연락처는 유형 변경 시 유지.</p><p><b>본문 전달:</b> 문의 유형 → 요청 구분 → 표시 항목명/값 → 추가 내용 → 첨부 → 샵·연락처 순서. 별도 필터·태그 연동은 이 목업 범위에 없음.</p></div>';
 $('#allSpecs').innerHTML=TYPES.map((t,i)=>{
 const bodySubs=t.subs.filter(s=>bodyRequired(i,s));
 return `<article class="type-spec" id="spec-type-${i}"><div class="type-spec-head"><h3>${i+1}. ${esc(names[i])}</h3><button type="button" data-jump="${i}">화면에서 보기 ↑</button></div>${specTable([
 ...(t.subs.length?[row('요청 구분','단일 선택','필수',`<div class="option-list">${[...t.subs,'잘 모르겠어요'].map(o=>`<span>${esc(o)}</span>`).join('')}</div>`)]:[]),
 ...t.fields.map(f=>fieldRow(f,t)),
 ...(t.fields.some(f=>f.id==='ord')?[row('주문번호 확인이 어려움','체크박스','선택','주문번호 입력란 표시 시 함께 노출. 체크하면 주문번호·목록 파일 없이 접수 가능')]:[]),
 row('공통 본문','여러 줄 입력',i===8?'필수':'조건부',i===8?'항상 필수':`필수: ${[...bodySubs,'잘 모르겠어요'].map(esc).join(' / ')}<br>그 외: 추가로 전달할 내용 (선택)`)
 ])}</article>`;
 }).join('');
}
$('#allSpecs').addEventListener('click',e=>{const b=e.target.closest('[data-jump]');if(b){selectType(+b.dataset.jump);$('#form').scrollIntoView({behavior:'smooth',block:'start'});}});
$('#categorySelect').innerHTML='<option value="">문의 유형 선택</option>'+names.map((n,i)=>`<option value="${i}">${esc(n)}</option>`).join('');
$('#categorySelect').addEventListener('change',e=>{if(e.target.value!=='')selectType(+e.target.value);else resetPreview();});
function resetPreview(){selected=-1;sub='';vals={};files=[];drafts={};$('#form').reset();$('#requests').innerHTML='';$('#fields').innerHTML='';$('#detailsSection').hidden=true;$('#bodyLabel').textContent='문의 내용';$('#body').required=false;$('#error').textContent='';$('#specPath').textContent='문의 유형을 선택해 주세요.';$('#liveSpec').innerHTML='';renderFiles();}
$('#resetForm').onclick=$('#resetTop').onclick=()=>{if(!$('#body').value&&!$('#title').value&&!Object.keys(vals).length&&!files.length||window.confirm('작성 중인 내용을 지우고 처음으로 돌아갈까요?'))resetPreview();};
renderDocumentation();
