var lib = require("./_lib");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") return lib.jsonResponse(405, { error: "Method Not Allowed" });
  var apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return lib.jsonResponse(500, { error: "ANTHROPIC_API_KEY가 설정되어 있지 않습니다." });

  try {
    var body = JSON.parse(event.body || "{}");
    var weather = body.weather || "미입력";
    var targets = Array.isArray(body.targets) ? body.targets : []; // [{name, work}]
    var images = Array.isArray(body.images) ? body.images : []; // [{mediaType, data(base64, no prefix)}]
    if (!targets.length) return lib.jsonResponse(400, { error: "targets가 필요합니다." });

    var workList = targets.map(function (t) {
      return "- " + t.name + ": " + ((t.work || "").trim() || "작업 없음");
    }).join("\n");
    var photoNote = images.length ? "\n\n사진이 첨부되어 있습니다. 공종 목록 앞쪽부터 순서대로 참고하세요." : "";

    var promptText =
      "너는 건설 현장 안전관리자를 돕는 도우미다. 아래 공종별 오늘 작업내용을 보고(첨부 사진이 있으면 같이 참고해서), " +
      "산업안전보건기준에 관한 규칙 등 한국 산업안전보건법령에 근거한 구체적이고 간결한 한국어 안전지시사항을 공종별로 " +
      "하나씩 작성해라. 작업 없음인 공종은 \"금일 작업 X\"라고 써라. 현장 전체 대상 일일 안전교육 문구도 한 줄 작성해라. " +
      "날씨: " + weather + "\n\n" + workList + photoNote +
      '\n\nJSON 객체 하나만 출력(다른 설명 금지): {"daily":"...", "items":[{"trade":"공종명","text":"..."}]} ' +
      "items는 위 목록과 순서/이름이 같아야 한다.";

    var content = images.map(function (img) {
      return { type: "image", source: { type: "base64", media_type: img.mediaType, data: img.data } };
    });
    content.push({ type: "text", text: promptText });

    var raw = await lib.callClaude({
      model: "claude-sonnet-5",
      max_tokens: 2048,
      messages: [{ role: "user", content: content }]
    }, apiKey);

    var result = lib.extractJson(raw);
    return lib.jsonResponse(200, result);
  } catch (err) {
    return lib.jsonResponse(500, { error: err.message || String(err) });
  }
};
