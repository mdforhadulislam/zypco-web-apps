import { successResponse } from "@/server/common/response";

const apiList = [
  {
    route: "/api/v1",
    method: "ALL",
    description:
      "API version 1 er root. Ekhane sob route-er overview pawa jabe.",
  },
];

export function GET() {
  return successResponse({
    status: 200,
    message: "Welcome to API v1 root. Below are the available routes.",
    data: apiList,
    debug: true,
  });
}

export function POST() {
  return successResponse({
    status: 200,
    message: "Welcome to API v1 root. Below are the available routes.",
    data: apiList,
    debug: true,
  });
}

export function PUT() {
  return successResponse({
    status: 200,
    message: "Welcome to API v1 root. Below are the available routes.",
    data: apiList,
    debug: true,
  });
}

export function DELETE() {
  return successResponse({
    status: 200,
    message: "Welcome to API v1 root. Below are the available routes.",
    data: apiList,
    debug: true,
  });
}

export function PATCH() {
  return successResponse({
    status: 200,
    message: "Welcome to API v1 root. Below are the available routes.",
    data: apiList,
    debug: true,
  });
}
