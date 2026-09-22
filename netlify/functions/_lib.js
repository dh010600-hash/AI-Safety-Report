// Anthropic API 호출과 JSON 응답 파싱을 두 함수(kakao-parse, ai-suggest)가 공유한다.
async function callClaude(payload, apiKey) {
  var res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    var errText = await res.text();
    throw new Error("Anthropic API 오류 (" + res.status + "): " + errText);
  }
  var data = await res.json();
  var textBlock = (data.content || []).find(function (b) { return b.type === "text"; });
  return textBlock ? textBlock.text : "";
}

// 모델이 ```json 코드펜스로 감싸서 답하는 경우를 대비해 벗겨내고 파싱한다.
function extractJson(text) {
  var t = (text || "").trim();
  var m = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (m) t = m[1].trim();
  return JSON.parse(t);
}

function jsonResponse(statusCode, obj) {
  return {
    statusCode: statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(obj)
  };
}

module.exports = { callClaude: callClaude, extractJson: extractJson, jsonResponse: jsonResponse };
