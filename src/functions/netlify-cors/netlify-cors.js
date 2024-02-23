const handler = async (event) => {
  try {
    switch (event.httpMethod) {
      case "GET":
        return handleGet(event);
      case "POST":
        return handlePost(event);
      case "OPTIONS":
        return handleOptions(event);
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};

function handleGet(event) {
  return {
    statusCode: 200,
    body: JSON.stringify({ dummyKey: `DummyGetVal` }),
    headers: {},
  };
}

function handlePost(event) {
  return {
    statusCode: 200,
    body: JSON.stringify({ dummyKey: `DummyPostVal` }),
    headers: {
      ...getCorsHeaders(),
    },
  };
}

function handleOptions(event, request) {
  // return {
  //   statusCode: 200,
  //   headers: {
  //     ...getCorsHeaders(),
  //     "Access-Control-Allow-Headers": request.headers.get(
  //       "Access-Control-Request-Headers"
  //     ),
  //   },
  // };
  return new Response(null, {
    headers: {
      ...getCorsHeaders(),
      "Access-Control-Allow-Headers": request.headers.get(
        "Access-Control-Request-Headers"
      ),
    },
  });
}

function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
    "Access-Control-Max-Age": "86400",
  };

}
export default { handler };