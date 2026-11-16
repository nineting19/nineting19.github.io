#!/usr/bin/env node
'use strict';
// MIT License, Copyright (c) 2026 nineting19. Local file checks only; no network.
const fs = require('node:fs');
const HEADERS = ['记录编号','实际观察时间及时区','平台及入口','可见模式','账号条件','记忆状态及依据','问题编号','路径','原始问句','回答状态','完整回答或文件名','是否提及目标','是否实际推荐目标','当次来源网址','来源支持核对','工具或官网入口检查','截图文件名','备注'];
const MAX_BYTES = 10 * 1024 * 1024;
function parseCSV(input) {
  const text = input.replace(/^\uFEFF/, '');
  const rows = []; let row = [], cell = '', quoted = false, closed = false, line = 1, rowLine = 1;
  const pushCell = () => { row.push(cell); cell = ''; closed = false; };
  const pushRow = () => { pushCell(); rows.push({line: rowLine, cells: row}); row = []; rowLine = line + 1; };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i+1] === '"') { cell += '"'; i++; } else { quoted = false; closed = true; }
      } else { cell += c; if (c === '\n') line++; }
    } else if (c === ',') { pushCell();
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i+1] === '\n') i++;
      pushRow(); line++;
    } else if (c === '"' && cell === '' && !closed) { quoted = true;
    } else {
      if (closed || c === '"') throw new Error('CSV引号格式错误，物理行 ' + line);
      cell += c;
    }
  }
  if (quoted) throw new Error('CSV引号未闭合，起始物理行 ' + rowLine);
  if (row.length || cell !== '' || closed) { pushCell(); rows.push({line: rowLine, cells: row}); }
  return rows;
}
function validTimestamp(text) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/.exec(text);
  if (!m) return false;
  const y=+m[1], mo=+m[2], d=+m[3], h=+m[4], mi=+m[5], s=+m[6];
  if (mo<1 || mo>12 || d<1 || d>new Date(Date.UTC(y,mo,0)).getUTCDate() || h>23 || mi>59 || s>59) return false;
  if (m[7] !== 'Z') {
    const [oh, om] = m[7].slice(1).split(':').map(Number);
    if (oh>14 || om>59 || (oh===14 && om!==0)) return false;
  }
  return Number.isFinite(Date.parse(text));
}
function checkCSV(input) {
  const out = {format:'brand-evidence-18-column-v1', dataRows:0, completedRows:0, errors:[], warnings:[], checksAreNotTruthVerification:true};
  const add = (type,line,column,code) => out[type].push({line,column,code});
  let rows;
  try { rows = parseCSV(input); } catch (e) { out.errors.push({code:'CSV_SYNTAX',message:e.message}); return out; }
  if (!rows.length || rows[0].cells.length!==HEADERS.length || HEADERS.some((h,i)=>rows[0].cells[i]!==h)) {
    out.errors.push({line:1,code:'EXPECTED_EXACT_18_HEADERS'}); return out;
  }
  const ids = new Set();
  for (const {line,cells} of rows.slice(1)) {
    if (cells.every(x=>x.trim()==='')) { add('warnings',line,null,'EMPTY_ROW_SKIPPED'); continue; }
    out.dataRows++;
    if (cells.length!==HEADERS.length) { add('errors',line,null,'WRONG_COLUMN_COUNT'); continue; }
    const values=cells.map(x=>x.trim()), get=h=>values[HEADERS.indexOf(h)];
    for (const col of ['记录编号','实际观察时间及时区','平台及入口','问题编号','路径','原始问句','回答状态']) {
      if (!get(col)) add('errors',line,col,'REQUIRED_FIELD_EMPTY');
    }
    if (get('记录编号')) {
      if (ids.has(get('记录编号'))) add('errors',line,'记录编号','DUPLICATE_ID');
      ids.add(get('记录编号'));
    }
    if (get('实际观察时间及时区') && !validTimestamp(get('实际观察时间及时区'))) add('errors',line,'实际观察时间及时区','USE_ISO_TIME_WITH_ZONE');
    if (!['名称发现','需求推荐','网址读取'].includes(get('路径'))) add('warnings',line,'路径','UNRECOGNIZED_PATH_KEEP_SEPARATE');
    const state=get('回答状态');
    if (state==='完成') {
      out.completedRows++;
      if (!get('完整回答或文件名')) add('errors',line,'完整回答或文件名','COMPLETE_WITHOUT_ANSWER_REFERENCE');
      for (const col of ['可见模式','账号条件','记忆状态及依据','是否提及目标','是否实际推荐目标']) {
        if (!get(col)) add('warnings',line,col,'MISSING_REVIEW_CONDITION');
      }
    } else if (!['拒答','登录阻断','验证阻断','技术失败','未发送'].includes(state)) add('warnings',line,'回答状态','UNRECOGNIZED_STATUS_KEEP_SEPARATE');
    const recommended=get('是否实际推荐目标');
    if (recommended==='是') {
      if (get('是否提及目标')==='否') add('errors',line,'是否实际推荐目标','RECOMMENDED_BUT_NOT_MENTIONED');
      if (state!=='完成') add('warnings',line,'是否实际推荐目标','RECOMMENDATION_ON_NONCOMPLETE_ROW');
      if (!get('当次来源网址')) add('warnings',line,'当次来源网址','RECOMMENDATION_WITHOUT_SOURCE_RECORDED');
      if (!get('来源支持核对')) add('warnings',line,'来源支持核对','SOURCE_SUPPORT_REVIEW_MISSING');
      if (!get('工具或官网入口检查')) add('warnings',line,'工具或官网入口检查','DESTINATION_REVIEW_MISSING');
    }
    for (const col of ['是否提及目标','是否实际推荐目标']) {
      if (get(col) && !['是','否','未核实','不适用'].includes(get(col))) add('warnings',line,col,'USE_YES_NO_UNVERIFIED_OR_NA');
    }
    for (const col of ['账号条件','记忆状态及依据','当次来源网址','来源支持核对','工具或官网入口检查','截图文件名']) {
      if (!get(col)) add('warnings',line,col,'RECORD_GAP_REVIEW_MANUALLY');
    }
    HEADERS.forEach((col,i)=>{if (/^[\s\uFEFF]*[=+@-]/u.test(cells[i])) add('warnings',line,col,'SPREADSHEET_FORMULA_PREFIX_REVIEW');});
  }
  if (!out.dataRows) out.warnings.push({code:'NO_DATA_ROWS_BLANK_TEMPLATE_IS_NOT_A_TEST'});
  return out;
}
if (require.main===module) {
  const args=process.argv.slice(2);
  if (args.length!==1 || args[0]==='--help') {
    console.log('用法：node check-brand-evidence.cjs "你的人工记录.csv"\n只读本地文件，输出JSON；退出码0=格式检查无错误，1=格式错误，2=使用/读取失败。警告和人工核对另看。');
    process.exitCode=args[0]==='--help'?0:2;
  } else {
    try {
      if (fs.statSync(args[0]).size>MAX_BYTES) throw Error('文件超过10 MiB，请先分批检查；这是此脚本限制。');
      const bytes=fs.readFileSync(args[0]);
      const input=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
      const result=checkCSV(input); console.log(JSON.stringify(result,null,2)); process.exitCode=result.errors.length?1:0;
    } catch(e) { console.error(JSON.stringify({code:'INPUT_READ_FAILED',message:e.message})); process.exitCode=2; }
  }
}
module.exports={HEADERS,parseCSV,checkCSV,validTimestamp};
