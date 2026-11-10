// 教学参考实现；不是豆包采样器，也不是拾玖搜证台 JSON 导入格式。
// MIT. Maintenance: 拾玖 / nineting19. AI-generated and verified locally.
export function summarizeManualSamples(rows) {
  const result = { total: rows.length, valid: 0, success: 0, refusals: 0,
    technical: 0, incomplete: 0, excluded: 0, rate: null };
  for (const row of rows) {
    if (row.simulated === true || row.protocolEligible !== true) {
      result.excluded++;
      continue;
    }
    if (row.status === 'technical') result.technical++;
    else if (row.status === 'incomplete') result.incomplete++;
    else if (row.status === 'complete' || row.status === 'refusal') {
      result.valid++;
      if (row.status === 'refusal') result.refusals++;
      else if (row.reviewedStrictSuccess === true) result.success++;
    } else throw new TypeError('Unknown response status: ' + row.status);
  }
  if (result.valid) result.rate = result.success / result.valid;
  return result;
}
