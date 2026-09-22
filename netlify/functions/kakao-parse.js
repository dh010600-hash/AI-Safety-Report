var lib = require("./_lib");

var STANDARD_TRADES = ["직  원 / 직  영", "전기/ESS", "기계설비", "수  장", "도  장", "토  목"];

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") return lib.jsonResponse(405, { error: "Method Not Allowed" });
  var apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return lib.jsonResponse(500, { error: "ANTHROPIC_API_KEY가 설정되어 있지 않습니다." });

  try {
    var body = JSON.parse(event.body || "{}");
    var text = (body.text || "").trim();
    if (!text) return lib.jsonResponse(400, { error: "text가 필요합니다." });

    var prompt =
      "건설 현장 카카오톡 단체방에 올라오는 공종별 예정작업사항 메시지다. 각 팀/공정을 아래 표준 공종명 중 " +
      "가장 가까운 것으로 맞추고(표준 공종명과 무관한 새 팀/회사명이면 원문 그대로 사용): " +
      STANDARD_TRADES.join(", ") + ". " +
      '"직원"과 "직영" 메시지는 둘 다 "' + STANDARD_TRADES[0] + '" 하나로 합쳐서 인원을 더해라. ' +
      '"총인원"/"총 인원" 같은 합계 줄은 중복이므로 인원 집계에서 제외해라. ' +
      '작업내용이 "없음"/"작업없음"이면 빈 문자열로 둬라.\n\n' +
      'JSON 배열만 출력해라 (다른 설명 없이): [{"name":"공종명","count":숫자,"work":"작업내용 요약(콤마로 구분)"}]\n\n' +
      text;

    var raw = await lib.callClaude({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }]
    }, apiKey);

    var items = lib.extractJson(raw);
    return lib.jsonResponse(200, { items: items });
  } catch (err) {
    return lib.jsonResponse(500, { error: err.message || String(err) });
  }
};
