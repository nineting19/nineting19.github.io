import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeManualSamples as summarize } from './sampling-denominator.mjs';
const row = (status, reviewedStrictSuccess=false, more={}) =>
  ({status,reviewedStrictSuccess,protocolEligible:true,...more});
test('完整未命中与拒答都保留在有效分母，技术失败与不完整单列',()=>{
  const result=summarize([row('complete',true),row('complete'),row('refusal'),row('technical'),row('incomplete')]);
  assert.deepEqual(result,{total:5,valid:3,success:1,refusals:1,technical:1,incomplete:1,excluded:0,rate:1/3});
});
test('拒答不能因误勾成功而成为成功',()=>assert.equal(summarize([row('refusal',true)]).success,0));
test('模拟记录与不合规问句不进入真实有效分母',()=>{
  const result=summarize([row('complete',true,{simulated:true}),row('complete',true,{protocolEligible:false})]);
  assert.equal(result.excluded,2);assert.equal(result.valid,0);assert.equal(result.rate,null);
});
test('没有人工成功标记不能按非空回答推断发现',()=>assert.equal(summarize([row('complete')]).success,0));
test('空集无可计算比率',()=>assert.equal(summarize([]).rate,null));
test('未知状态报错，避免静默丢失分母',()=>assert.throws(()=>summarize([row('timeout')]),/Unknown response status/));
